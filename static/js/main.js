/**
 * ============================================================================
 * MAIN APPLICATION CONTROLLER (static/js/main.js)
 * Mengatur:
 * 1. Laboratorium Rakit PC 3D Realistis (Langsung Render 3D Seketika + Drag & Drop)
 * 2. Galeri Inspeksi Komponen Asli 360° (Penjelasan Bentuk, Warna, & Analogi)
 * 3. Kuis Evaluasi TIK Kelas VII (Backend Python / Vercel API + Mode Offline)
 * 4. Rekap Nilai Guru & Ekspor CSV (Sinkronisasi Server + Browser LocalStorage)
 * ============================================================================
 */

(function () {
    const T = window.HardwareTextures;
    const M = window.HardwareModels3D;
    const LOCAL_BACKUP_KEY = 'sim_hardware_3d_records_v2';

    const DEFAULT_MOTHERBOARD_META = {
        id: "motherboard",
        name: "Motherboard ATX Z790-PRO DDR4",
        subtitle: "Papan Sirkuit Utama (Mainboard) • Socket LGA1700",
        category: "Processing & Interconnect Hub",
        physical_appearance: "Papan PCB fiberglass hijau-gelap/hitam berukuran persegi panjang dengan jalur sirkuit tembaga keemasan, kapasitor silinder perak, heatsink aluminium, soket CPU berpenutup logam, slot RAM memanjang, slot M.2, dan slot VGA bertulang baja.",
        description: "Motherboard adalah papan sirkuit utama tempat seluruh komponen komputer (Processor, RAM, SSD M.2, VGA, dan kabel daya PSU) terhubung dan saling berkomunikasi.",
        analogy: "Seperti jalan raya dan tata kota yang menghubungkan pusat pemerintahan (CPU), meja kerja (RAM), gudang arsip (SSD), dan pembangkit listrik (PSU).",
        specs: "Form Factor ATX • Socket LGA1700 • 4x Slot DDR4 DIMM • Slot M.2 NVMe • PCIe 4.0 x16 • ATX 24-Pin"
    };

    const DEFAULT_CATALOG = {
        cpu: {
            id: "cpu",
            name: "Processor (CPU)",
            short_name: "Intel Core i9-14900K",
            subtitle: "Intel Core i9-14900K • Socket LGA1700",
            category: "Processing Device (Perangkat Pemroses)",
            target_slot: "slot_cpu",
            slot_label: "Soket Processor (LGA1700) di Tengah Motherboard",
            order_hint: 1,
            requires: [],
            physical_appearance: "Keping persegi berukuran ±4,5 cm dengan papan sirkuit hijau di tepi, pelat logam nikel perak mengilap (IHS) bertuliskan seri prosesor, bagian bawah dipenuhi titik kontak emas, serta tanda segitiga emas di salah satu sudut.",
            description: "Central Processing Unit (CPU) adalah otak utama komputer yang mengeksekusi instruksi program dan melakukan perhitungan aritmetika serta logika. Dipasang tepat pada soket prosesor di tengah motherboard.",
            analogy: "Seperti otak manusia atau koki utama di dapur yang mengolah semua perintah dari pengguna.",
            specs: "24 Core (8P+16E) • 32 Thread • Boost 6.00 GHz • Cache 36 MB • Socket LGA1700"
        },
        cpuCooler: {
            id: "cpuCooler",
            name: "Kipas & Heatsink Processor",
            short_name: "CPU Cooler 120mm",
            subtitle: "Pendingin udara CPU • kipas 120 mm + heatsink",
            category: "Cooling Device (Pendingin Processor)",
            target_slot: "slot_cpu_cooler",
            slot_label: "Dudukan pendingin tepat di atas Processor",
            order_hint: 2,
            requires: ["cpu"],
            physical_appearance: "Pendingin CPU terpisah dengan cold plate logam, heatpipe tembaga, tumpukan sirip aluminium, rangka kipas 120 mm, rotor bilah, hub tengah, dan empat titik pengunci.",
            description: "Kipas dan heatsink membantu membuang panas dari processor. Komponen ini dipasang setelah processor berada pada soketnya.",
            analogy: "Seperti kipas dan radiator yang membantu mesin tetap berada pada suhu kerja yang aman.",
            specs: "Air Cooler • Fan 120 mm • Heatpipe tembaga • Heatsink aluminium"
        },
        ram1: {
            id: "ram1",
            name: "RAM DDR4 8GB — Slot A2",
            short_name: "RAM 8GB • A2",
            subtitle: "Keping pertama • pasang satu per satu",
            category: "Memory (Memori Sementara)",
            target_slot: "slot_ram_a2",
            slot_label: "Slot DIMM A2 (slot kedua dari arah processor)",
            order_hint: 3,
            requires: ["cpu", "cpuCooler"],
            physical_appearance: "Satu keping modul DDR4 UDIMM dengan PCB hijau gelap, chip DRAM hitam pada kedua sisi, komponen SMD, jalur sirkuit, dan kontak emas 288-pin dengan takik pengunci.",
            description: "RAM menyimpan data sementara yang sedang dipakai komputer. Keping pertama dipasang secara individual pada slot A2.",
            analogy: "Seperti meja belajar pertama untuk meletakkan buku dan alat yang sedang digunakan.",
            specs: "8 GB • DDR4 • 3200 MT/s • 288-pin UDIMM"
        },
        ram2: {
            id: "ram2",
            name: "RAM DDR4 8GB — Slot B2",
            short_name: "RAM 8GB • B2",
            subtitle: "Keping kedua • pasang setelah RAM pertama",
            category: "Memory (Memori Sementara)",
            target_slot: "slot_ram_b2",
            slot_label: "Slot DIMM B2 (slot keempat dari arah processor)",
            order_hint: 4,
            requires: ["cpu", "cpuCooler", "ram1"],
            physical_appearance: "Satu keping modul DDR4 UDIMM dengan PCB hijau gelap, chip DRAM hitam pada kedua sisi, komponen SMD, jalur sirkuit, dan kontak emas 288-pin dengan takik pengunci.",
            description: "Keping RAM kedua melengkapi pasangan memori 2 × 8 GB. Pasang satu per satu pada slot B2 untuk konfigurasi dual-channel pada contoh motherboard ini.",
            analogy: "Seperti menambahkan meja kerja kedua agar ruang belajar lebih luas.",
            specs: "8 GB • DDR4 • 3200 MT/s • 288-pin UDIMM"
        },
        ssd: {
            id: "ssd",
            name: "SSD NVMe M.2 1TB",
            short_name: "SSD NVMe M.2",
            subtitle: "PCIe Gen4 x4 • Ukuran 2280 (22x80 mm)",
            category: "Storage Device (Perangkat Penyimpanan)",
            target_slot: "slot_ssd",
            slot_label: "Slot M.2 NVMe di Permukaan Motherboard",
            order_hint: 5,
            requires: [],
            physical_appearance: "Modul M.2 2280 sepanjang 80 mm dengan PCB hijau gelap, chip controller NVMe, beberapa paket NAND Flash hitam, komponen SMD, kontak emas M-Key, serta lubang baut pengunci di ujungnya.",
            description: "Solid State Drive (SSD) NVMe M.2 adalah media penyimpanan data berkecepatan tinggi berbasis chip semikonduktor untuk menyimpan Sistem Operasi Windows, aplikasi, dan dokumen secara permanen.",
            analogy: "Seperti lemari arsip permanen modern yang menyimpan seluruh buku dan catatan dengan aman meskipun aliran listrik dimatikan.",
            specs: "Kapasitas 1 TB • NVMe PCIe 4.0 x4 • Kecepatan Baca hingga 7.400 MB/s"
        },
        vga: {
            id: "vga",
            name: "VGA / GPU Card",
            short_name: "VGA RTX 4080 SUPER",
            subtitle: "NVIDIA GeForce RTX 4080 SUPER • 16GB GDDR6X",
            category: "Processing / Graphics Output",
            target_slot: "slot_vga",
            slot_label: "Slot VGA (PCIe x16 Bertulang Baja) di Motherboard",
            order_hint: 6,
            requires: [],
            physical_appearance: "Kartu grafis kelas tinggi dengan shroud logam gunmetal, tiga kipas pendingin aksial, heatsink aluminium bersirip rapat, heatpipe tembaga, pelat belakang, konektor PCIe x16 berlapis emas, dan soket daya tambahan 16-pin.",
            description: "Video Graphics Array (VGA) atau Graphics Processing Unit (GPU) bertugas mengolah data grafis dan mengirimkan sinyal tampilan visual ke layar monitor.",
            analogy: "Seperti pelukis dan desainer khusus yang menggambar seluruh tampilan layar, animasi, dan video agar tampil tajam di monitor.",
            specs: "16 GB GDDR6X • Interface PCIe 4.0 x16 • Triple Axial Fan • HDMI 2.1 & DisplayPort"
        },
        psu: {
            id: "psu",
            name: "Power Supply (PSU)",
            short_name: "PSU 850W Gold",
            subtitle: "850W 80+ Gold ATX 3.1 Power Unit",
            category: "Power Supply Unit (Luar Motherboard)",
            target_slot: "slot_psu",
            slot_label: "Ruang Dudukan PSU di Luar Area Motherboard",
            order_hint: 7,
            requires: [],
            physical_appearance: "Kotak baja ATX hitam dengan kisi kipas 120 mm di bagian atas, label tabel tegangan di sisi casing, panel konektor modular, soket AC IEC, dan sakelar rocker I/O pada panel belakang.",
            description: "Power Supply Unit (PSU) dipasang di ruang khusus pada casing di luar area motherboard. PSU mengubah arus listrik bolak-balik (AC 220V) dari stopkontak menjadi arus searah (DC +12V, +5V, +3.3V).",
            analogy: "Seperti jantung atau gardu induk listrik yang menyuplai energi stabil ke seluruh bagian rumah.",
            specs: "Daya 850 Watt • Sertifikasi 80+ Gold • ATX 3.1 • Proteksi OVP/SCP"
        },
        cable: {
            id: "cable",
            name: "Kabel Power ATX 24-Pin",
            short_name: "Kabel Daya ATX",
            subtitle: "Kabel Daya Utama PSU ke Motherboard & VGA",
            category: "Power Distribution Cable",
            target_slot: "slot_cable",
            slot_label: "Port Power 24-Pin ATX di Tepi Kanan Motherboard",
            order_hint: 8,
            requires: ["psu"],
            physical_appearance: "Berkas kabel listrik dengan warna standar ATX (kuning +12V, merah +5V, oranye +3.3V, hitam ground) yang keluar dari unit PSU dan berakhir pada kepala konektor plastik 24-pin.",
            description: "Kabel daya utama 24-Pin ATX menghubungkan PSU di luar motherboard menuju soket power utama di sisi kanan motherboard.",
            analogy: "Seperti pembuluh darah atau kabel instalasi listrik rumah yang mengalirkan daya dari sumber listrik menuju setiap ruangan.",
            specs: "24-Pin ATX Main Power Connector"
        }
    };

    const FALLBACK_QUIZ = [
        {
            id: 1,
            question: "Komponen perangkat keras berbentuk persegi dengan pelat logam perak dan titik kontak emas yang dipasang di tengah motherboard sebagai otak pemroses perintah disebut...",
            options: ["Random Access Memory (RAM)", "Central Processing Unit (CPU / Processor)", "Power Supply Unit (PSU)", "Solid State Drive (SSD)"],
            answer_index: 1,
            explanation: "Processor (CPU) dipasang pada soket tengah motherboard dan berfungsi mengolah seluruh perhitungan logika serta instruksi komputer."
        },
        {
            id: 2,
            question: "Mengapa keping Memory RAM memiliki takik (celah kunci) tidak simetris pada deretan pin emas di bagian bawahnya?",
            options: ["Agar RAM bisa dipasang di slot VGA maupun slot SSD", "Untuk mencegah kesalahan arah pemasangan terbalik pada slot DIMM motherboard", "Sebagai tempat mengalirkan listrik 220V langsung dari stopkontak", "Agar data di dalam RAM tidak hilang saat komputer dimatikan"],
            answer_index: 1,
            explanation: "Takik (notch) pada pin emas RAM berfungsi sebagai pengaman fisik agar keping RAM hanya masuk ke slot DIMM dalam posisi yang benar."
        },
        {
            id: 3,
            question: "Ketika listrik tiba-tiba padam saat siswa belum menyimpan dokumen yang sedang diketik, data tersebut hilang karena sebelumnya berada di...",
            options: ["SSD NVMe M.2 (Non-Volatile)", "Memory RAM (Volatile)", "Power Supply Unit (PSU)", "Kartu Grafis (VGA)"],
            answer_index: 1,
            explanation: "RAM bersifat volatile, artinya hanya menyimpan data sementara selama komputer dialiri listrik."
        },
        {
            id: 4,
            question: "Komponen ramping berbentuk papan sirkuit kecil (22x80 mm) yang dipasang mendatar pada slot M.2 motherboard untuk menyimpan Sistem Operasi Windows secara permanen adalah...",
            options: ["VGA Card PCIe x16", "SSD NVMe M.2", "Kabel Power 24-Pin ATX", "Baterai CMOS CR2032"],
            answer_index: 1,
            explanation: "SSD NVMe M.2 menyimpan sistem operasi dan file pengguna secara permanen dengan kecepatan baca/tulis tinggi."
        },
        {
            id: 5,
            question: "Di manakah posisi pemasangan Power Supply Unit (PSU) yang benar saat merakit komputer desktop?",
            options: ["Menempel langsung di atas soket prosesor motherboard", "Ditancapkan pada slot PCIe x16 di sebelah RAM", "Dipasang pada ruang dudukan PSU di luar papan motherboard, lalu dihubungkan dengan kabel daya", "Ditempelkan di bagian belakang layar monitor"],
            answer_index: 2,
            explanation: "PSU dipasang di ruang casing di luar area motherboard dan menyalurkan daya ke motherboard melalui kabel 24-Pin ATX."
        },
        {
            id: 6,
            question: "Apa yang terjadi jika seluruh komponen motherboard sudah terpasang, tetapi kabel 24-Pin ATX dari PSU lupa dicolokkan ke motherboard saat tombol Power ditekan?",
            options: ["Komputer langsung masuk ke desktop Windows dengan normal", "Aliran daya listrik ke motherboard terputus sehingga komputer gagal menyala (Boot Error)", "Monitor menampilkan gambar lebih tajam", "Kipas VGA berputar dua kali lebih cepat"],
            answer_index: 1,
            explanation: "Tanpa kabel 24-Pin ATX yang mencolok dari PSU ke motherboard, papan sirkuit utama tidak menerima daya listrik."
        },
        {
            id: 7,
            question: "Kartu ekspansi berkipas ganda dengan konektor emas panjang yang ditancapkan pada slot PCIe x16 bertulang baja di motherboard untuk menampilkan grafis ke monitor adalah...",
            options: ["VGA / GPU Card", "Sound Card", "Processor LGA1700", "Heatsink VRM"],
            answer_index: 0,
            explanation: "VGA / GPU Card mengolah pemrosesan grafis dan menghubungkan komputer ke monitor melalui port HDMI atau DisplayPort."
        },
        {
            id: 8,
            question: "Urutan siklus pemrosesan informasi dasar pada sistem komputer yang benar adalah...",
            options: ["Output → Process → Input → Storage", "Input → Process → Output & Storage", "Storage → Output → Process → Input", "Process → Input → Storage → Output"],
            answer_index: 1,
            explanation: "Data dimasukkan melalui Input Device, diolah di Processing Device (CPU & RAM), lalu ditampilkan lewat Output Device atau disimpan di Storage Device."
        }
    ];

    let CATALOG = { ...DEFAULT_CATALOG };
    let MOTHERBOARD_META = { ...DEFAULT_MOTHERBOARD_META };

    const state = {
        activeTab: 'assembly',
        installed: [],
        selectedPart: null,
        draggingPart: null,
        hoveredSlot: null,
        assemblyScore: 100,
        quizScore: null,
        errorsCount: 0,
        pcPoweredOn: false,
        bootStage: 'OFF',
        startTime: Date.now()
    };

    // =========================================================================
    // 1. WEB AUDIO SYNTHESIZER
    // =========================================================================
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = AudioContextClass ? new AudioContextClass() : null;
    function playTone(freq, type = 'sine', duration = 0.12, vol = 0.14, delay = 0) {
        if (!audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + duration);
        } catch (e) {}
    }

    const playSnapSound = () => { playTone(540, 'triangle', 0.08, 0.18, 0); playTone(920, 'sine', 0.14, 0.16, 0.06); };
    const playErrorSound = () => { playTone(185, 'sawtooth', 0.22, 0.18, 0); playTone(140, 'sawtooth', 0.28, 0.18, 0.18); };
    const playBootBeep = () => { playTone(1000, 'sine', 0.18, 0.16, 0.08); };

    // =========================================================================
    // 2. SCENE THREE.JS UTAMA
    // =========================================================================
    const canvas = document.getElementById('three-canvas');
    const viewport = document.getElementById('viewport-wrapper');
    const initW = Math.max(viewport.clientWidth || 960, 320);
    const initH = Math.max(viewport.clientHeight || 580, 360);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbe4ee);
    scene.fog = new THREE.FogExp2(0xdbe4ee, 0.011);

    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 100);
    camera.position.set(0.4, 13.2, 18.3);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(initW, initH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 4.2;
    controls.maxDistance = 26;
    controls.target.set(0.5, 0.9, 1.9);

    scene.add(new THREE.AmbientLight(0xf8fafc, 0.88));

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    keyLight.position.set(7, 15, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    const d = 12;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
    fillLight.position.set(-9, 8, 6);
    scene.add(fillLight);

    // Dinding Ruang Kerja Rapi + Kisi Kayu Akustik
    const backWallRoom = new THREE.Mesh(
        new THREE.BoxGeometry(28, 13, 0.4),
        new THREE.MeshStandardMaterial({ map: T.createOfficeWallTexture(), roughness: 0.72, metalness: 0.05 })
    );
    backWallRoom.position.set(0, 5.6, -6.9);
    backWallRoom.receiveShadow = true;
    scene.add(backWallRoom);

    const wallShelf = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 0.16, 0.95),
        new THREE.MeshStandardMaterial({ color: 0x855834, roughness: 0.55 })
    );
    wallShelf.position.set(4.5, 4.9, -6.3);
    wallShelf.castShadow = true;
    scene.add(wallShelf);

    const potMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.24, 0.45, 20),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 })
    );
    potMesh.position.set(7.6, 0.23, -2.5);
    potMesh.castShadow = true;
    scene.add(potMesh);

    const plantCrown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.46, 1),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 })
    );
    plantCrown.position.set(7.6, 0.68, -2.5);
    plantCrown.castShadow = true;
    scene.add(plantCrown);

    // Meja Kerja Kayu Natural Oak
    const deskMesh = new THREE.Mesh(
        new THREE.BoxGeometry(24, 0.52, 13.5),
        new THREE.MeshStandardMaterial({ map: T.createWoodDeskTexture(), roughness: 0.42, metalness: 0.08 })
    );
    deskMesh.position.set(0, -0.26, 0);
    deskMesh.receiveShadow = true;
    scene.add(deskMesh);

    const deskMat = new THREE.Mesh(
        new THREE.BoxGeometry(16.2, 0.035, 8.2),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.88 })
    );
    deskMat.position.set(0.5, 0.018, -0.1);
    deskMat.receiveShadow = true;
    scene.add(deskMat);

    // Area tray komponen terpisah di depan casing. Semua komponen yang belum
    // dipasang ditata di atas platform ini, bukan di dalam ruang casing.
    const componentTray = new THREE.Mesh(
        new THREE.BoxGeometry(20.8, 0.06, 3.30),
        new THREE.MeshStandardMaterial({ color: 0x263544, roughness: 0.72, metalness: 0.22 })
    );
    componentTray.position.set(0.75, 0.03, 5.00); // permukaan atas y = 0.06
    componentTray.receiveShadow = true;
    componentTray.castShadow = true;
    scene.add(componentTray);

    const trayEdgeMat = new THREE.MeshStandardMaterial({ color: 0x647789, roughness: 0.38, metalness: 0.58 });
    const trayAccentMat = new THREE.MeshStandardMaterial({ color: 0x1e9ac2, emissive: 0x07516b, emissiveIntensity: 0.18, roughness: 0.3 });
    // Bingkai halus mengelilingi area penyimpanan komponen.
    [
        [0.75, 0.071, 3.37, 20.8, 0.022, 0.035],
        [0.75, 0.071, 6.63, 20.8, 0.022, 0.035],
        [-9.63, 0.071, 5.00, 0.035, 0.022, 3.30],
        [11.13, 0.071, 5.00, 0.035, 0.022, 3.30]
    ].forEach(([x, y, z, w, h, d]) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), trayEdgeMat);
        edge.position.set(x, y, z); scene.add(edge);
    });
    const trayHeader = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.018, 0.12), trayAccentMat
    );
    trayHeader.position.set(-7.2, 0.073, 3.49);
    scene.add(trayHeader);

    // Casing Putih Merek ARMAGGEDDON
    const caseGroup = new THREE.Group();
    caseGroup.position.set(-2.4, 0.04, 0.15);
    scene.add(caseGroup);

    const whiteSteelMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.28, metalness: 0.25 });
    const whiteInteriorMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.2 });
    const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 });

    const caseBase = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.22, 6.4), whiteInteriorMat);
    caseBase.position.set(0, 0.11, 0);
    caseBase.castShadow = true;
    caseBase.receiveShadow = true;
    caseGroup.add(caseBase);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.44, 6.4), whiteSteelMat);
    backWall.position.set(-3.98, 0.83, 0);
    backWall.castShadow = true;
    caseGroup.add(backWall);

    const topBezel = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.44, 0.30), whiteSteelMat);
    topBezel.position.set(0, 0.83, -3.05);
    topBezel.castShadow = true;
    caseGroup.add(topBezel);

    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.44, 6.4), whiteSteelMat);
    frontPanel.position.set(3.95, 0.83, 0);
    frontPanel.castShadow = true;
    caseGroup.add(frontPanel);

    const brandPlate = new THREE.Mesh(
        new THREE.PlaneGeometry(5.6, 1.25),
        new THREE.MeshStandardMaterial({ map: T.createArmaggeddonCaseTexture(), roughness: 0.25, metalness: 0.15 })
    );
    brandPlate.rotation.y = Math.PI / 2;
    brandPlate.position.set(4.15, 0.84, -0.1);
    caseGroup.add(brandPlate);

    const bottomTrim = new THREE.Mesh(new THREE.BoxGeometry(8.28, 0.12, 6.48), blackTrimMat);
    bottomTrim.position.set(0, 0.05, 0);
    caseGroup.add(bottomTrim);

    const powerBtnRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.33, 0.35, 0.14, 32),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 })
    );
    powerBtnRing.position.set(3.95, 1.56, 2.25);
    caseGroup.add(powerBtnRing);

    const powerLedMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25,
        roughness: 0.2
    });
    const powerButtonMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.16, 32), powerLedMat);
    powerButtonMesh.position.set(3.95, 1.58, 2.25);
    caseGroup.add(powerButtonMesh);

    const psuBay = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.18, 2.3),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.25 })
    );
    psuBay.position.set(-2.7, 0.25, 1.85);
    psuBay.receiveShadow = true;
    caseGroup.add(psuBay);

    const moboGroup = M.buildMotherboardAssembly();
    moboGroup.position.set(0.75, 0.32, -0.25);
    caseGroup.add(moboGroup);

    // =========================================================================
    // 3. SLOT TARGET MOTHERBOARD & PSU
    // =========================================================================
    const slotMeshes = {};
    const slotHighlightMeshes = {};

    function createTargetSlot(slotId, parent, pos, size, visualBuilder) {
        const group = new THREE.Group();
        group.position.copy(pos);
        parent.add(group);
        if (visualBuilder) visualBuilder(group);

        const hitBox = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitBox.userData = { slotId };
        group.add(hitBox);
        slotMeshes[slotId] = hitBox;

        const highlight = new THREE.Mesh(
            new THREE.BoxGeometry(size.x + 0.08, 0.14, size.z + 0.08),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.0, depthWrite: false })
        );
        highlight.position.y = 0.08;
        group.add(highlight);
        slotHighlightMeshes[slotId] = highlight;
    }

    createTargetSlot('slot_cpu', moboGroup, new THREE.Vector3(-0.2, 0.08, -0.75), new THREE.Vector3(1.25, 0.55, 1.25), null);
    // Dua target RAM individual: A2 dan B2 sesuai posisi slot fisik motherboard.
    createTargetSlot('slot_ram_a2', moboGroup, new THREE.Vector3(1.17, 0.12, -0.75), new THREE.Vector3(0.32, 0.72, 2.35), null);
    createTargetSlot('slot_ram_b2', moboGroup, new THREE.Vector3(1.89, 0.12, -0.75), new THREE.Vector3(0.32, 0.72, 2.35), null);
    // Target pendingin berada di atas CPU; batas bawahnya terpisah dari hitbox soket CPU.
    createTargetSlot('slot_cpu_cooler', moboGroup, new THREE.Vector3(-0.2, 0.81, -0.75), new THREE.Vector3(1.38, 0.90, 1.38), null);
    createTargetSlot('slot_ssd', moboGroup, new THREE.Vector3(-0.15, 0.09, 0.35), new THREE.Vector3(1.65, 0.45, 0.65), null);
    createTargetSlot('slot_vga', moboGroup, new THREE.Vector3(-0.35, 0.12, 1.05), new THREE.Vector3(2.85, 0.85, 0.78), null);
    createTargetSlot('slot_psu', caseGroup, new THREE.Vector3(-2.7, 0.35, 1.85), new THREE.Vector3(2.2, 1.15, 2.2), null);
    createTargetSlot('slot_cable', moboGroup, new THREE.Vector3(2.48, 0.14, -0.35), new THREE.Vector3(0.65, 0.65, 1.55), null);

    // =========================================================================
    // 4. MONITOR SAMSUNG TERBARU
    // =========================================================================
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 640;
    const screenCtx = screenCanvas.getContext('2d');
    const monitorScreenTex = new THREE.CanvasTexture(screenCanvas);

    function updateMonitorScreen(mode, errorMsg = '') {
        T.renderMonitorCanvas(screenCtx, screenCanvas.width, screenCanvas.height, mode, errorMsg);
        monitorScreenTex.needsUpdate = true;
    }

    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(4.55, 0.03, -0.45);
    monitorGroup.rotation.y = -0.34;
    scene.add(monitorGroup);

    const silverStandMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.20 });
    const monBase = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.07, 1.35), silverStandMat);
    monBase.position.y = 0.035;
    monBase.castShadow = true;
    monitorGroup.add(monBase);

    const monNeck = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.95, 0.18), silverStandMat);
    monNeck.position.set(0, 0.98, -0.36);
    monNeck.castShadow = true;
    monitorGroup.add(monNeck);

    const monBezel = new THREE.Mesh(
        new THREE.BoxGeometry(4.95, 3.02, 0.11),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.78, roughness: 0.24 })
    );
    monBezel.position.set(0, 2.38, -0.15);
    monBezel.castShadow = true;
    monitorGroup.add(monBezel);

    const samsungChin = new THREE.Mesh(
        new THREE.BoxGeometry(4.95, 0.24, 0.12),
        new THREE.MeshStandardMaterial({ map: T.createSamsungBezelTexture(), metalness: 0.82, roughness: 0.22 })
    );
    samsungChin.position.set(0, 0.98, -0.14);
    monitorGroup.add(samsungChin);

    updateMonitorScreen('OFF');
    const monDisplay = new THREE.Mesh(
        new THREE.PlaneGeometry(4.78, 2.76),
        new THREE.MeshStandardMaterial({ map: monitorScreenTex, roughness: 0.14, metalness: 0.06 })
    );
    monDisplay.position.set(0, 2.46, -0.09);
    monitorGroup.add(monDisplay);

    // =========================================================================
    // 5. LANGSUNG BANGUN SELURUH KOMPONEN 3D DI TRAY MEJA KERJA!
    // =========================================================================
    const componentMeshes = {};
    const vgaFanMeshes = [];
    const cpuFanMeshes = [];

    // Koordinat pusat visual setiap komponen di meja (bukan di dalam casing).
    // RAM dimiringkan 90 derajat saat di tray agar berbaring rata; X origin
    // ditambah 0.40 karena pusat PCB berada pada Y lokal sekitar 0.40.
    const trayPositions = {
        // Baris depan: CPU, RAM satuan, SSD, dan pendingin CPU.
        cpu:       new THREE.Vector3(-6.70, 0.055, 4.55),
        ram1:      new THREE.Vector3(-4.30, 0.136, 4.55), // pusat visual X = -4.70
        ram2:      new THREE.Vector3(-2.25, 0.136, 4.55), // pusat visual X = -2.65
        ssd:       new THREE.Vector3(-0.20, 0.060, 4.55),
        cpuCooler: new THREE.Vector3( 2.20,-0.094, 4.55),
        // Baris belakang: kartu grafis, PSU, dan kabel daya.
        vga:       new THREE.Vector3( 4.20, 0.010, 5.85),
        psu:       new THREE.Vector3( 7.40, 0.060, 5.72),
        cable:     new THREE.Vector3( 9.80, 0.121, 5.72)
    };

    const trayRotations = {
        ram1: new THREE.Euler(0, 0, Math.PI / 2),
        ram2: new THREE.Euler(0, 0, Math.PI / 2)
    };

    function initComponentMeshes() {
        const builders = {
            cpu: () => M.buildCPU3D(),
            cpuCooler: () => M.buildCPUCooler3D(cpuFanMeshes),
            ram1: () => M.buildRAM3D(true),
            ram2: () => M.buildRAM3D(true),
            ssd: () => M.buildSSD3D(),
            vga: () => M.buildVGA3D(vgaFanMeshes),
            psu: () => M.buildPSU3D(),
            cable: () => M.buildCable3D()
        };

        Object.keys(builders).forEach(partId => {
            const meshGroup = builders[partId]();
            meshGroup.position.copy(trayPositions[partId]);
            if (trayRotations[partId]) meshGroup.rotation.copy(trayRotations[partId]);
            if (partId === 'cable') meshGroup.scale.setScalar(0.38); // harness ringkas saat berada di tray
            meshGroup.traverse(child => {
                child.userData.partId = partId;
            });
            scene.add(meshGroup);
            componentMeshes[partId] = meshGroup;
        });
    }

    initComponentMeshes();

    // =========================================================================
    // 6. INTERAKSI DRAG & DROP + VALIDASI LOKAL & SERVER
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.45);
    const dragIntersect = new THREE.Vector3();

    function getPointerNDC(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        const cx = event.touches ? event.touches[0].clientX : event.clientX;
        const cy = event.touches ? event.touches[0].clientY : event.clientY;
        mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
    }

    function highlightSlots(active, targetSlotId = null, isValid = true) {
        Object.keys(slotHighlightMeshes).forEach(sId => {
            const hl = slotHighlightMeshes[sId];
            if (!active) {
                hl.material.opacity = 0;
            } else if (sId === targetSlotId) {
                hl.material.color.setHex(isValid ? 0x10b981 : 0xef4444);
                hl.material.opacity = 0.55;
            } else {
                hl.material.color.setHex(0x38bdf8);
                hl.material.opacity = 0.18;
            }
        });
    }

    renderer.domElement.addEventListener('pointerdown', (e) => {
        getPointerNDC(e);
        raycaster.setFromCamera(mouse, camera);

        if (raycaster.intersectObject(powerButtonMesh, true).length > 0) {
            triggerCasePower();
            return;
        }
        if (raycaster.intersectObject(monDisplay, true).length > 0 && state.bootStage === 'WINDOWS') {
            openWindowsModal();
            return;
        }

        const draggableRoots = Object.keys(componentMeshes)
            .filter(id => !state.installed.includes(id))
            .map(id => componentMeshes[id]);

        const hits = raycaster.intersectObjects(draggableRoots, true);
        if (hits.length > 0) {
            const partId = hits[0].object.userData.partId;
            if (partId && !state.installed.includes(partId)) {
                state.draggingPart = partId;
                state.dragPointerId = e.pointerId;
                if (renderer.domElement.setPointerCapture) renderer.domElement.setPointerCapture(e.pointerId);
                selectComponent(partId);
                controls.enabled = false;
                renderer.domElement.style.cursor = 'grabbing';
                highlightSlots(true);
                return;
            }
        }

        if (state.selectedPart && !state.installed.includes(state.selectedPart)) {
            const slotHits = raycaster.intersectObjects(Object.values(slotMeshes), false);
            if (slotHits.length > 0) {
                attemptInstallComponent(state.selectedPart, slotHits[0].object.userData.slotId);
            }
        }
    });

    // Pointer global membuat kartu komponen di sidebar dapat diseret dengan
    // mouse, jari, atau stylus ke viewport 3D tanpa HTML5 native drag yang
    // sering tidak konsisten pada layar sentuh.
    window.addEventListener('pointermove', (e) => {
        if (!state.draggingPart) return;
        getPointerNDC(e);
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
            componentMeshes[state.draggingPart].position.set(dragIntersect.x, 1.48, dragIntersect.z);
        }
        const slotHits = raycaster.intersectObjects(Object.values(slotMeshes), false);
        if (slotHits.length > 0) {
            const sId = slotHits[0].object.userData.slotId;
            state.hoveredSlot = sId;
            highlightSlots(true, sId, CATALOG[state.draggingPart].target_slot === sId);
        } else {
            state.hoveredSlot = null;
            highlightSlots(true);
        }
    });

    function finishComponentDrag(event) {
        if (!state.draggingPart) return;
        // Hit-test ulang tepat pada koordinat pointer terakhir, agar touch/drop
        // tidak bergantung pada pointermove terakhir yang kadang hilang di HP/PID.
        if (event && typeof event.clientX === 'number' && typeof event.clientY === 'number') {
            getPointerNDC(event);
            raycaster.setFromCamera(mouse, camera);
            const finalSlotHits = raycaster.intersectObjects(Object.values(slotMeshes), false);
            state.hoveredSlot = finalSlotHits.length ? finalSlotHits[0].object.userData.slotId : null;
        }
        const partId = state.draggingPart;
        const slotId = state.hoveredSlot;
        state.draggingPart = null;
        state.hoveredSlot = null;
        state.dragPointerId = null;
        controls.enabled = true;
        renderer.domElement.style.cursor = 'grab';
        highlightSlots(false);
        if (slotId) attemptInstallComponent(partId, slotId);
        else componentMeshes[partId].position.copy(trayPositions[partId]);
    }
    window.addEventListener('pointerup', finishComponentDrag);
    window.addEventListener('pointercancel', () => {
        if (!state.draggingPart) return;
        const partId = state.draggingPart;
        state.draggingPart = null;
        state.hoveredSlot = null;
        state.dragPointerId = null;
        controls.enabled = true;
        renderer.domElement.style.cursor = 'grab';
        highlightSlots(false);
        if (componentMeshes[partId] && trayPositions[partId]) componentMeshes[partId].position.copy(trayPositions[partId]);
    });

    renderer.domElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!state.draggingPart) return;
        getPointerNDC(e);
        raycaster.setFromCamera(mouse, camera);
        if (raycaster.ray.intersectPlane(dragPlane, dragIntersect)) {
            componentMeshes[state.draggingPart].position.set(dragIntersect.x, 1.48, dragIntersect.z);
        }
        const slotHits = raycaster.intersectObjects(Object.values(slotMeshes), false);
        if (slotHits.length > 0) {
            const sId = slotHits[0].object.userData.slotId;
            state.hoveredSlot = sId;
            highlightSlots(true, sId, CATALOG[state.draggingPart].target_slot === sId);
        } else {
            state.hoveredSlot = null;
            highlightSlots(true);
        }
    });

    renderer.domElement.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!state.draggingPart) return;
        const partId = state.draggingPart;
        const slotId = state.hoveredSlot;
        state.draggingPart = null;
        state.hoveredSlot = null;
        highlightSlots(false);
        if (slotId) attemptInstallComponent(partId, slotId);
        else componentMeshes[partId].position.copy(trayPositions[partId]);
    });

    function validateDropLocally(partId, targetSlot) {
        const comp = CATALOG[partId];
        const missingRequirements = (comp.requires || []).filter(req => !state.installed.includes(req));
        if (missingRequirements.length) {
            const names = missingRequirements.map(req => CATALOG[req]?.name || req).join(' dan ');
            return {
                valid: false,
                title: 'Urutan pemasangan belum tepat',
                message: `Pasang ${names} terlebih dahulu sebelum memasang ${comp.name}.`
            };
        }
        if (targetSlot !== comp.target_slot) {
            return {
                valid: false,
                title: 'SALAH SLOT / POSISI!',
                message: `${comp.name} tidak cocok pada slot tersebut. Pasang pada: ${comp.slot_label}.`
            };
        }
        return {
            valid: true,
            title: `Berhasil Memasang ${comp.name}!`,
            message: `${comp.name} terpasang presisi pada ${comp.slot_label}.`
        };
    }

    async function attemptInstallComponent(partId, targetSlot) {
        let result;
        try {
            const res = await fetch('/api/validate-drop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ component_id: partId, target_slot: targetSlot, installed: state.installed })
            });
            if (!res.ok) throw new Error('Offline mode');
            result = await res.json();
        } catch (err) {
            result = validateDropLocally(partId, targetSlot);
        }

        if (result.valid) {
            playSnapSound();
            state.installed.push(partId);
            snapComponentToBoard3D(partId);
            let installedMessage = result.message;
            if (partId === 'cpu') {
                installedMessage += ' Sekarang ambil kipas dan heatsink CPU dari daftar komponen, lalu pasang secara terpisah di atas processor.';
            } else if (partId === 'cpuCooler') {
                installedMessage += ' Kipas CPU kini terpasang. Saat komputer dinyalakan, baling-baling akan berputar.';
            } else if (partId === 'ram1') {
                installedMessage += ' Bagus! Ambil keping RAM kedua dan pasang ke slot B2.';
            }
            showStatusBanner('success', result.title, installedMessage);
        } else {
            playErrorSound();
            state.errorsCount += 1;
            state.assemblyScore = Math.max(0, state.assemblyScore - 10);
            if (!state.installed.includes(partId)) {
                componentMeshes[partId].position.copy(trayPositions[partId]);
            }
            showStatusBanner('error', result.title, result.message);
        }
        updateHUD();
    }

    function snapComponentToBoard3D(partId) {
        const mesh = componentMeshes[partId];
        // Kembalikan orientasi normal sebelum komponen dikunci ke motherboard.
        // Ini penting untuk RAM yang sengaja dibaringkan saat berada di tray.
        mesh.rotation.set(0, 0, 0);
        if (partId === 'cpu') { moboGroup.add(mesh); mesh.position.set(-0.2, 0.18, -0.75); }
        else if (partId === 'cpuCooler') { moboGroup.add(mesh); mesh.position.set(-0.2, 0.18, -0.75); }
        else if (partId === 'ram1') { moboGroup.add(mesh); mesh.position.set(1.17, 0.14, -0.75); }
        else if (partId === 'ram2') { moboGroup.add(mesh); mesh.position.set(1.89, 0.14, -0.75); }
        else if (partId === 'ssd') { moboGroup.add(mesh); mesh.position.set(-0.15, 0.13, 0.35); }
        else if (partId === 'vga') { moboGroup.add(mesh); mesh.position.set(-0.35, 0.22, 1.05); }
        else if (partId === 'psu') { caseGroup.add(mesh); mesh.position.set(-2.7, 0.34, 1.85); }
        else if (partId === 'cable') {
            mesh.scale.set(1, 1, 1);
            caseGroup.add(mesh);
            mesh.position.set(0.40, 0.84, 0.095);
        }
    }

    async function triggerCasePower() {
        powerButtonMesh.position.y = 1.53;
        setTimeout(() => { powerButtonMesh.position.y = 1.58; }, 160);

        let bootRes;
        try {
            const res = await fetch('/api/power-on', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ installed: state.installed })
            });
            if (!res.ok) throw new Error('Offline mode');
            bootRes = await res.json();
        } catch (err) {
            const missing = Object.keys(CATALOG).filter(k => !state.installed.includes(k));
            bootRes = missing.length === 0
                ? { boot_success: true }
                : {
                    boot_success: false,
                    error_code: 'ERR_MISSING_HARDWARE',
                    message: `Komponen belum terpasang lengkap: ${missing.map(m => CATALOG[m].name).join(', ')}`
                };
        }

        const ledDot = document.getElementById('power-led-dot');
        const badge = document.getElementById('pc-state-badge');

        if (!bootRes.boot_success) {
            playErrorSound();
            state.pcPoweredOn = false;
            state.bootStage = 'ERROR';
            state.errorsCount += 1;
            state.assemblyScore = Math.max(0, state.assemblyScore - 10);

            powerLedMat.color.setHex(0xef4444);
            powerLedMat.emissive.setHex(0xdc2626);
            powerLedMat.emissiveIntensity = 1.8;

            ledDot.className = 'w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping';
            badge.textContent = 'STATUS: BOOT ERROR!';
            badge.className = 'text-[11px] mono px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-700';

            updateMonitorScreen('ERROR', `${bootRes.error_code} — ${bootRes.message}`);
            showStatusBanner('error', `GAGAL MENYALAKAN PC (${bootRes.error_code})`, bootRes.message);
            window.setCameraPreset('monitor');
            updateHUD();
            return;
        }

        playBootBeep();
        state.pcPoweredOn = true;
        state.bootStage = 'BIOS';

        powerLedMat.color.setHex(0x38bdf8);
        powerLedMat.emissive.setHex(0x0ea5e9);
        powerLedMat.emissiveIntensity = 2.0;

        ledDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]';
        badge.textContent = 'POWER: ON (WINDOWS)';
        badge.className = 'text-[11px] mono px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700';

        updateMonitorScreen('BIOS');
        showStatusBanner('success', 'PC Menyala! POST BIOS Berhasil...', 'Memuat Sistem Operasi Windows 11 di monitor Samsung...');
        window.setCameraPreset('monitor');

        await saveRecordToBackend('LULUS PRAKTIKUM RAKIT PC 3D');

        setTimeout(() => {
            if (state.pcPoweredOn) {
                state.bootStage = 'WINDOWS';
                updateMonitorScreen('WINDOWS');
                document.getElementById('windows-actions').classList.remove('hidden');
                showStatusBanner(
                    'success',
                    '🎉 Komputer Berhasil Dirakit & Windows Menyala!',
                    'Klik layar monitor 3D atau tombol "Buka Layar Windows Penuh" di bawah.'
                );
            }
        }, 1400);
    }

    async function saveRecordToBackend(statusText) {
        const studentName = document.getElementById('student-name-input').value.trim() || 'Nama Siswa';
        const studentClass = document.getElementById('student-class-input').value.trim() || 'Kelas belum diisi';
        const duration = Math.round((Date.now() - state.startTime) / 1000);

        const localRecord = {
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            student_name: studentName,
            student_class: studentClass,
            assembly_score: state.assemblyScore,
            quiz_score: state.quizScore,
            errors_count: state.errorsCount,
            duration_seconds: duration,
            status: statusText
        };

        try {
            const res = await fetch('/api/save-result', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localRecord)
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.record) {
                    const existing = JSON.parse(localStorage.getItem(LOCAL_BACKUP_KEY) || '[]');
                    existing.push(data.record);
                    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(existing));
                    return;
                }
            }
        } catch (e) {}

        const existing = JSON.parse(localStorage.getItem(LOCAL_BACKUP_KEY) || '[]');
        existing.push(localRecord);
        localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(existing));
    }

    // =========================================================================
    // 7. RENDER SIDEBAR, CHECKLIST, INSPECTOR, & TABS
    // =========================================================================
    function renderPartsSidebar() {
        const list = document.getElementById('parts-list');
        if (!list) return;
        list.innerHTML = '';

        Object.values(CATALOG).forEach(part => {
            const isInst = state.installed.includes(part.id);
            const isSel = state.selectedPart === part.id;
            const missingReq = (part.requires || []).find(req => !state.installed.includes(req));
            const isLocked = !isInst && Boolean(missingReq);

            const card = document.createElement('div');
            card.draggable = false;
            card.style.touchAction = 'none';
            card.className = `part-card p-3 rounded-xl border border-slate-800 bg-slate-950/85 cursor-pointer ${isInst ? 'installed' : ''} ${isSel ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
            card.innerHTML = `
                <div class="flex items-center justify-between gap-2">
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 mono">#${part.order_hint}</span>
                            <h4 class="text-xs font-bold text-white">${part.name}</h4>
                        </div>
                        <p class="text-[11px] text-slate-400 mt-0.5">${part.subtitle}</p>
                    </div>
                    <span class="text-xs font-bold ${isInst ? 'text-emerald-400' : isLocked ? 'text-amber-400' : 'text-sky-400'}">
                        ${isInst ? '✓ Terpasang' : isLocked ? '🔒 Pasang prasyarat' : '⤢ Seret'}
                    </span>
                </div>
            `;

            card.addEventListener('click', () => {
                if (isLocked) {
                    showStatusBanner('info', 'Pasang komponen sebelumnya', `Pasang ${CATALOG[missingReq]?.name || missingReq} terlebih dahulu.`);
                    return;
                }
                selectComponent(part.id);
            });
            card.addEventListener('pointerdown', (e) => {
                if (isInst) return;
                if (isLocked) {
                    showStatusBanner('info', 'Pasang komponen sebelumnya', `Pasang ${CATALOG[missingReq]?.name || missingReq} terlebih dahulu.`);
                    return;
                }
                e.preventDefault();
                state.draggingPart = part.id;
                state.dragPointerId = e.pointerId;
                state.hoveredSlot = null;
                selectComponent(part.id);
                controls.enabled = false;
                highlightSlots(true);
                try { card.setPointerCapture(e.pointerId); } catch (_) {}
            });

            list.appendChild(card);
        });

        const checkBar = document.getElementById('checklist-bar');
        if (checkBar) {
            checkBar.innerHTML = Object.values(CATALOG).map(p => {
                const ok = state.installed.includes(p.id);
                return `
                    <div class="px-3 py-2 rounded-xl border text-xs flex items-center justify-between ${ok ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'}">
                        <span class="font-semibold truncate">${p.short_name}</span>
                        <span class="font-bold ml-1">${ok ? '✓' : '○'}</span>
                    </div>
                `;
            }).join('');
        }
    }

    function selectComponent(partId) {
        state.selectedPart = partId;
        const p = CATALOG[partId];
        document.getElementById('insp-title').textContent = p.name;
        document.getElementById('insp-category').textContent = `${p.category} → ${p.slot_label}`;
        document.getElementById('insp-appearance').textContent = p.physical_appearance;
        document.getElementById('insp-desc').textContent = p.description;
        document.getElementById('insp-analogy').textContent = p.analogy;
        document.getElementById('insp-specs').textContent = p.specs;

        if (!state.installed.includes(partId)) {
            highlightSlots(true, p.target_slot, true);
        }
        renderPartsSidebar();
    }

    function showStatusBanner(type, title, message) {
        const banner = document.getElementById('status-banner');
        const icon = document.getElementById('status-icon');
        const titleEl = document.getElementById('status-title');
        const msgEl = document.getElementById('status-message');

        banner.classList.remove('shake-error');
        void banner.offsetWidth;

        if (type === 'error') {
            banner.className = 'bg-rose-950/90 border border-rose-500/60 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shake-error';
            icon.className = 'w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 font-bold text-base';
            icon.textContent = '⚠';
            titleEl.className = 'text-sm font-bold text-rose-200';
        } else if (type === 'success') {
            banner.className = 'bg-emerald-950/85 border border-emerald-500/50 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3';
            icon.className = 'w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-base';
            icon.textContent = '✓';
            titleEl.className = 'text-sm font-bold text-emerald-200';
        } else {
            banner.className = 'bg-slate-900/95 border border-slate-800 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3';
            icon.className = 'w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-base';
            icon.textContent = 'ℹ';
            titleEl.className = 'text-sm font-bold text-white';
        }

        titleEl.textContent = title;
        msgEl.innerHTML = message;
    }

    function updateHUD() {
        const totalParts = Object.keys(CATALOG).length;
        document.getElementById('hud-installed').textContent = `${state.installed.length}/${totalParts}`;
        document.getElementById('hud-score').textContent = state.assemblyScore;
        document.getElementById('hud-errors').textContent = state.errorsCount;

        const powerBtn = document.getElementById('btn-case-power');
        if (state.installed.length === totalParts && !state.pcPoweredOn) {
            powerBtn.classList.add('power-ready', 'bg-sky-600');
            showStatusBanner(
                'success',
                'Semua komponen terpasang! Siap dinyalakan!',
                'Hebat! Tekan <strong>Tombol Power di Casing PC</strong> untuk melihat proses boot pada monitor virtual.'
            );
        }
        renderPartsSidebar();
    }

    // =========================================================================
    // 8. GALERI INSPEKSI KOMPONEN ASLI 360° (TAB 2)
    // =========================================================================
    let galleryScene, galleryCamera, galleryRenderer, galleryControls, galleryCurrentMesh;
    let galleryInitialized = false;

    function initGallery3D() {
        if (galleryInitialized) return;
        const gCanvas = document.getElementById('gallery-canvas');
        const gBox = document.getElementById('gallery-viewport');
        if (!gCanvas || !gBox) return;

        const gw = Math.max(gBox.clientWidth || 460, 280);
        const gh = Math.max(gBox.clientHeight || 460, 280);

        galleryScene = new THREE.Scene();
        galleryCamera = new THREE.PerspectiveCamera(40, gw / gh, 0.1, 50);
        galleryCamera.position.set(2.8, 2.4, 3.6);

        galleryRenderer = new THREE.WebGLRenderer({ canvas: gCanvas, antialias: true, alpha: true });
        galleryRenderer.setSize(gw, gh);
        galleryRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        galleryControls = new THREE.OrbitControls(galleryCamera, galleryRenderer.domElement);
        galleryControls.enableDamping = true;
        galleryControls.autoRotate = true;
        galleryControls.autoRotateSpeed = 2.2;

        galleryScene.add(new THREE.AmbientLight(0xffffff, 0.95));
        const gKey = new THREE.DirectionalLight(0xffffff, 1.3);
        gKey.position.set(5, 8, 6);
        galleryScene.add(gKey);
        const gRim = new THREE.DirectionalLight(0x38bdf8, 0.7);
        gRim.position.set(-5, -3, -5);
        galleryScene.add(gRim);

        galleryInitialized = true;
        loadGalleryItem('motherboard');
    }

    window.loadGalleryItem = function (itemId) {
        if (!galleryInitialized) initGallery3D();
        if (galleryCurrentMesh) galleryScene.remove(galleryCurrentMesh);

        let itemData;
        if (itemId === 'motherboard') {
            galleryCurrentMesh = M.buildMotherboardAssembly();
            galleryCurrentMesh.scale.set(0.65, 0.65, 0.65);
            itemData = MOTHERBOARD_META;
        } else {
            itemData = CATALOG[itemId];
            if (itemId === 'cpu') { galleryCurrentMesh = M.buildCPU3D(); galleryCurrentMesh.scale.set(2.2, 2.2, 2.2); }
            else if (itemId === 'ram1' || itemId === 'ram2') { galleryCurrentMesh = M.buildRAM3D(true); galleryCurrentMesh.scale.set(1.45, 1.45, 1.45); }
            else if (itemId === 'cpuCooler') { galleryCurrentMesh = M.buildCPUCooler3D(null); galleryCurrentMesh.scale.set(1.05, 1.05, 1.05); }
            else if (itemId === 'ssd') { galleryCurrentMesh = M.buildSSD3D(); galleryCurrentMesh.scale.set(1.85, 1.85, 1.85); }
            else if (itemId === 'vga') { galleryCurrentMesh = M.buildVGA3D(null); galleryCurrentMesh.scale.set(0.95, 0.95, 0.95); }
            else if (itemId === 'psu') { galleryCurrentMesh = M.buildPSU3D(); galleryCurrentMesh.scale.set(1.15, 1.15, 1.15); }
            else if (itemId === 'cable') { galleryCurrentMesh = M.buildCable3D(); galleryCurrentMesh.scale.set(0.55, 0.55, 0.55); }
        }

        galleryScene.add(galleryCurrentMesh);

        document.getElementById('gal-title').textContent = itemData.name;
        document.getElementById('gal-subtitle').textContent = itemData.subtitle;
        document.getElementById('gal-appearance').textContent = itemData.physical_appearance;
        document.getElementById('gal-desc').textContent = itemData.description;
        document.getElementById('gal-analogy').textContent = itemData.analogy;
        document.getElementById('gal-specs').textContent = itemData.specs;

        document.querySelectorAll('.gal-selector-btn').forEach(btn => {
            btn.classList.toggle('border-sky-400', btn.dataset.item === itemId);
            btn.classList.toggle('bg-sky-500/15', btn.dataset.item === itemId);
        });
    };

    // =========================================================================
    // 9. KUIS EVALUASI INTERAKTIF (TAB 3) & DASHBOARD GURU (TAB 4)
    // =========================================================================
    let quizData = [...FALLBACK_QUIZ];

    function renderQuizUI() {
        const container = document.getElementById('quiz-questions-container');
        if (!container) return;
        container.innerHTML = quizData.map((q, idx) => `
            <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <p class="text-sm font-bold text-white">${idx + 1}. ${q.question}</p>
                <div class="space-y-2">
                    ${q.options.map((opt, oIdx) => `
                        <label class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-800 hover:border-sky-500/50 hover:bg-slate-900 cursor-pointer text-xs text-slate-200 transition">
                            <input type="radio" name="quiz_q_${q.id}" value="${oIdx}" class="accent-sky-500" />
                            <span>${String.fromCharCode(65 + oIdx)}. ${opt}</span>
                        </label>
                    `).join('')}
                </div>
                <div id="quiz-feedback-${q.id}" class="hidden text-xs p-3 rounded-xl"></div>
            </div>
        `).join('');
    }

    async function loadQuizQuestions() {
        renderQuizUI();
        try {
            const res = await fetch('/api/quiz');
            if (res.ok) {
                const data = await res.json();
                if (data.questions && data.questions.length > 0) {
                    quizData = data.questions;
                    renderQuizUI();
                }
            }
        } catch (e) {}
    }

    function gradeQuizLocally(answers) {
        let correctCount = 0;
        const details = FALLBACK_QUIZ.map(q => {
            const userChoice = answers[String(q.id)] !== undefined ? answers[String(q.id)] : -1;
            const isCorrect = userChoice === q.answer_index;
            if (isCorrect) correctCount++;
            return {
                id: q.id,
                is_correct: isCorrect,
                correct_text: q.options[q.answer_index],
                explanation: q.explanation
            };
        });
        const score = Math.round((correctCount / FALLBACK_QUIZ.length) * 100);
        return {
            score,
            correct_count: correctCount,
            total_questions: FALLBACK_QUIZ.length,
            passed: score >= 75,
            details
        };
    }

    window.submitQuizAnswers = async function () {
        const answers = {};
        quizData.forEach(q => {
            const checked = document.querySelector(`input[name="quiz_q_${q.id}"]:checked`);
            if (checked) answers[String(q.id)] = parseInt(checked.value, 10);
        });

        let result;
        try {
            const res = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            if (!res.ok) throw new Error('Offline mode');
            result = await res.json();
        } catch (err) {
            result = gradeQuizLocally(answers);
        }

        state.quizScore = result.score;

        const summaryBox = document.getElementById('quiz-result-summary');
        summaryBox.classList.remove('hidden');
        summaryBox.innerHTML = `
            <div class="p-4 rounded-2xl border ${result.passed ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-amber-950/60 border-amber-500/50 text-amber-200'}">
                <h4 class="font-bold text-base">Skor Evaluasi Anda: ${result.score} / 100 (${result.correct_count} dari ${result.total_questions} Benar)</h4>
                <p class="text-xs mt-1">${result.passed ? 'Selamat! Anda lulus standar ketuntasan materi Sistem Komputer & Perangkat Keras Kelas VII.' : 'Silakan pelajari pembahasan di bawah dan ulangi kuis untuk mencapai skor minimal 75.'}</p>
            </div>
        `;

        result.details.forEach(d => {
            const fb = document.getElementById(`quiz-feedback-${d.id}`);
            fb.classList.remove('hidden');
            fb.className = `text-xs p-3 rounded-xl mt-2 ${d.is_correct ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/70 border border-rose-500/40 text-rose-200'}`;
            fb.innerHTML = `<strong>${d.is_correct ? '✓ Jawaban Benar!' : '✕ Kurang Tepat. Jawaban benar: ' + d.correct_text}</strong><br/>${d.explanation}`;
        });

        await saveRecordToBackend(state.pcPoweredOn ? 'LULUS PRAKTIKUM + KUIS' : 'SELESAI KUIS TEORI');
    };

    async function loadTeacherRecords() {
        const tbody = document.getElementById('teacher-records-body');
        let serverRecords = [];
        try {
            const res = await fetch('/api/teacher/records');
            if (res.ok) {
                const data = await res.json();
                serverRecords = data.records || [];
            }
        } catch (e) {}

        const localRecords = JSON.parse(localStorage.getItem(LOCAL_BACKUP_KEY) || '[]');
        const records = serverRecords.length >= localRecords.length ? serverRecords : localRecords;

        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400 text-xs">Belum ada riwayat praktikum siswa yang tersimpan.</td></tr>`;
            return;
        }

        tbody.innerHTML = records.slice().reverse().map(r => `
            <tr class="border-b border-slate-800/80 hover:bg-slate-900/60 text-xs">
                <td class="py-2.5 px-3 mono text-slate-400">${r.timestamp}</td>
                <td class="py-2.5 px-3 font-bold text-white">${r.student_name}</td>
                <td class="py-2.5 px-3 text-slate-300">${r.student_class}</td>
                <td class="py-2.5 px-3 mono font-bold text-sky-400">${r.assembly_score}</td>
                <td class="py-2.5 px-3 mono font-bold text-emerald-400">${r.quiz_score !== null && r.quiz_score !== undefined ? r.quiz_score : '-'}</td>
                <td class="py-2.5 px-3 mono text-rose-400">${r.errors_count}</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">${r.status}</span></td>
            </tr>
        `).join('');
    }

    // =========================================================================
    // 10. GLOBAL WINDOW HELPERS (TABS, CAMERA, MODALS, RESET)
    // =========================================================================
    window.switchTab = function (tabName) {
        state.activeTab = tabName;
        document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        if (tabName === 'gallery') {
            initGallery3D();
            setTimeout(() => {
                const gBox = document.getElementById('gallery-viewport');
                if (gBox && galleryRenderer) {
                    const gw = Math.max(gBox.clientWidth || 460, 280);
                    const gh = Math.max(gBox.clientHeight || 460, 280);
                    galleryCamera.aspect = gw / gh;
                    galleryCamera.updateProjectionMatrix();
                    galleryRenderer.setSize(gw, gh);
                }
            }, 60);
        } else if (tabName === 'teacher') {
            loadTeacherRecords();
        }
    };

    window.setCameraPreset = function (preset) {
        if (preset === 'overview') { camera.position.set(0.4, 13.2, 18.3); controls.target.set(0.5, 0.9, 1.9); }
        else if (preset === 'motherboard') { camera.position.set(-1.6, 6.2, 4.2); controls.target.set(-1.65, 0.4, -0.05); }
        else if (preset === 'monitor') { camera.position.set(3.2, 3.2, 5.2); controls.target.set(4.55, 2.2, -0.35); }
        controls.update();
    };

    window.focusSelectedComponent3D = function () {
        if (!state.selectedPart) return;
        const target = componentMeshes[state.selectedPart].getWorldPosition(new THREE.Vector3());
        camera.position.set(target.x, target.y + 3.1, target.z + 3.6);
        controls.target.copy(target);
        controls.update();
    };

    window.triggerCasePower = triggerCasePower;

    window.resetSimulation = function () {
        state.installed = [];
        state.selectedPart = null;
        state.draggingPart = null;
        state.assemblyScore = 100;
        state.errorsCount = 0;
        state.pcPoweredOn = false;
        state.bootStage = 'OFF';
        state.startTime = Date.now();

        Object.keys(componentMeshes).forEach(partId => {
            const mesh = componentMeshes[partId];
            scene.add(mesh);
            mesh.position.copy(trayPositions[partId]);
            mesh.rotation.set(0, 0, 0);
            if (trayRotations[partId]) mesh.rotation.copy(trayRotations[partId]);
            mesh.scale.setScalar(partId === 'cable' ? 0.38 : 1);
        });
        powerLedMat.color.setHex(0x38bdf8);
        powerLedMat.emissive.setHex(0x0284c7);
        powerLedMat.emissiveIntensity = 0.25;

        document.getElementById('power-led-dot').className = 'w-2.5 h-2.5 rounded-full bg-slate-500';
        const badge = document.getElementById('pc-state-badge');
        badge.textContent = 'POWER: OFF';
        badge.className = 'text-[11px] mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800';
        document.getElementById('btn-case-power').classList.remove('power-ready', 'bg-sky-600');
        document.getElementById('windows-actions').classList.add('hidden');

        updateMonitorScreen('OFF');
        highlightSlots(false);
        window.setCameraPreset('overview');
        showStatusBanner('info', 'Simulasi Direset!', 'Seret (drag & drop) kembali seluruh komponen 3D ke slot yang tepat.');
        updateHUD();
    };

    window.openWindowsModal = function () {
        document.getElementById('windows-modal').classList.remove('hidden');
        document.getElementById('win-clock').textContent = new Date().toTimeString().slice(0, 5) + ' WIB';
    };
    window.closeWindowsModal = function () {
        document.getElementById('windows-modal').classList.add('hidden');
    };
    window.toggleSysInfoWindow = function () {
        document.getElementById('win-sys-window').classList.toggle('hidden');
    };

    window.openCertificateModal = function () {
        document.getElementById('cert-student-name').textContent = document.getElementById('student-name-input').value || 'Nama Siswa';
        document.getElementById('cert-student-class').textContent = document.getElementById('student-class-input').value || 'Kelas belum diisi';
        document.getElementById('cert-score').textContent = state.assemblyScore;
        document.getElementById('certificate-modal').classList.remove('hidden');
    };
    window.closeCertificateModal = function () {
        document.getElementById('certificate-modal').classList.add('hidden');
    };

    // =========================================================================
    // 11. ANIMATION LOOP, RESIZE OBSERVER, & BOOTSTRAP
    // =========================================================================
    let clockTime = 0;
    function animate() {
        requestAnimationFrame(animate);
        clockTime += 0.03;

        if (state.pcPoweredOn) {
            vgaFanMeshes.forEach(fan => { fan.rotation.y += 0.30; });
            cpuFanMeshes.forEach(fan => { fan.rotation.y += 0.34; });
        }

        Object.keys(componentMeshes).forEach((id, idx) => {
            if (!state.installed.includes(id) && state.draggingPart !== id) {
                componentMeshes[id].position.y = 0.15 + Math.sin(clockTime * 1.4 + idx) * 0.03;
            }
        });

        controls.update();
        renderer.render(scene, camera);

        if (galleryInitialized && state.activeTab === 'gallery') {
            galleryControls.update();
            galleryRenderer.render(galleryScene, galleryCamera);
        }
    }

    function resizeViewport() {
        if (!viewport) return;
        const w = viewport.clientWidth;
        const h = viewport.clientHeight;
        if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    }

    window.addEventListener('resize', resizeViewport);
    if (window.ResizeObserver && viewport) {
        new ResizeObserver(resizeViewport).observe(viewport);
    }

    // Fullscreen 3D viewport: mendukung fullscreen browser dan fallback fullscreen CSS.
    function syncFullscreenButton() {
        const button = document.getElementById('btn-viewport-fullscreen');
        if (!button) return;
        const isFull = document.fullscreenElement === viewport || viewport.classList.contains('sim-fallback-fullscreen');
        button.textContent = isFull ? '↙ Keluar Fullscreen' : '⛶ Fullscreen';
        button.setAttribute('aria-pressed', isFull ? 'true' : 'false');
    }
    window.toggleViewportFullscreen = async function () {
        try {
            if (document.fullscreenElement === viewport) {
                await document.exitFullscreen();
                viewport.classList.remove('sim-fallback-fullscreen');
            } else if (viewport.classList.contains('sim-fallback-fullscreen')) {
                viewport.classList.remove('sim-fallback-fullscreen');
            } else if (viewport.requestFullscreen) {
                await viewport.requestFullscreen({ navigationUI: 'hide' });
            } else {
                viewport.classList.add('sim-fallback-fullscreen');
            }
        } catch (error) {
            // Browser/perangkat yang membatasi Fullscreen API tetap mendapat mode layar penuh CSS.
            viewport.classList.toggle('sim-fallback-fullscreen');
        }
        syncFullscreenButton();
        setTimeout(resizeViewport, 80);
    };
    document.addEventListener('fullscreenchange', () => {
        syncFullscreenButton();
        setTimeout(resizeViewport, 80);
    });

    // Tema web gelap/terang disimpan agar pilihan tetap ada saat halaman dibuka lagi.
    function applyWebTheme(theme) {
        const light = theme === 'light';
        document.body.classList.toggle('theme-light', light);
        document.body.dataset.theme = light ? 'light' : 'dark';
        const button = document.getElementById('btn-web-theme');
        if (button) {
            button.textContent = light ? '☾ Mode Gelap' : '☀ Mode Terang';
            button.setAttribute('aria-pressed', light ? 'true' : 'false');
        }
        try { localStorage.setItem('sim-hardware-web-theme', light ? 'light' : 'dark'); } catch (error) {}
    }
    window.toggleWebTheme = function () {
        applyWebTheme(document.body.classList.contains('theme-light') ? 'dark' : 'light');
    };
    let savedTheme = 'dark';
    try { savedTheme = localStorage.getItem('sim-hardware-web-theme') || 'dark'; } catch (error) {}
    applyWebTheme(savedTheme);
    syncFullscreenButton();

    // Render segera tanpa menunggu backend
    renderPartsSidebar();
    updateHUD();
    loadQuizQuestions();
    animate();

    // Sinkronisasi opsional dengan backend Python jika server aktif
    (async function syncCatalogWithBackend() {
        try {
            const res = await fetch('/api/components');
            if (res.ok) {
                const data = await res.json();
                if (data.catalog) CATALOG = data.catalog;
                if (data.motherboard) MOTHERBOARD_META = data.motherboard;
                renderPartsSidebar();
            }
        } catch (e) {}
    })();
})();
