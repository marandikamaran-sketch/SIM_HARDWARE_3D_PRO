# -*- coding: utf-8 -*-
"""
Bank Soal Evaluasi Interaktif TIK Kelas VII SMP/MTs (SMPIT Sahabat Alam)
Materi: Sistem Komputer & Perangkat Keras (Hardware)
"""

QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "Komponen perangkat keras berbentuk persegi dengan pelat logam perak dan titik kontak emas yang dipasang di tengah motherboard sebagai otak pemroses perintah disebut...",
        "options": [
            "Random Access Memory (RAM)",
            "Central Processing Unit (CPU / Processor)",
            "Power Supply Unit (PSU)",
            "Solid State Drive (SSD)"
        ],
        "answer_index": 1,
        "explanation": "Processor (CPU) dipasang pada soket tengah motherboard (seperti LGA1700) dan berfungsi mengolah seluruh perhitungan logika serta instruksi komputer."
    },
    {
        "id": 2,
        "question": "Mengapa keping Memory RAM memiliki takik (celah kunci) tidak simetris pada deretan pin emas di bagian bawahnya?",
        "options": [
            "Agar RAM bisa dipasang di slot VGA maupun slot SSD",
            "Untuk mencegah kesalahan arah pemasangan terbalik pada slot DIMM motherboard",
            "Sebagai tempat mengalirkan listrik 220V langsung dari stopkontak",
            "Agar data di dalam RAM tidak hilang saat komputer dimatikan"
        ],
        "answer_index": 1,
        "explanation": "Takik (notch) pada pin emas RAM berfungsi sebagai pengaman fisik agar keping RAM hanya masuk ke slot DIMM dalam posisi yang benar."
    },
    {
        "id": 3,
        "question": "Ketika listrik tiba-tiba padam saat siswa belum menyimpan dokumen yang sedang diketik, data tersebut hilang karena sebelumnya berada di...",
        "options": [
            "SSD NVMe M.2 (Non-Volatile)",
            "Memory RAM (Volatile)",
            "Power Supply Unit (PSU)",
            "Kartu Grafis (VGA)"
        ],
        "answer_index": 1,
        "explanation": "RAM bersifat volatile, artinya hanya menyimpan data sementara selama komputer dialiri listrik."
    },
    {
        "id": 4,
        "question": "Komponen ramping berbentuk papan sirkuit kecil (22x80 mm) yang dipasang mendatar pada slot M.2 motherboard untuk menyimpan Sistem Operasi Windows secara permanen adalah...",
        "options": [
            "VGA Card PCIe x16",
            "SSD NVMe M.2",
            "Kabel Power 24-Pin ATX",
            "Baterai CMOS CR2032"
        ],
        "answer_index": 1,
        "explanation": "SSD NVMe M.2 menyimpan sistem operasi dan file pengguna secara permanen dengan kecepatan baca/tulis tinggi."
    },
    {
        "id": 5,
        "question": "Di manakah posisi pemasangan Power Supply Unit (PSU) yang benar saat merakit komputer desktop?",
        "options": [
            "Menempel langsung di atas soket prosesor motherboard",
            "Ditancapkan pada slot PCIe x16 di sebelah RAM",
            "Dipasang pada ruang dudukan PSU di luar papan motherboard, lalu dihubungkan dengan kabel daya",
            "Ditempelkan di bagian belakang layar monitor"
        ],
        "answer_index": 2,
        "explanation": "PSU dipasang di ruang casing di luar area motherboard dan menyalurkan daya ke motherboard melalui kabel 24-Pin ATX serta 8-Pin PCIe."
    },
    {
        "id": 6,
        "question": "Apa yang terjadi jika seluruh komponen motherboard sudah terpasang, tetapi kabel 24-Pin ATX dari PSU lupa dicolokkan ke motherboard saat tombol Power ditekan?",
        "options": [
            "Komputer langsung masuk ke desktop Windows dengan normal",
            "Aliran daya listrik ke motherboard terputus sehingga komputer gagal menyala (Boot Error)",
            "Monitor menampilkan gambar lebih tajam",
            "Kipas VGA berputar dua kali lebih cepat"
        ],
        "answer_index": 1,
        "explanation": "Tanpa kabel 24-Pin ATX yang mencolok dari PSU ke motherboard, papan sirkuit utama tidak menerima daya listrik."
    },
    {
        "id": 7,
        "question": "Kartu ekspansi berkipas ganda dengan konektor emas panjang yang ditancapkan pada slot PCIe x16 bertulang baja di motherboard untuk menampilkan grafis ke monitor adalah...",
        "options": [
            "VGA / GPU Card",
            "Sound Card",
            "Processor LGA1700",
            "Heatsink VRM"
        ],
        "answer_index": 0,
        "explanation": "VGA / GPU Card mengolah pemrosesan grafis dan menghubungkan komputer ke monitor melalui port HDMI atau DisplayPort."
    },
    {
        "id": 8,
        "question": "Urutan siklus pemrosesan informasi dasar pada sistem komputer yang benar adalah...",
        "options": [
            "Output → Process → Input → Storage",
            "Input → Process → Output & Storage",
            "Storage → Output → Process → Input",
            "Process → Input → Storage → Output"
        ],
        "answer_index": 1,
        "explanation": "Data dimasukkan melalui Input Device, diolah di Processing Device (CPU & RAM), lalu ditampilkan lewat Output Device atau disimpan di Storage Device."
    }
]


def get_public_questions() -> list:
    """Mengembalikan daftar soal tanpa kunci jawaban untuk dikirim ke frontend."""
    return [
        {
            "id": q["id"],
            "question": q["question"],
            "options": q["options"]
        }
        for q in QUIZ_QUESTIONS
    ]


def grade_quiz_submission(answers: dict) -> dict:
    """Menilai jawaban kuis siswa di backend Python."""
    total = len(QUIZ_QUESTIONS)
    correct_count = 0
    details = []

    for q in QUIZ_QUESTIONS:
        qid_str = str(q["id"])
        user_choice = answers.get(qid_str, -1)
        is_correct = (user_choice == q["answer_index"])
        if is_correct:
            correct_count += 1
        details.append({
            "id": q["id"],
            "question": q["question"],
            "user_choice": user_choice,
            "correct_index": q["answer_index"],
            "correct_text": q["options"][q["answer_index"]],
            "is_correct": is_correct,
            "explanation": q["explanation"]
        })

    score = round((correct_count / total) * 100) if total > 0 else 0
    return {
        "score": score,
        "correct_count": correct_count,
        "total_questions": total,
        "passed": score >= 75,
        "details": details
    }

