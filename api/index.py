# -*- coding: utf-8 -*-
"""
=============================================================================
VERCEL SERVERLESS & WEB ROUTER (api/index.py)
Mendukung deployment cloud Vercel (dengan Custom Domain), akses lintas server
(CORS aktif), serta eksekusi lokal melalui Flask WSGI.
=============================================================================
"""

import os
import sys
from pathlib import Path

# Pastikan root proyek selalu terdaftar di sys.path saat dijalankan di Vercel
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from flask import Flask, Response, jsonify, render_template, request, send_from_directory

from backend.assembly_engine import evaluate_power_boot, validate_component_drop
from backend.hardware_catalog import HARDWARE_CATALOG, MOTHERBOARD_INFO
from backend.quiz_bank import get_public_questions, grade_quiz_submission
from backend.storage_manager import (
    append_student_record,
    export_records_to_csv,
    load_all_records,
)

app = Flask(
    __name__,
    template_folder=str(PROJECT_ROOT / "templates"),
    static_folder=str(PROJECT_ROOT / "static"),
    static_url_path="/static",
)
app.config["JSON_AS_ASCII"] = False


@app.after_request
def add_cors_and_security_headers(response):
    """Mengaktifkan CORS terbuka agar dapat diakses atau di-embed oleh domain/server mana pun."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/static/<path:filename>", methods=["GET"])
def serve_static_fallback(filename):
    return send_from_directory(str(PROJECT_ROOT / "static"), filename)


@app.route("/api/health", methods=["GET"])
def api_health():
    return jsonify({
        "status": "online",
        "app": "SIM-HARDWARE 3D PRO",
        "environment": "vercel" if os.environ.get("VERCEL") else "local"
    })


@app.route("/api/components", methods=["GET", "OPTIONS"])
def api_components():
    if request.method == "OPTIONS":
        return ("", 204)
    return jsonify({
        "motherboard": MOTHERBOARD_INFO,
        "catalog": HARDWARE_CATALOG
    })


@app.route("/api/validate-drop", methods=["POST", "OPTIONS"])
def api_validate_drop():
    if request.method == "OPTIONS":
        return ("", 204)
    payload = request.get_json(silent=True) or {}
    result = validate_component_drop(
        component_id=payload.get("component_id", ""),
        target_slot=payload.get("target_slot", ""),
        installed=payload.get("installed", [])
    )
    return jsonify(result)


@app.route("/api/power-on", methods=["POST", "OPTIONS"])
def api_power_on():
    if request.method == "OPTIONS":
        return ("", 204)
    payload = request.get_json(silent=True) or {}
    result = evaluate_power_boot(installed=payload.get("installed", []))
    return jsonify(result)


@app.route("/api/quiz", methods=["GET", "OPTIONS"])
def api_quiz():
    if request.method == "OPTIONS":
        return ("", 204)
    return jsonify({"questions": get_public_questions()})


@app.route("/api/quiz/submit", methods=["POST", "OPTIONS"])
def api_quiz_submit():
    if request.method == "OPTIONS":
        return ("", 204)
    payload = request.get_json(silent=True) or {}
    result = grade_quiz_submission(answers=payload.get("answers", {}))
    return jsonify(result)


@app.route("/api/save-result", methods=["POST", "OPTIONS"])
def api_save_result():
    if request.method == "OPTIONS":
        return ("", 204)
    payload = request.get_json(silent=True) or {}
    result = append_student_record(payload)
    return jsonify(result)


@app.route("/api/teacher/records", methods=["GET", "OPTIONS"])
def api_teacher_records():
    if request.method == "OPTIONS":
        return ("", 204)
    return jsonify({"records": load_all_records()})


@app.route("/api/teacher/export-csv", methods=["GET"])
def api_teacher_export_csv():
    csv_text = export_records_to_csv()
    return Response(
        "\ufeff" + csv_text,
        mimetype="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="Rekap_Nilai_SIM_HARDWARE_3D.csv"'
        },
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)), debug=True)
