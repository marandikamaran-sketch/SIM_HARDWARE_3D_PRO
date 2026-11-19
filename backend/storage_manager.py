# -*- coding: utf-8 -*-
"""
Pengelola Penyimpanan Hasil Praktikum Rakit PC & Nilai Evaluasi Siswa
Mendukung penyimpanan lokal (data/hasil_praktikum.json) maupun lingkungan
Serverless Cloud seperti Vercel (/tmp/sim_hardware_hasil_praktikum.json).
"""

import csv
import io
import json
import os
from datetime import datetime
from pathlib import Path

BUNDLED_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "hasil_praktikum.json"
TMP_DATA_PATH = Path("/tmp/sim_hardware_hasil_praktikum.json")


def _resolve_storage_path() -> Path:
    """Menentukan path penyimpanan yang dapat ditulis pada Local maupun Vercel."""
    if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
        if not TMP_DATA_PATH.exists() and BUNDLED_DATA_PATH.exists():
            try:
                TMP_DATA_PATH.write_text(BUNDLED_DATA_PATH.read_text(encoding="utf-8"), encoding="utf-8")
            except Exception:
                pass
        return TMP_DATA_PATH

    try:
        BUNDLED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        probe = BUNDLED_DATA_PATH.parent / ".probe"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink(missing_ok=True)
        return BUNDLED_DATA_PATH
    except OSError:
        return TMP_DATA_PATH


def load_all_records() -> list:
    target = _resolve_storage_path()
    if not target.exists():
        if BUNDLED_DATA_PATH.exists():
            try:
                return json.loads(BUNDLED_DATA_PATH.read_text(encoding="utf-8"))
            except Exception:
                return []
        return []
    try:
        return json.loads(target.read_text(encoding="utf-8"))
    except Exception:
        return []


def append_student_record(payload: dict) -> dict:
    records = load_all_records()
    record = {
        "id": len(records) + 1,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "student_name": str(payload.get("student_name", "Siswa Kelas VII"))[:60],
        "student_class": str(payload.get("student_class", "VII SMPIT Sahabat Alam"))[:40],
        "assembly_score": int(payload.get("assembly_score", 100)),
        "quiz_score": payload.get("quiz_score", None),
        "errors_count": int(payload.get("errors_count", 0)),
        "duration_seconds": int(payload.get("duration_seconds", 0)),
        "status": str(payload.get("status", "LULUS PRAKTIKUM 3D"))
    }
    records.append(record)
    target = _resolve_storage_path()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")
    return {"saved": True, "record": record, "total": len(records)}


def export_records_to_csv() -> str:
    records = load_all_records()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "No", "Waktu Selesai", "Nama Siswa", "Kelas",
        "Skor Rakit PC 3D", "Skor Kuis", "Jumlah Error", "Durasi (Detik)", "Status"
    ])
    for r in records:
        writer.writerow([
            r.get("id", ""),
            r.get("timestamp", ""),
            r.get("student_name", ""),
            r.get("student_class", ""),
            r.get("assembly_score", 0),
            r.get("quiz_score") if r.get("quiz_score") is not None else "-",
            r.get("errors_count", 0),
            r.get("duration_seconds", 0),
            r.get("status", "")
        ])
    return output.getvalue()
