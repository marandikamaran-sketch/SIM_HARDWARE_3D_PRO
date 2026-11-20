# -*- coding: utf-8 -*-
"""Katalog komponen untuk simulator perakitan PC 3D SMP/MTs."""

MOTHERBOARD_INFO = {
    "id": "motherboard",
    "name": "Motherboard ATX Z790-PRO DDR4",
    "subtitle": "Papan Sirkuit Utama (Mainboard) • Socket LGA1700",
    "category": "Processing & Interconnect Hub",
    "physical_appearance": "Papan PCB fiberglass hijau-gelap/hitam dengan jalur sirkuit, kapasitor, heatsink aluminium, soket CPU, empat slot DDR4, slot M.2, dan slot VGA.",
    "description": "Motherboard adalah papan utama tempat processor, RAM, SSD, VGA, dan kabel daya terhubung.",
    "analogy": "Seperti jalan raya yang menghubungkan semua tempat penting di sebuah kota.",
    "specs": "ATX • LGA1700 • 4x DDR4 DIMM • M.2 NVMe • PCIe x16 • ATX 24-pin"
}

HARDWARE_CATALOG = {
    "cpu": {
        "id": "cpu", "name": "Processor (CPU)", "short_name": "Intel Core i9-14900K",
        "subtitle": "Intel Core i9-14900K • Socket LGA1700", "category": "Perangkat Pemroses",
        "target_slot": "slot_cpu", "slot_label": "Soket Processor LGA1700 di tengah motherboard",
        "order_hint": 1, "requires": [],
        "physical_appearance": "Keping persegi dengan substrate hijau, pelat logam perak (IHS), kontak emas LGA, dan tanda orientasi.",
        "description": "CPU adalah otak komputer yang menjalankan instruksi dan mengolah data.",
        "analogy": "Seperti otak yang mengatur pekerjaan tubuh.",
        "specs": "24 Core • 32 Thread • Socket LGA1700"
    },
    "cpuCooler": {
        "id": "cpuCooler", "name": "Kipas & Heatsink Processor", "short_name": "CPU Cooler 120mm",
        "subtitle": "Pendingin udara CPU • kipas 120 mm + heatsink", "category": "Pendingin Processor",
        "target_slot": "slot_cpu_cooler", "slot_label": "Dudukan pendingin tepat di atas processor",
        "order_hint": 2, "requires": ["cpu"],
        "physical_appearance": "Pendingin CPU terpisah dengan cold plate, heatpipe tembaga, sirip aluminium, rangka kipas 120 mm, rotor bilah, hub, dan titik pengunci.",
        "description": "Kipas dan heatsink membantu membuang panas dari processor. Pasang setelah processor berada pada soketnya.",
        "analogy": "Seperti kipas dan radiator yang menjaga mesin agar tidak terlalu panas.",
        "specs": "Air Cooler • Fan 120 mm • Heatpipe tembaga • Heatsink aluminium"
    },
    "ram1": {
        "id": "ram1", "name": "RAM DDR4 8GB — Slot A2", "short_name": "RAM 8GB • A2",
        "subtitle": "Keping pertama • pasang satu per satu", "category": "Memori Sementara",
        "target_slot": "slot_ram_a2", "slot_label": "Slot DIMM A2 (slot kedua dari arah processor)",
        "order_hint": 3, "requires": ["cpu", "cpuCooler"],
        "physical_appearance": "Satu keping DDR4 UDIMM dengan PCB hijau gelap, chip DRAM hitam pada kedua sisi, komponen SMD, jalur sirkuit, dan kontak emas 288-pin.",
        "description": "RAM menyimpan data sementara yang sedang dipakai komputer. Keping pertama dipasang pada slot A2.",
        "analogy": "Seperti meja belajar untuk menaruh buku yang sedang digunakan.",
        "specs": "8 GB • DDR4 • 3200 MT/s • 288-pin UDIMM"
    },
    "ram2": {
        "id": "ram2", "name": "RAM DDR4 8GB — Slot B2", "short_name": "RAM 8GB • B2",
        "subtitle": "Keping kedua • pasang setelah RAM pertama", "category": "Memori Sementara",
        "target_slot": "slot_ram_b2", "slot_label": "Slot DIMM B2 (slot keempat dari arah processor)",
        "order_hint": 4, "requires": ["cpu", "cpuCooler", "ram1"],
        "physical_appearance": "Satu keping DDR4 UDIMM dengan PCB hijau gelap, chip DRAM hitam pada kedua sisi, komponen SMD, jalur sirkuit, dan kontak emas 288-pin.",
        "description": "Keping RAM kedua melengkapi pasangan memori 2 × 8 GB. Pasang secara terpisah pada slot B2.",
        "analogy": "Seperti menambahkan meja belajar kedua agar ruang kerja lebih luas.",
        "specs": "8 GB • DDR4 • 3200 MT/s • 288-pin UDIMM"
    },
    "ssd": {
        "id": "ssd", "name": "SSD NVMe M.2 1TB", "short_name": "SSD NVMe M.2",
        "subtitle": "PCIe Gen4 x4 • Ukuran 2280 (22x80 mm)", "category": "Penyimpanan Data",
        "target_slot": "slot_ssd", "slot_label": "Slot M.2 NVMe di permukaan motherboard",
        "order_hint": 5, "requires": [],
        "physical_appearance": "Modul M.2 2280 dengan PCB hijau gelap, chip controller, NAND Flash, komponen SMD, kontak emas M-Key, dan lubang baut.",
        "description": "SSD menyimpan sistem operasi, aplikasi, dan dokumen secara permanen.",
        "analogy": "Seperti lemari arsip untuk menyimpan berkas.",
        "specs": "1 TB • NVMe PCIe 4.0 x4 • M.2 2280"
    },
    "vga": {
        "id": "vga", "name": "VGA / GPU Card", "short_name": "VGA RTX 4080 SUPER",
        "subtitle": "NVIDIA GeForce RTX 4080 SUPER • 16GB GDDR6X", "category": "Pengolah Grafis",
        "target_slot": "slot_vga", "slot_label": "Slot PCIe x16 pada motherboard",
        "order_hint": 6, "requires": [],
        "physical_appearance": "Kartu grafis dengan shroud logam, tiga kipas, heatsink, heatpipe, backplate, konektor PCIe, dan soket daya tambahan.",
        "description": "GPU mengolah grafis dan mengirimkan sinyal gambar ke monitor.",
        "analogy": "Seperti pelukis yang membuat gambar untuk ditampilkan pada layar.",
        "specs": "16 GB GDDR6X • PCIe 4.0 x16 • HDMI • DisplayPort"
    },
    "psu": {
        "id": "psu", "name": "Power Supply (PSU)", "short_name": "PSU 850W Gold",
        "subtitle": "850W 80+ Gold ATX 3.1", "category": "Sumber Daya Listrik",
        "target_slot": "slot_psu", "slot_label": "Ruang dudukan PSU di casing",
        "order_hint": 7, "requires": [],
        "physical_appearance": "Kotak baja ATX dengan kipas, kisi ventilasi, label daya, soket AC, dan panel konektor modular.",
        "description": "PSU mengubah listrik AC dari stopkontak menjadi tegangan DC untuk komponen komputer.",
        "analogy": "Seperti gardu listrik yang membagikan energi ke setiap bagian rumah.",
        "specs": "850 Watt • 80+ Gold • ATX 3.1 • Modular"
    },
    "cable": {
        "id": "cable", "name": "Kabel Power ATX 24-Pin", "short_name": "Kabel Daya ATX",
        "subtitle": "Kabel daya PSU ke motherboard", "category": "Kabel Daya",
        "target_slot": "slot_cable", "slot_label": "Port ATX 24-pin di tepi kanan motherboard",
        "order_hint": 8, "requires": ["psu"],
        "physical_appearance": "Berkas kabel daya berwarna dengan kepala konektor plastik 24-pin serta cabang konektor daya VGA.",
        "description": "Kabel ini menyalurkan daya dari PSU ke motherboard.",
        "analogy": "Seperti kabel listrik yang menghubungkan sumber daya dengan perangkat.",
        "specs": "ATX 24-pin • PCIe 8-pin"
    }
}

SLOT_ERROR_MESSAGES = {
    ("cpu", "slot_ram_a2"): "Processor hanya dipasang pada soket CPU di tengah motherboard.",
    ("cpu", "slot_ram_b2"): "Processor hanya dipasang pada soket CPU di tengah motherboard.",
    ("cpuCooler", "slot_cpu"): "Kipas dan heatsink dipasang setelah CPU, pada area tepat di atas processor.",
    ("ram1", "slot_ram_b2"): "Keping RAM pertama diarahkan ke slot A2. Slot B2 digunakan untuk keping kedua.",
    ("ram2", "slot_ram_a2"): "Keping RAM kedua diarahkan ke slot B2. Slot A2 digunakan untuk keping pertama.",
    ("ram1", "slot_cpu"): "RAM tidak dipasang pada soket processor. Arahkan ke slot DIMM A2.",
    ("ram2", "slot_cpu"): "RAM tidak dipasang pada soket processor. Arahkan ke slot DIMM B2.",
}
