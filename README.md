# SIM-HARDWARE 3D PRO (RAKITA 3D) — Siap Upload ke GitHub & Deploy ke Vercel

Media Pembelajaran Interaktif (MPI) berbasis web dengan visualisasi **3D WebGL PBR Realistis 360°** dan arsitektur **Python Flask Modular** untuk mata pelajaran **Teknologi Informasi dan Komunikasi (TIK) / Informatika Kelas VII SMP/MTs (SMPIT Sahabat Alam)**.

---

## Struktur Repository GitHub

```text
SIM_HARDWARE_3D_PRO/
├── api/
│   ├── __init__.py
│   └── index.py                # Entrypoint Python Serverless untuk Vercel
├── backend/
│   ├── __init__.py
│   ├── assembly_engine.py      # Validasi slot perakitan PC & diagnostik POST BIOS
│   ├── hardware_catalog.py     # Katalog spesifikasi fisik & analogi komponen
│   ├── quiz_bank.py            # Bank soal evaluasi TIK Kelas VII
│   └── storage_manager.py      # Penyimpanan nilai praktikum (JSON & CSV)
├── static/
│   ├── css/
│   │   └── style.css           # Styling antarmuka gelap & format cetak sertifikat
│   └── js/
│       ├── textures_pbr.js     # Generator tekstur PBR (Casing Armaggeddon, RTX, RAM Hijau, Samsung)
│       ├── models_3d.js        # Model 3D realistis seluruh komponen hardware
│       └── main.js             # Mesin interaksi 3D, galeri 360°, kuis, & rekap guru
├── templates/
│   └── index.html              # Template HTML untuk server Python Flask / Vercel
├── data/
│   └── hasil_praktikum.json    # Database lokal riwayat praktikum siswa
├── index.html                  # Halaman utama root (mendukung GitHub Pages & buka langsung)
├── app.py                      # Launcher server web lokal (Windows / macOS / Linux)
├── vercel.json                 # Konfigurasi routing Python & Static CDN Vercel
├── requirements.txt            # Dependensi Python (Flask)
└── .gitignore                  # Pengabaian file sementara Python
```

---

## Cara Upload ke GitHub

1. **Ekstrak file ZIP** ini sehingga muncul folder `SIM_HARDWARE_3D_PRO`.
2. Buka [github.com](https://github.com) → klik **New repository** → beri nama misalnya `sim-hardware-3d-pro` → klik **Create repository**.
3. Upload **seluruh isi** di dalam folder `SIM_HARDWARE_3D_PRO` (pastikan file `index.html`, `app.py`, `vercel.json`, `requirements.txt`, serta folder `api/`, `backend/`, `static/`, `templates/`, dan `data/` ikut ter-upload) melalui menu **uploading an existing file** atau via terminal Git:
   ```bash
   cd SIM_HARDWARE_3D_PRO
   git init
   git add .
   git commit -m "Initial commit: SIM-HARDWARE 3D PRO"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/sim-hardware-3d-pro.git
   git push -u origin main
   ```

---

## Cara Deploy Online (Vercel atau GitHub Pages)

### Opsi A: Deploy ke Vercel (Full-Stack Python + 3D Web) — Direkomendasikan
1. Buka [vercel.com](https://vercel.com) → login dengan GitHub → klik **Add New... → Project**.
2. Pilih repository `sim-hardware-3d-pro` lalu klik **Deploy**.
3. Selesai! Aplikasi langsung online lengkap dengan API Python dan ekspor nilai `.CSV`.

### Opsi B: Deploy ke GitHub Pages (Gratis Tanpa Konfigurasi)
1. Buka repository GitHub Anda → masuk ke **Settings → Pages**.
2. Pada bagian **Build and deployment → Branch**, pilih `main` dan folder `/ (root)`, lalu klik **Save**.
3. Dalam 1 menit, simulator 3D langsung aktif secara online!

---

## Cara Menjalankan di Komputer Lokal
```bash
pip install -r requirements.txt
python app.py
```
Lalu buka browser ke `http://127.0.0.1:8080`.

## Ekspor Komponen Menjadi File 3D (.GLB)

Proyek ini membuat beberapa objek 3D secara prosedural melalui `static/js/models_3d.js`, bukan menyimpan semuanya sebagai gambar JPG/PNG. Untuk mengunduh komponen sebagai model 3D:

1. Jalankan proyek secara lokal sesuai petunjuk di atas (`python app.py`).
2. Buka `http://127.0.0.1:8080/export_models.html`.
3. Klik tombol ekspor untuk motherboard, CPU, RAM, SSD, VGA, PSU, atau kabel.
4. Pindahkan file `.glb` yang terunduh ke `static/models/` pada proyek.
5. Muat file `.glb` pada halaman web tujuan menggunakan Three.js `GLTFLoader`, lalu atur skala, posisi, rotasi, dan titik snap sesuai slot motherboard.

Catatan: halaman ekspor memerlukan koneksi internet untuk memuat Three.js dan GLTFExporter dari CDN. Casing/ruang meja pada scene utama dirakit langsung di `static/js/main.js` dan belum disediakan sebagai builder terpisah pada halaman ekspor ini.


## Pembaruan model RAM DDR4

Model RAM pada tray perakitan, slot motherboard, galeri inspeksi, dan halaman ekspor GLB menggunakan builder DDR4 UDIMM yang sama. Pada sesi praktik, setiap RAM dibuat sebagai satu objek terpisah (8GB per keping), sehingga siswa harus menyeret RAM pertama ke A2 lalu RAM kedua ke B2. Model menampilkan PCB hijau bertekstur, chip DRAM pada kedua sisi, label 8GB, komponen SMD, jalur sirkuit, takik kunci, dan kontak emas.

Platform latihan diselaraskan ke motherboard ATX Z790 DDR4 + Intel Core i9-14900K (LGA1700) agar tipe RAM DDR4 konsisten dengan soket CPU dan papan utama.


## Pembaruan model hardware realistis

Builder 3D kini menampilkan motherboard ATX dengan heatsink VRM bersirip, kapasitor solid, port I/O, header daya, port SATA, lubang baut, baterai CMOS, detail PCB, dan area ekspansi. Processor menampilkan IHS logam, substrate, kontak LGA pada bagian bawah, serta penanda orientasi. PSU menampilkan kipas 120 mm dengan grille, panel modular, label daya, soket AC, dan sakelar. VGA menampilkan tiga kipas aksial berbilah melengkung, sirip heatsink, heatpipe tembaga, backplate, bracket I/O, serta konektor PCIe. SSD M.2 2280 menampilkan controller, NAND, komponen SMD, kontak M-Key, dan lubang baut.

Konfigurasi materi diseragamkan untuk latihan: Z790 DDR4 + Intel Core i9-14900K + RAM DDR4-3200 + SSD NVMe Gen4 + GPU RTX 4080 SUPER 16GB + PSU 850W Gold. Bentuk model bersifat ilustrasi edukasi dan tidak menyalin satu SKU/produk vendor tertentu secara presisi.


## Pembaruan antarmuka dan perakitan (20 November 2026)

- Kabel ATX 24-pin kini memiliki dua kepala konektor: sisi modular PSU dan sisi 24-pin motherboard. Titik akhir konektor motherboard diselaraskan dengan header ATX pada motherboard virtual.
- Setelah CPU dipasang, siswa harus mengambil kipas dan heatsink CPU sebagai komponen 3D terpisah lalu men-drag-nya ke atas processor. Kipas mulai berputar ketika simulasi komputer dinyalakan.
- Tombol **Fullscreen** memperbesar area laboratorium 3D ke layar penuh. Browser/perangkat yang membatasi Fullscreen API menggunakan fallback layar penuh berbasis CSS.
- Tombol **Mode Terang / Mode Gelap** mengubah tema web dan menyimpan preferensi di browser.
- Kontrol sentuh menggunakan Pointer Events dan area kanvas tetap memakai `touch-action: none` agar gestur drag dan putar tidak memicu scroll halaman.

Jalankan dengan `python app.py`, lalu buka alamat lokal yang ditampilkan di terminal. Untuk fullscreen, tekan tombol **Fullscreen** pada panel 3D.

## Alur praktikum siswa SMP/MTs — delapan komponen

1. Isi nama dan kelas pada kolom identitas di bagian atas.
2. Seret Processor ke soket LGA1700.
3. Setelah processor terpasang, ambil kartu **Kipas & Heatsink Processor** dan pasang sebagai komponen 3D terpisah di atas CPU.
4. Seret RAM pertama ke slot A2, lalu seret RAM kedua ke slot B2. Kedua keping tampil sebagai objek terpisah.
5. Pasang SSD, VGA, dan PSU, kemudian hubungkan kabel daya ATX.
6. Tekan tombol Power pada casing untuk melihat hasil POST/boot pada monitor virtual.

Kartu komponen mendukung pointer mouse, jari, dan stylus. Prasyarat pemasangan ditampilkan pada kartu; kipas CPU terkunci sampai processor dipasang, RAM pertama terkunci sampai kipas/heatsink terpasang, dan RAM kedua terkunci sampai RAM pertama masuk ke slot A2.

Catatan urutan praktikum: pasang processor, pasang kipas/heatsink CPU secara terpisah, lalu seret RAM pertama ke slot A2 dan RAM kedua ke slot B2.


## Perbaikan tata letak tray komponen (20 November 2026)

- Seluruh komponen yang belum dipasang kini berada pada platform tray khusus di bagian depan casing, bukan tersebar atau berada di dalam ruang casing.
- Tray memakai dua baris: CPU, dua keping RAM satuan, SSD, dan CPU cooler di baris depan; VGA, PSU, dan kabel ATX di baris belakang.
- Kipas/heatsink CPU tetap berupa objek 3D terpisah dan diletakkan di luar casing sampai siswa memasangnya setelah CPU.
- RAM A2 dan RAM B2 diletakkan berjauhan. Saat berada di tray, modul RAM dibaringkan agar tidak tampak seperti bilah yang berdiri dan tidak bertumpuk. Saat dipasang, rotasi dikembalikan ke posisi vertikal agar sesuai dengan slot DIMM.
- Ketinggian tray diselaraskan dengan dasar masing-masing model supaya komponen tidak melayang atau tertanam ke meja.
- Tombol reset mengembalikan posisi dan rotasi tray, termasuk orientasi RAM yang dibaringkan.
- Kamera overview sedikit diperlebar agar area casing dan tray lebih mudah terlihat sekaligus.
