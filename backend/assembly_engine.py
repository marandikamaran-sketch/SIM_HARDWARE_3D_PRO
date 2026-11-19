# -*- coding: utf-8 -*-
"""
Mesin Validasi Perakitan PC 3D & Simulasi POST BIOS
Memeriksa kompatibilitas slot, prasyarat pemasangan, dan diagnostik boot.
"""

from backend.hardware_catalog import HARDWARE_CATALOG, SLOT_ERROR_MESSAGES


def validate_component_drop(component_id: str, target_slot: str, installed: list) -> dict:
    """Memvalidasi apakah komponen 3D dijatuhkan pada slot yang benar."""
    if component_id not in HARDWARE_CATALOG:
        return {
            "valid": False,
            "code": "ERR_UNKNOWN_COMPONENT",
            "title": "Komponen Tidak Dikenal",
            "message": "Perangkat keras yang dipilih tidak dikenali oleh sistem."
        }

    comp = HARDWARE_CATALOG[component_id]

    if component_id in installed:
        return {
            "valid": False,
            "code": "ERR_ALREADY_INSTALLED",
            "title": "Komponen Sudah Terpasang",
            "message": f"{comp['name']} sudah menempel dengan benar pada {comp['slot_label']}."
        }

    for req_id in comp.get("requires", []):
        if req_id not in installed:
            req_name = HARDWARE_CATALOG[req_id]["name"]
            return {
                "valid": False,
                "code": "ERR_PREREQUISITE_MISSING",
                "title": "Urutan Perakitan Belum Tepat!",
                "message": f"Pasang {req_name} di luar motherboard terlebih dahulu sebelum mencolokkan {comp['name']} ke motherboard!"
            }

    if target_slot != comp["target_slot"]:
        err_msg = SLOT_ERROR_MESSAGES.get(
            (component_id, target_slot),
            f"SLOT TIDAK COCOK! {comp['name']} tidak dapat dipasang pada slot tersebut. Target yang benar: {comp['slot_label']}."
        )
        return {
            "valid": False,
            "code": "ERR_SLOT_MISMATCH",
            "title": "Peringatan Error Perakitan!",
            "message": err_msg
        }

    return {
        "valid": True,
        "code": "OK_INSTALLED",
        "title": f"{comp['name']} Terpasang Presisi!",
        "message": f"Sempurna! {comp['name']} berhasil dipasang dan terkunci pada {comp['slot_label']}.",
        "component": comp
    }


def evaluate_power_boot(installed: list) -> dict:
    """Mengevaluasi status sistem saat tombol Power di casing ditekan."""
    required_parts = ["cpu", "ram", "ssd", "vga", "psu", "cable"]
    missing_names = [HARDWARE_CATALOG[pid]["name"] for pid in required_parts if pid not in installed]

    if missing_names:
        if "psu" not in installed or "cable" not in installed:
            error_code = "ERR_NO_POWER_SUPPLY (0x000000A5)"
            detail = (
                "Tidak ada daya listrik masuk ke motherboard! Pastikan unit Power Supply (PSU) "
                "sudah dipasang di luar motherboard dan Kabel Power 24-Pin sudah dicolokkan ke motherboard."
            )
        elif "cpu" not in installed:
            error_code = "ERR_CPU_NOT_DETECTED (5 Short Beeps)"
            detail = (
                "POST BIOS Gagal: Processor (CPU) belum terpasang pada Soket LGA1700 di tengah motherboard!"
            )
        elif "ram" not in installed:
            error_code = "ERR_MEMORY_MISSING (1 Long, 2 Short Beeps)"
            detail = (
                "POST BIOS Gagal: Keping Memory RAM belum terpasang di Slot DIMM motherboard!"
            )
        elif "vga" not in installed:
            error_code = "ERR_NO_VIDEO_OUTPUT (1 Long, 3 Short Beeps)"
            detail = (
                "Monitor tidak menerima sinyal gambar karena VGA / GPU Card belum terpasang di slot PCIe x16!"
            )
        else:
            error_code = "ERR_INACCESSIBLE_BOOT_DEVICE (0x0000007B)"
            detail = (
                "Komputer menyala ke BIOS, tetapi gagal masuk Windows karena SSD NVMe M.2 belum terpasang di motherboard!"
            )

        return {
            "boot_success": False,
            "error_code": error_code,
            "missing": missing_names,
            "message": detail
        }

    return {
        "boot_success": True,
        "error_code": "POST_OK_1_BEEP",
        "missing": [],
        "message": "Semua 6 komponen terpasang sempurna! POST BIOS berhasil dan sistem operasi Windows 11 tampil di monitor."
    }

