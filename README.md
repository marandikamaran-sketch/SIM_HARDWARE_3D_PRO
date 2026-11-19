# SIM-HARDWARE 3D PRO — Arsitektur Modular Python + Vercel + GitHub

Media Pembelajaran Interaktif (MPI) berbasis web dengan sistem backend **Python Flask Modular** dan visualisasi **3D PBR Realistis** untuk mata pelajaran **Teknologi Informasi dan Komunikasi (TIK) / Informatika Kelas VII SMP/MTs (SMPIT Sahabat Alam)**.

Dirancang siap di-upload ke **GitHub**, di-deploy ke **Vercel**, dihubungkan ke **Custom Domain**, serta mendukung **CORS** sehingga dapat dibuka dari server maupun browser mana pun.

---

## Struktur Folder Proyek

```text
SIM_HARDWARE_3D_PRO/
├── api/                        # Entrypoint Serverless Cloud untuk Vercel
│   ├── __init__.py
│   └── index.py                # Aplikasi Flask WSGI, CORS Router, & REST API
├── backend/                    # Modul logika backend Python terpisah
│   ├── __init__.py
│   ├── hardware_catalog.py     # Katalog bentuk fisik nyata, warna, slot target, & analogi
│   ├── assembly_engine.py      # Mesin validasi drag-and-drop 3D & diagnostik POST BIOS
│   ├── quiz_bank.py            # Bank soal evaluasi interaktif TIK Kelas VII
│   └── storage_manager.py      # Penyimpanan nilai (Lokal JSON + Vercel /tmp otomatis)
├── static/                     # Aset Frontend terpisah (disajikan cepat via Vercel CDN)
│   ├── css/
│   │   └── style.css           # Styling laboratorium gelap & format cetak sertifikat
│   └── js/
│       ├── textures_pbr.js     # Tekstur PBR komponen perangkat keras asli
│       ├── models_3d.js        # Pembangun model 3D komponen hardware seperti aslinya
│       └── main.js             # Logika interaksi 3D, galeri 360°, kuis, & rekap guru
├── templates/
│   └── index.html              # Antarmuka utama 4 modul pembelajaran
├── data/
│   └── hasil_praktikum.json    # Rekap nilai praktikum siswa (mode lokal)
├── app.py                      # Launcher untuk menjalankan di komputer lokal
├── vercel.json                 # Konfigurasi routing Python & Static CDN untuk Vercel
├── requirements.txt            # Dependensi Python (Flask)
└── .gitignore                  # Pengabaian file cache Python untuk GitHub
```

---

## Panduan Upload ke GitHub & Deploy ke Vercel dengan Custom Domain

### Langkah 1: Upload Proyek ke GitHub
1. Ekstrak folder `SIM_HARDWARE_3D_PRO` dari file ZIP.
2. Buat repository baru di [github.com](https://github.com) dengan nama misalnya `sim-hardware-3d-pro`.
3. Upload seluruh isi folder `SIM_HARDWARE_3D_PRO` (pastikan file `vercel.json`, `requirements.txt`, folder `api/`, `backend/`, `static/`, `templates/`, dan `data/` ikut ter-upload) atau jalankan lewat Git terminal:
   ```bash
   cd SIM_HARDWARE_3D_PRO
   git init
   git add .
   git commit -m "Deploy SIM-HARDWARE 3D PRO Modular Python"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/sim-hardware-3d-pro.git
   git push -u origin main
   ```

### Langkah 2: Deploy Otomatis ke Vercel
1. Login ke [vercel.com](https://vercel.com) menggunakan akun GitHub Anda.
2. Klik **Add New... → Project**, lalu pilih repository `sim-hardware-3d-pro`.
3. Biarkan pengaturan default (Vercel otomatis membaca `vercel.json` dan `requirements.txt`), lalu klik **Deploy**.
4. Dalam ±30 detik aplikasi langsung online dan dapat dibuka dari perangkat mana pun!

### Langkah 3: Menghubungkan Domain Sendiri (Custom Domain)
1. Buka proyek Anda di Dashboard Vercel → masuk ke tab **Settings → Domains**.
2. Ketik nama domain Anda (contoh: `rakitpc.smpitsahabatalam.sch.id` atau `simhardware.my.id`) lalu klik **Add**.
3. Tambahkan DNS Record pada penyedia domain Anda sesuai instruksi Vercel:
   - **Untuk Subdomain** (misal `rakitpc.domainanda.com`): Tambahkan **CNAME Record** dengan Name `rakitpc` mengarah ke `cname.vercel-dns.com`.
   - **Untuk Domain Utama** (misal `domainanda.com`): Tambahkan **A Record** dengan Name `@` mengarah ke `76.76.21.21`.
4. Sertifikat keamanan **HTTPS / SSL** akan aktif otomatis sehingga siswa dan guru dapat mengaksesnya dari server mana pun.

---

## Menjalankan di Komputer Lokal
```bash
pip install -r requirements.txt
python app.py
```
