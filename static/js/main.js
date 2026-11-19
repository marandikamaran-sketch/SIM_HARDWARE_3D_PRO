/**
 * ============================================================================
 * MAIN APPLICATION CONTROLLER (static/js/main.js)
 * Mengatur:
 * 1. Laboratorium Rakit PC 3D Realistis (Drag & Drop ke Slot Motherboard/PSU)
 * 2. Galeri Inspeksi Komponen Asli 360° (Penjelasan Bentuk, Warna, & Analogi)
 * 3. Kuis Evaluasi TIK Kelas VII (Terhubung ke Backend Python / Vercel API)
 * 4. Rekap Nilai Guru & Ekspor CSV (Sinkronisasi Server + Browser Backup)
 * ============================================================================
 */

(function () {
    const T = window.HardwareTextures;
    const M = window.HardwareModels3D;
    const LOCAL_BACKUP_KEY = 'sim_hardware_3d_records_v1';

    let CATALOG = {};
    let MOTHERBOARD_META = {};

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
    // 1. WEB AUDIO SYNTHESIZER (KLIK MEKANIS, BEEP BIOS, & SUARA ERROR)
    // =========================================================================
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playTone(freq, type = 'sine', duration = 0.12, vol = 0.14, delay = 0) {
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

    function playSnapSound() {
        playTone(540, 'triangle', 0.08, 0.18, 0);
        playTone(920, 'sine', 0.14, 0.16, 0.06);
    }

    function playErrorSound() {
        playTone(185, 'sawtooth', 0.22, 0.18, 0);
        playTone(140, 'sawtooth', 0.28, 0.18, 0.18);
    }

    function playBootBeep() {
        playTone(1000, 'sine', 0.18, 0.16, 0.08);
    }

    // =========================================================================
    // 2. INISIALISASI SCENE THREE.JS UTAMA (RAKITAN PC & MONITOR)
    // =========================================================================
    const canvas = document.getElementById('three-canvas');
    const viewport = document.getElementById('viewport-wrapper');

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060912, 0.02);

    const camera = new THREE.PerspectiveCamera(42, viewport.clientWidth / viewport.clientHeight, 0.1, 100);
    camera.position.set(0.4, 9.2, 11.8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 4.2;
    controls.maxDistance = 22;
    controls.target.set(0, 1.2, 0);

    scene.add(new THREE.AmbientLight(0xdbeafe, 0.72));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(7, 15, 9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    const d = 11;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
    rimLight.position.set(-9, 8, -7);
    scene.add(rimLight);

    const deskMesh = new THREE.Mesh(
        new THREE.BoxGeometry(24, 0.5, 13.5),
        new THREE.MeshStandardMaterial({ color: 0x131c2e, roughness: 0.45, metalness: 0.25 })
    );
    deskMesh.position.set(0, -0.25, 0);
    deskMesh.receiveShadow = true;
    scene.add(deskMesh);

    const antiStaticMat = new THREE.Mesh(
        new THREE.BoxGeometry(9.6, 0.04, 7.6),
        new THREE.MeshStandardMaterial({ color: 0x090f1d, roughness: 0.85 })
    );
    antiStaticMat.position.set(-2.35, 0.02, 0.15);
    antiStaticMat.receiveShadow = true;
    scene.add(antiStaticMat);

    // =========================================================================
    // 3. CASING PC ATX TERBUKA, TOMBOL POWER 3D, MOTHERBOARD, & MONITOR
    // =========================================================================
    const caseGroup = new THREE.Group();
    caseGroup.position.set(-2.4, 0.05, 0.15);
    scene.add(caseGroup);

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.76 });
    const darkChassisMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.65 });

    const caseBase = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.22, 6.4), darkChassisMat);
    caseBase.position.set(0, 0.11, 0);
    caseBase.castShadow = true;
    caseBase.receiveShadow = true;
    caseGroup.add(caseBase);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.38, 6.4), steelMat);
    backWall.position.set(-3.98, 0.80, 0);
    caseGroup.add(backWall);

    const topBezel = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.38, 0.28), steelMat);
    topBezel.position.set(0, 0.80, -3.06);
    caseGroup.add(topBezel);

    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.38, 6.4), steelMat);
    frontPanel.position.set(3.95, 0.80, 0);
    caseGroup.add(frontPanel);

    const powerBtnRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.33, 0.35, 0.14, 32),
        new THREE.MeshStandardMaterial({ color: 0x060912, metalness: 0.85, roughness: 0.2 })
    );
    powerBtnRing.position.set(3.95, 1.51, 2.15);
    caseGroup.add(powerBtnRing);

    const powerLedMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25,
        roughness: 0.2
    });
    const powerButtonMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.23, 0.16, 32),
        powerLedMat
    );
    powerButtonMesh.position.set(3.95, 1.53, 2.15);
    caseGroup.add(powerButtonMesh);

    const psuBay = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.18, 2.3),
        new THREE.MeshStandardMaterial({ color: 0x172033, roughness: 0.5, metalness: 0.6 })
    );
    psuBay.position.set(-2.7, 0.25, 1.85);
    psuBay.receiveShadow = true;
    caseGroup.add(psuBay);

    const moboGroup = M.buildMotherboardAssembly();
    moboGroup.position.set(0.75, 0.32, -0.25);
    caseGroup.add(moboGroup);

    // =========================================================================
    // 4. SLOT TARGET DI MOTHERBOARD & RUANG PSU
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
            new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.0,
                depthWrite: false
            })
        );
        highlight.position.y = 0.08;
        group.add(highlight);
        slotHighlightMeshes[slotId] = highlight;
    }

    createTargetSlot('slot_cpu', moboGroup, new THREE.Vector3(-0.2, 0.08, -0.75), new THREE.Vector3(1.25, 0.55, 1.25), (g) => {
        const pinArray = new THREE.Mesh(
            new THREE.BoxGeometry(1.04, 0.06, 1.04),
            new THREE.MeshStandardMaterial({ map: T.createCPUSocketPinTexture(), metalness: 0.85, roughness: 0.3 })
        );
        g.add(pinArray);

        const retentionFrame = new THREE.Mesh(
            new THREE.BoxGeometry(1.18, 0.09, 1.18),
            new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.22 })
        );
        retentionFrame.position.y = 0.02;
        g.add(retentionFrame);

        const leverArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.25, 10),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
        );
        leverArm.rotation.x = Math.PI / 2;
        leverArm.position.set(0.64, 0.06, 0);
        g.add(leverArm);
    });

    createTargetSlot('slot_ram', moboGroup, new THREE.Vector3(1.35, 0.12, -0.75), new THREE.Vector3(0.85, 0.72, 2.35), (g) => {
        [-0.18, 0.18].forEach((offsetX, idx) => {
            const slot = new THREE.Mesh(
                new THREE.BoxGeometry(0.16, 0.18, 2.15),
                new THREE.MeshStandardMaterial({ color: idx === 0 ? 0x0f172a : 0x475569, roughness: 0.45 })
            );
            slot.position.set(offsetX, 0.06, 0);
            g.add(slot);

            [-1.10, 1.10].forEach(zEnd => {
                const latch = new THREE.Mesh(
                    new THREE.BoxGeometry(0.18, 0.25, 0.12),
                    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
                );
                latch.position.set(offsetX, 0.11, zEnd);
                g.add(latch);
            });
        });
    });

    createTargetSlot('slot_ssd', moboGroup, new THREE.Vector3(-0.15, 0.09, 0.35), new THREE.Vector3(1.65, 0.45, 0.65), (g) => {
        const m2Conn = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.14, 0.48),
            new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 })
        );
        m2Conn.position.set(-0.68, 0.04, 0);
        g.add(m2Conn);

        const standoff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 })
        );
        standoff.position.set(0.68, 0.04, 0);
        g.add(standoff);
    });

    createTargetSlot('slot_vga', moboGroup, new THREE.Vector3(-0.35, 0.12, 1.05), new THREE.Vector3(2.85, 0.85, 0.78), (g) => {
        const pcieSlot = new THREE.Mesh(
            new THREE.BoxGeometry(2.48, 0.20, 0.22),
            new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 })
        );
        pcieSlot.position.y = 0.08;
        g.add(pcieSlot);
    });

    createTargetSlot('slot_psu', caseGroup, new THREE.Vector3(-2.7, 0.35, 1.85), new THREE.Vector3(2.2, 1.15, 2.2), null);

    createTargetSlot('slot_cable', moboGroup, new THREE.Vector3(2.48, 0.14, -0.35), new THREE.Vector3(0.65, 0.65, 1.55), (g) => {
        const header24 = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.24, 1.25),
            new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
        );
        header24.position.y = 0.1;
        g.add(header24);
    });

    // =========================================================================
    // 5. MONITOR IPS 3D DI ATAS MEJA KERJA
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
    monitorGroup.position.set(4.55, 0, -0.35);
    monitorGroup.rotation.y = -0.34;
    scene.add(monitorGroup);

    const monBase = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.12, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.82, roughness: 0.25 })
    );
    monBase.position.y = 0.06;
    monitorGroup.add(monBase);

    const monNeck = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 1.85, 0.26),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 })
    );
    monNeck.position.set(0, 0.95, -0.35);
    monitorGroup.add(monNeck);

    const monBezel = new THREE.Mesh(
        new THREE.BoxGeometry(4.85, 3.05, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.65, roughness: 0.3 })
    );
    monBezel.position.set(0, 2.35, -0.15);
    monitorGroup.add(monBezel);

    updateMonitorScreen('OFF');
    const monDisplay = new THREE.Mesh(
        new THREE.PlaneGeometry(4.62, 2.84),
        new THREE.MeshStandardMaterial({ map: monitorScreenTex, roughness: 0.18, metalness: 0.05 })
    );
    monDisplay.position.set(0, 2.35, -0.055);
    monitorGroup.add(monDisplay);

    // =========================================================================
    // 6. TRAY KOMPONEN 3D REALISTIS & INTERAKSI DRAG-AND-DROP
    // =========================================================================
    const componentMeshes = {};
    const vgaFanMeshes = [];

    const trayPositions = {
        cpu: new THREE.Vector3(-5.2, 0.15, 4.35),
        ram: new THREE.Vector3(-3.3, 0.15, 4.35),
        ssd: new THREE.Vector3(-1.3, 0.15, 4.35),
        vga: new THREE.Vector3(1.2, 0.15, 4.35),
        psu: new THREE.Vector3(3.8, 0.15, 4.35),
        cable: new THREE.Vector3(6.0, 0.15, 4.35)
    };

    function initComponentMeshes() {
        const builders = {
            cpu: () => M.buildCPU3D(),
            ram: () => M.buildRAM3D(),
            ssd: () => M.buildSSD3D(),
            vga: () => M.buildVGA3D(vgaFanMeshes),
            psu: () => M.buildPSU3D(),
            cable: () => M.buildCable3D()
        };

        Object.keys(CATALOG).forEach(partId => {
            const meshGroup = builders[partId]();
            meshGroup.position.copy(trayPositions[partId]);
            meshGroup.traverse(child => {
                child.userData.partId = partId;
            });
            scene.add(meshGroup);
            componentMeshes[partId] = meshGroup;
        });
    }

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

    renderer.domElement.addEventListener('pointermove', (e) => {
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

    window.addEventListener('pointerup', () => {
        if (!state.draggingPart) return;
        const partId = state.draggingPart;
        const slotId = state.hoveredSlot;

        state.draggingPart = null;
        state.hoveredSlot = null;
        controls.enabled = true;
        renderer.domElement.style.cursor = 'grab';
        highlightSlots(false);

        if (slotId) {
            attemptInstallComponent(partId, slotId);
        } else {
            componentMeshes[partId].position.copy(trayPositions[partId]);
        }
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
        if (slotId) {
            attemptInstallComponent(partId, slotId);
        } else {
            componentMeshes[partId].position.copy(trayPositions[partId]);
        }
    });

    async function attemptInstallComponent(partId, targetSlot) {
        const res = await fetch('/api/validate-drop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                component_id: partId,
                target_slot: targetSlot,
                installed: state.installed
            })
        });
        const result = await res.json();

        if (result.valid) {
            playSnapSound();
            state.installed.push(partId);
            snapComponentToBoard3D(partId);
            showStatusBanner('success', result.title, result.message);
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
        if (partId === 'cpu') {
            moboGroup.add(mesh);
            mesh.position.set(-0.2, 0.12, -0.75);
        } else if (partId === 'ram') {
            moboGroup.add(mesh);
            mesh.position.set(1.35, 0.14, -0.75);
        } else if (partId === 'ssd') {
            moboGroup.add(mesh);
            mesh.position.set(-0.15, 0.13, 0.35);
        } else if (partId === 'vga') {
            moboGroup.add(mesh);
            mesh.position.set(-0.35, 0.22, 1.05);
        } else if (partId === 'psu') {
            caseGroup.add(mesh);
            mesh.position.set(-2.7, 0.34, 1.85);
        } else if (partId === 'cable') {
            caseGroup.add(mesh);
            mesh.position.set(0.75, 0.32, -0.25);
        }
    }

    async function triggerCasePower() {
        powerButtonMesh.position.y = 1.48;
        setTimeout(() => { powerButtonMesh.position.y = 1.53; }, 160);

        const res = await fetch('/api/power-on', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ installed: state.installed })
        });
        const bootRes = await res.json();

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
        showStatusBanner('success', 'PC Menyala! POST BIOS Berhasil...', 'Memuat Sistem Operasi Windows 11 di monitor...');
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
        }, 1500);
    }

    async function saveRecordToBackend(statusText) {
        const studentName = document.getElementById('student-name-input').value.trim() || 'Siswa Kelas VII';
        const studentClass = document.getElementById('student-class-input').value.trim() || 'VII SMPIT Sahabat Alam';
        const duration = Math.round((Date.now() - state.startTime) / 1000);

        const bodyPayload = {
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
                body: JSON.stringify(bodyPayload)
            });
            const data = await res.json();
            if (data && data.record) {
                const existing = JSON.parse(localStorage.getItem(LOCAL_BACKUP_KEY) || '[]');
                existing.push(data.record);
                localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(existing));
            }
        } catch (e) {}
    }

    // =========================================================================
    // 7. RENDER SIDEBAR, CHECKLIST, INSPECTOR, & TABS
    // =========================================================================
    function renderPartsSidebar() {
        const list = document.getElementById('parts-list');
        list.innerHTML = '';

        Object.values(CATALOG).forEach(part => {
            const isInst = state.installed.includes(part.id);
            const isSel = state.selectedPart === part.id;

            const card = document.createElement('div');
            card.draggable = !isInst;
            card.className = `part-card p-3 rounded-xl border border-slate-800 bg-slate-950/85 cursor-pointer ${isInst ? 'installed' : ''} ${isSel ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="flex items-center justify-between gap-2">
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 mono">#${part.order_hint}</span>
                            <h4 class="text-xs font-bold text-white">${part.name}</h4>
                        </div>
                        <p class="text-[11px] text-slate-400 mt-0.5">${part.subtitle}</p>
                    </div>
                    <span class="text-xs font-bold ${isInst ? 'text-emerald-400' : 'text-sky-400'}">
                        ${isInst ? '✓ Terpasang' : '⤢ Drag'}
                    </span>
                </div>
            `;

            card.addEventListener('click', () => selectComponent(part.id));
            card.addEventListener('dragstart', (e) => {
                if (isInst) return e.preventDefault();
                state.draggingPart = part.id;
                selectComponent(part.id);
                highlightSlots(true);
            });
            card.addEventListener('dragend', () => {
                state.draggingPart = null;
                highlightSlots(false);
            });

            list.appendChild(card);
        });

        const checkBar = document.getElementById('checklist-bar');
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
        document.getElementById('hud-installed').textContent = `${state.installed.length}/6`;
        document.getElementById('hud-score').textContent = state.assemblyScore;
        document.getElementById('hud-errors').textContent = state.errorsCount;

        const powerBtn = document.getElementById('btn-case-power');
        if (state.installed.length === 6 && !state.pcPoweredOn) {
            powerBtn.classList.add('power-ready', 'bg-sky-600');
            showStatusBanner(
                'success',
                'Semua 6 Komponen Terpasang! Siap Dinyalakan!',
                'Tekan <strong>Tombol Power di Casing PC</strong> (atau klik tombol Power biru di bawah) untuk menyalakan Windows!'
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

        galleryScene = new THREE.Scene();
        galleryCamera = new THREE.PerspectiveCamera(40, gBox.clientWidth / gBox.clientHeight, 0.1, 50);
        galleryCamera.position.set(2.8, 2.4, 3.6);

        galleryRenderer = new THREE.WebGLRenderer({ canvas: gCanvas, antialias: true, alpha: true });
        galleryRenderer.setSize(gBox.clientWidth, gBox.clientHeight);
        galleryRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
            if (itemId === 'cpu') {
                galleryCurrentMesh = M.buildCPU3D();
                galleryCurrentMesh.scale.set(2.2, 2.2, 2.2);
            } else if (itemId === 'ram') {
                galleryCurrentMesh = M.buildRAM3D();
                galleryCurrentMesh.scale.set(1.45, 1.45, 1.45);
            } else if (itemId === 'ssd') {
                galleryCurrentMesh = M.buildSSD3D();
                galleryCurrentMesh.scale.set(1.85, 1.85, 1.85);
            } else if (itemId === 'vga') {
                galleryCurrentMesh = M.buildVGA3D(null);
                galleryCurrentMesh.scale.set(0.95, 0.95, 0.95);
            } else if (itemId === 'psu') {
                galleryCurrentMesh = M.buildPSU3D();
                galleryCurrentMesh.scale.set(1.15, 1.15, 1.15);
            } else if (itemId === 'cable') {
                galleryCurrentMesh = M.buildCable3D();
                galleryCurrentMesh.scale.set(0.55, 0.55, 0.55);
            }
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
    let quizData = [];

    async function loadQuizQuestions() {
        const res = await fetch('/api/quiz');
        const data = await res.json();
        quizData = data.questions || [];
        const container = document.getElementById('quiz-questions-container');
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

    window.submitQuizAnswers = async function () {
        const answers = {};
        quizData.forEach(q => {
            const checked = document.querySelector(`input[name="quiz_q_${q.id}"]:checked`);
            if (checked) answers[String(q.id)] = parseInt(checked.value, 10);
        });

        const res = await fetch('/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
        });
        const result = await res.json();
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
        const res = await fetch('/api/teacher/records');
        const data = await res.json();
        const tbody = document.getElementById('teacher-records-body');
        const serverRecords = data.records || [];
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
                <td class="py-2.5 px-3 mono font-bold text-emerald-400">${r.quiz_score !== null ? r.quiz_score : '-'}</td>
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
                    galleryCamera.aspect = gBox.clientWidth / gBox.clientHeight;
                    galleryCamera.updateProjectionMatrix();
                    galleryRenderer.setSize(gBox.clientWidth, gBox.clientHeight);
                }
            }, 60);
        } else if (tabName === 'teacher') {
            loadTeacherRecords();
        }
    };

    window.setCameraPreset = function (preset) {
        if (preset === 'overview') {
            camera.position.set(0.4, 9.2, 11.8);
            controls.target.set(0, 1.2, 0);
        } else if (preset === 'motherboard') {
            camera.position.set(-1.6, 6.2, 4.2);
            controls.target.set(-1.65, 0.4, -0.05);
        } else if (preset === 'monitor') {
            camera.position.set(3.2, 3.2, 5.2);
            controls.target.set(4.55, 2.2, -0.35);
        }
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
        document.getElementById('cert-student-name').textContent = document.getElementById('student-name-input').value || 'Peserta Didik Kelas VII';
        document.getElementById('cert-student-class').textContent = document.getElementById('student-class-input').value || 'VII SMPIT Sahabat Alam';
        document.getElementById('cert-score').textContent = state.assemblyScore;
        document.getElementById('certificate-modal').classList.remove('hidden');
    };
    window.closeCertificateModal = function () {
        document.getElementById('certificate-modal').classList.add('hidden');
    };

    // =========================================================================
    // 11. ANIMATION LOOP & BOOTSTRAP
    // =========================================================================
    let clockTime = 0;
    function animate() {
        requestAnimationFrame(animate);
        clockTime += 0.03;

        if (state.pcPoweredOn) {
            vgaFanMeshes.forEach(fan => {
                fan.rotation.y += 0.30;
            });
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

    window.addEventListener('resize', () => {
        if (viewport) {
            camera.aspect = viewport.clientWidth / viewport.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        }
    });

    async function bootstrap() {
        const res = await fetch('/api/components');
        const data = await res.json();
        CATALOG = data.catalog;
        MOTHERBOARD_META = data.motherboard;

        initComponentMeshes();
        renderPartsSidebar();
        updateHUD();
        loadQuizQuestions();
        animate();
    }

    bootstrap();
})();
