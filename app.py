#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
SIM-HARDWARE 3D PRO — LOCAL LAUNCHER (app.py)
Menjalankan server web Python di komputer lokal dengan auto-open browser.
- Jika Flask terinstal, menjalankan WSGI app yang sama dengan Vercel (`api/index.py`).
- Jika Flask belum terinstal di PC lokal, otomatis fallback ke `ThreadingHTTPServer`
  bawaan Python tanpa perlu instalasi tambahan!
=============================================================================
"""

import json
import mimetypes
import socket
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from backend.assembly_engine import evaluate_power_boot, validate_component_drop
from backend.hardware_catalog import HARDWARE_CATALOG, MOTHERBOARD_INFO
from backend.quiz_bank import get_public_questions, grade_quiz_submission
from backend.storage_manager import (
    append_student_record,
    export_records_to_csv,
    load_all_records,
)

BASE_DIR = Path(__file__).resolve().parent


def find_free_port(start_port: int = 8080) -> int:
    for p in range(start_port, start_port + 30):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", p)) != 0:
                return p
    return 8080


class LocalFallbackHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _set_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json(self, data: dict, status: int = 200):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._set_cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _send_file(self, file_path: Path):
        if not file_path.exists() or not file_path.is_file():
            self.send_error(404, "File Not Found")
            return
        mime, _ = mimetypes.guess_type(str(file_path))
        if file_path.suffix == ".js":
            mime = "application/javascript; charset=utf-8"
        elif file_path.suffix == ".css":
            mime = "text/css; charset=utf-8"
        elif file_path.suffix == ".html":
            mime = "text/html; charset=utf-8"
        content = file_path.read_bytes()
        self.send_response(200)
        self._set_cors()
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def _read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            self._send_file(BASE_DIR / "templates" / "index.html")
        elif path == "/export_models.html":
            self._send_file(BASE_DIR / "export_models.html")
        elif path.startswith("/static/"):
            rel = path.lstrip("/")
            safe_target = (BASE_DIR / rel).resolve()
            if str(safe_target).startswith(str((BASE_DIR / "static").resolve())):
                self._send_file(safe_target)
            else:
                self.send_error(403, "Forbidden")
        elif path == "/api/health":
            self._send_json({"status": "online", "app": "SIM-HARDWARE 3D PRO", "environment": "local-stdlib"})
        elif path == "/api/components":
            self._send_json({"motherboard": MOTHERBOARD_INFO, "catalog": HARDWARE_CATALOG})
        elif path == "/api/quiz":
            self._send_json({"questions": get_public_questions()})
        elif path == "/api/teacher/records":
            self._send_json({"records": load_all_records()})
        elif path == "/api/teacher/export-csv":
            csv_text = export_records_to_csv().encode("utf-8-sig")
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "text/csv; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="Rekap_Nilai_SIM_HARDWARE_3D.csv"')
            self.send_header("Content-Length", str(len(csv_text)))
            self.end_headers()
            self.wfile.write(csv_text)
        else:
            self.send_error(404, "Endpoint Not Found")

    def do_POST(self):
        path = urlparse(self.path).path
        payload = self._read_json_body()

        if path == "/api/validate-drop":
            result = validate_component_drop(
                component_id=payload.get("component_id", ""),
                target_slot=payload.get("target_slot", ""),
                installed=payload.get("installed", [])
            )
            self._send_json(result)
        elif path == "/api/power-on":
            result = evaluate_power_boot(installed=payload.get("installed", []))
            self._send_json(result)
        elif path == "/api/quiz/submit":
            result = grade_quiz_submission(answers=payload.get("answers", {}))
            self._send_json(result)
        elif path == "/api/save-result":
            result = append_student_record(payload)
            self._send_json(result)
        else:
            self.send_error(404, "POST Endpoint Not Found")


def main():
    port = find_free_port(8080)
    url = f"http://127.0.0.1:{port}"

    print("=" * 72)
    print("  SIM-HARDWARE 3D PRO — MEDIA PEMBELAJARAN INTERAKTIF BERBASIS PYTHON")
    print("  Siap Lokal, GitHub, & Vercel Custom Domain • SMPIT Sahabat Alam")
    print("=" * 72)
    print(f"  [OK] Server Web Lokal : {url}")
    print(f"  [OK] Entrypoint Cloud : {BASE_DIR / 'api' / 'index.py'}")
    print(f"  [OK] Konfigurasi DNS  : {BASE_DIR / 'vercel.json'}")
    print("=" * 72)

    threading.Timer(0.9, lambda: webbrowser.open(url)).start()

    try:
        from api.index import app as flask_app
        flask_app.run(host="0.0.0.0", port=port, debug=False)
    except ImportError:
        server = ThreadingHTTPServer(("0.0.0.0", port), LocalFallbackHandler)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            server.server_close()


if __name__ == "__main__":
    main()
