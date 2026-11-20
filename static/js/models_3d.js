/**
 * ============================================================================
 * REALISTIC 3D HARDWARE BUILDER (static/js/models_3d.js)
 * Membangun model 3D komponen komputer menyerupai bentuk & warna aslinya:
 * - RAM PCB Hijau Asli lengkap dengan chip memori IC hitam & pin emas bertakik
 * - Processor Intel Core Ultra 9 dengan IHS berlekuk & matriks kontak emas
 * - VGA triple-fan dengan heatsink aluminium, heatpipe tembaga, backplate, & konektor PCIe
 * ============================================================================
 */

window.HardwareModels3D = (function () {
    const T = window.HardwareTextures;

    // Gabungkan salinan geometri statis menjadi satu BufferGeometry. Selain
    // mengurangi draw-call di perangkat sentuh, bentuk ini tetap kompatibel
    // dengan GLTFExporter versi lama yang dipakai halaman ekspor proyek.
    function mergeTranslatedGeometry(baseGeometry, offsets) {
        const basePos = baseGeometry.attributes.position;
        const baseNormal = baseGeometry.attributes.normal;
        const baseUV = baseGeometry.attributes.uv;
        const baseIndex = baseGeometry.index;
        const positions = [], normals = [], uvs = [], indices = [];
        offsets.forEach(([ox, oy, oz]) => {
            const vertexOffset = positions.length / 3;
            for (let i = 0; i < basePos.count; i++) {
                positions.push(basePos.getX(i) + ox, basePos.getY(i) + oy, basePos.getZ(i) + oz);
                if (baseNormal) normals.push(baseNormal.getX(i), baseNormal.getY(i), baseNormal.getZ(i));
                if (baseUV) uvs.push(baseUV.getX(i), baseUV.getY(i));
            }
            if (baseIndex) {
                for (let i = 0; i < baseIndex.count; i++) indices.push(vertexOffset + baseIndex.getX(i));
            } else {
                for (let i = 0; i < basePos.count; i++) indices.push(vertexOffset + i);
            }
        });
        const merged = new THREE.BufferGeometry();
        merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        if (normals.length) merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        if (uvs.length) merged.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        merged.setIndex(indices);
        if (!normals.length) merged.computeVertexNormals();
        merged.computeBoundingSphere();
        return merged;
    }

    function buildMotherboardAssembly() {
        // ATX Z790 DDR4 yang lebih rapi dan realistis. Koordinat soket CPU,
        // DIMM, M.2, PCIe, dan 24-pin sengaja dipertahankan agar drag-drop
        // serta snap komponen pada main.js tetap presisi.
        const g = new THREE.Group();
        const mat = {
            black: new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.32, metalness: 0.30 }),
            blackSoft: new THREE.MeshStandardMaterial({ color: 0x202a32, roughness: 0.38, metalness: 0.22 }),
            pcb: new THREE.MeshStandardMaterial({ color: 0x092b20, roughness: 0.48, metalness: 0.16 }),
            alloy: new THREE.MeshStandardMaterial({ color: 0x9aa6b2, roughness: 0.24, metalness: 0.86 }),
            darkAlloy: new THREE.MeshStandardMaterial({ color: 0x344252, roughness: 0.28, metalness: 0.82 }),
            nickel: new THREE.MeshStandardMaterial({ color: 0xd8e0e8, roughness: 0.20, metalness: 0.92 }),
            gold: new THREE.MeshStandardMaterial({ color: 0xd9ad4c, roughness: 0.20, metalness: 0.94 }),
            goldBright: new THREE.MeshStandardMaterial({ color: 0xf0c96a, roughness: 0.18, metalness: 0.96 }),
            blue: new THREE.MeshStandardMaterial({ color: 0x1e4e78, roughness: 0.32, metalness: 0.34 }),
            socket: new THREE.MeshStandardMaterial({ color: 0x090f17, roughness: 0.36, metalness: 0.22 }),
            cap: new THREE.MeshStandardMaterial({ color: 0xc5cdd3, roughness: 0.20, metalness: 0.90 }),
            capTop: new THREE.MeshStandardMaterial({ color: 0x334b62, roughness: 0.30, metalness: 0.65 }),
            green: new THREE.MeshStandardMaterial({ color: 0x1b7142, roughness: 0.45, metalness: 0.20 })
        };
        const pcb = new THREE.Mesh(
            new THREE.BoxGeometry(5.6, 0.12, 4.9),
            new THREE.MeshStandardMaterial({ map: T.createMotherboardPCBTexture(), roughness: 0.43, metalness: 0.22 })
        );
        pcb.receiveShadow = true; pcb.castShadow = true; pcb.userData.partId = 'motherboard'; g.add(pcb);

        function addBox(x, y, z, w, h, d, material, part = 'motherboard') {
            const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
            o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
            o.userData.partId = part; g.add(o); return o;
        }
        function addCylinder(x, y, z, r, h, material, part = 'motherboard', segments = 20) {
            const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segments), material);
            o.position.set(x, y, z); o.castShadow = true; o.userData.partId = part; g.add(o); return o;
        }
        function addTube(points, radius, material) {
            const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
            const o = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, points.length * 5), radius, 5, false), material);
            o.userData.partId = 'motherboard'; g.add(o); return o;
        }
        function addSilkText(text, x, z, w, h, color = '#d6e0d9') {
            const c = document.createElement('canvas'); c.width = 512; c.height = 128;
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.fillStyle = color; ctx.font = 'bold 42px Arial';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 64, 500);
            const tex = new THREE.CanvasTexture(c);
            if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 8;
            const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
            o.rotation.x = -Math.PI / 2; o.position.set(x, 0.064, z); o.userData.partId = 'motherboard'; g.add(o); return o;
        }
        function finBlock(x, z, w, d, count, alongX = true) {
            addBox(x, 0.205, z, w, 0.25, d, mat.darkAlloy);
            addBox(x, 0.335, z, w * 0.92, 0.018, d * 0.92, mat.blackSoft);
            for (let i = 0; i < count; i++) {
                const step = (alongX ? w : d) / count;
                if (alongX) addBox(x - w / 2 + step * (i + 0.5), 0.395, z, 0.022, 0.11, d * 0.88, mat.alloy);
                else addBox(x, 0.395, z - d / 2 + step * (i + 0.5), w * 0.88, 0.11, 0.022, mat.alloy);
            }
        }

        // Lubang pemasangan ATX dengan ring tembaga, annular pad, dan sekrup.
        [[-2.48,-2.12],[2.48,-2.12],[-2.48,2.12],[2.48,2.12],[-2.48,0],[2.48,0],[0,-2.12],[0,2.12]].forEach(([x,z]) => {
            const pad = new THREE.Mesh(new THREE.TorusGeometry(0.091, 0.014, 8, 24), mat.gold);
            pad.rotation.x = Math.PI / 2; pad.position.set(x, 0.066, z); pad.userData.partId = 'motherboard'; g.add(pad);
            addCylinder(x, 0.068, z, 0.030, 0.012, mat.nickel, 'motherboard', 12);
            const slot = addBox(x, 0.076, z, 0.055, 0.010, 0.008, mat.darkAlloy);
        });

        // VRM: heatsink berfin, choke, MOSFET, dan kapasitor di sisi atas CPU.
        finBlock(-0.24, -1.82, 1.82, 0.44, 22, true);
        finBlock(-1.78, -0.88, 0.43, 1.40, 16, false);
        for (let i = 0; i < 8; i++) {
            const x = -1.34 + i * 0.29;
            addBox(x, 0.145, -1.43, 0.19, 0.15, 0.18, mat.black);
            addBox(x, 0.226, -1.43, 0.135, 0.018, 0.125, mat.darkAlloy);
            addBox(x, 0.238, -1.43, 0.075, 0.008, 0.065, mat.blue);
            addCylinder(x + 0.12, 0.16, -1.16, 0.060, 0.17, mat.cap, 'motherboard', 20);
            addCylinder(x + 0.12, 0.249, -1.16, 0.061, 0.014, mat.capTop, 'motherboard', 20);
        }
        // EPS 8-pin CPU power connector dan pin kontaknya.
        addBox(-2.34, 0.18, -2.08, 0.53, 0.22, 0.46, mat.black);
        for (let i = 0; i < 8; i++) {
            addBox(-2.53 + (i % 4) * 0.125, 0.296, -2.18 + Math.floor(i / 4) * 0.16, 0.074, 0.018, 0.070, mat.gold);
        }
        addSilkText('CPU_PWR 8-PIN', -2.28, -1.75, 0.78, 0.12);

        // Soket LGA1700: carrier berbentuk persegi panjang, bidang kontak,
        // retention frame metal, engsel dan tuas pengunci. Dimensi dibuat
        // proporsional terhadap package CPU 1.04 x 0.90 tanpa mengubah pusat slot.
        addBox(-0.20, 0.105, -0.75, 1.24, 0.085, 1.10, mat.socket);
        addBox(-0.20, 0.151, -0.75, 1.105, 0.024, 0.985, mat.blackSoft);
        // Insulator/contact bed gelap agar spring contact emas terlihat terpisah.
        addBox(-0.20, 0.166, -0.75, 0.91, 0.012, 0.84, mat.black);

        // LGA spring contacts: pin mikro miring, bukan titik silinder tegak.
        // Geometri digabung menjadi dua mesh untuk menjaga performa layar sentuh.
        const pinOffsetsA = [], pinOffsetsB = [];
        for (let row = 0; row < 30; row++) {
            for (let col = 0; col < 32; col++) {
                const x = -0.6185 + col * 0.027;
                const z = -1.1415 + row * 0.027;
                ((row + col) % 2 === 0 ? pinOffsetsA : pinOffsetsB).push([x, 0.178, z]);
            }
        }
        const springA = new THREE.CylinderGeometry(0.0032, 0.0048, 0.022, 5);
        springA.rotateX(0.48);
        const springB = new THREE.CylinderGeometry(0.0032, 0.0048, 0.022, 5);
        springB.rotateX(-0.48);
        const contactsA = new THREE.Mesh(mergeTranslatedGeometry(springA, pinOffsetsA), mat.goldBright);
        const contactsB = new THREE.Mesh(mergeTranslatedGeometry(springB, pinOffsetsB), mat.gold);
        contactsA.userData.partId = 'motherboard'; contactsB.userData.partId = 'motherboard';
        g.add(contactsA, contactsB);

        // Retention frame LGA1700 berwarna nickel. Bagian tengah dibiarkan
        // terbuka ketika CPU dilepas sehingga contact array dapat dipelajari.
        addBox(-0.20, 0.198, -1.325, 1.31, 0.066, 0.060, mat.nickel);
        addBox(-0.20, 0.198, -0.175, 1.31, 0.066, 0.060, mat.nickel);
        addBox(-0.855, 0.198, -0.75, 0.060, 0.066, 1.09, mat.nickel);
        addBox(0.455, 0.198, -0.75, 0.060, 0.066, 1.09, mat.nickel);
        // Lapisan bibir hitam di bawah frame untuk memisahkan metal dari PCB.
        addBox(-0.20, 0.166, -1.292, 1.22, 0.025, 0.035, mat.blackSoft);
        addBox(-0.20, 0.166, -0.208, 1.22, 0.025, 0.035, mat.blackSoft);
        addBox(-0.826, 0.166, -0.75, 0.035, 0.025, 1.05, mat.blackSoft);
        addBox(0.426, 0.166, -0.75, 0.035, 0.025, 1.05, mat.blackSoft);

        // Engsel load plate di sisi atas dan tuas baja di sisi kanan.
        const hinge = addCylinder(-0.80, 0.218, -1.325, 0.034, 0.22, mat.darkAlloy, 'motherboard', 18);
        hinge.rotation.x = Math.PI / 2;
        addCylinder(-0.80, 0.218, -1.325, 0.018, 0.228, mat.nickel, 'motherboard', 16).rotation.x = Math.PI / 2;
        addBox(0.505, 0.226, -0.75, 0.052, 0.035, 0.83, mat.nickel);
        addBox(0.595, 0.231, -0.345, 0.20, 0.040, 0.060, mat.nickel);
        addBox(0.675, 0.232, -0.345, 0.045, 0.044, 0.074, mat.blackSoft);
        // Dua titik pivot dan sekrup kecil pada sudut frame.
        [[-0.79,-1.29],[0.39,-1.29],[-0.79,-0.21],[0.39,-0.21]].forEach(([x,z]) => {
            addCylinder(x, 0.235, z, 0.024, 0.012, mat.darkAlloy, 'motherboard', 12);
            addBox(x, 0.242, z, 0.021, 0.004, 0.004, mat.nickel);
        });
        addSilkText('LGA1700', -0.20, -1.43, 0.65, 0.12);

        // Empat slot DIMM DDR4. Tiap slot memiliki channel, kontak, key notch,
        // dan pengunci di kedua ujung. Posisi pusat slot sama dengan main.js.
        const dimmOffsets = [-0.54, -0.18, 0.18, 0.54];
        dimmOffsets.forEach((offset, index) => {
            const x = 1.35 + offset;
            addBox(x, 0.145, -0.75, 0.135, 0.17, 2.16, index % 2 === 0 ? mat.socket : mat.black);
            addBox(x, 0.235, -0.75, 0.045, 0.025, 2.02, mat.blackSoft);
            addBox(x, 0.249, -0.75, 0.018, 0.012, 0.10, mat.gold);
            const contactOffsets = [];
            for (let i = 0; i < 34; i++) contactOffsets.push([x, 0.238, -1.70 + i * 0.058]);
            const contacts = new THREE.Mesh(mergeTranslatedGeometry(new THREE.BoxGeometry(0.018,0.012,0.028), contactOffsets), mat.goldBright);
            contacts.userData.partId = 'motherboard'; g.add(contacts);
            [-1.88, 0.38].forEach(z => {
                addBox(x, 0.17, z, 0.17, 0.22, 0.10, mat.nickel);
                addBox(x, 0.292, z, 0.18, 0.045, 0.12, mat.darkAlloy);
                addBox(x, 0.315, z, 0.07, 0.012, 0.055, mat.black);
            });
            addSilkText(index === 0 ? 'A1' : index === 1 ? 'A2' : index === 2 ? 'B1' : 'B2', x, -2.02, 0.22, 0.10, '#dce8df');
        });
        addSilkText('DDR4 DIMM 288-PIN', 1.35, 0.55, 1.10, 0.12);

        // M.2 NVMe 2280: konektor di x=-0.83 dan standoff sekrup tepat di x=0.53.
        addBox(-0.83, 0.135, 0.35, 0.18, 0.14, 0.48, mat.socket);
        addBox(-0.83, 0.211, 0.35, 0.12, 0.018, 0.30, mat.gold);
        for (let i = 0; i < 12; i++) addBox(-0.89, 0.224, 0.22 + i * 0.024, 0.018, 0.008, 0.012, mat.goldBright);
        addCylinder(0.53, 0.105, 0.35, 0.064, 0.085, mat.gold, 'motherboard', 20);
        addCylinder(0.53, 0.153, 0.35, 0.038, 0.018, mat.nickel, 'motherboard', 16);
        addSilkText('M.2_1  NVMe 2280', -0.12, 0.03, 0.92, 0.105);

        // PCIe x16 reinforced steel slot for VGA. Secondary PCIe x1 slots below.
        addBox(-0.35, 0.115, 1.05, 2.52, 0.15, 0.22, mat.socket);
        addBox(-0.35, 0.196, 1.05, 2.40, 0.018, 0.075, mat.gold);
        addBox(-0.35, 0.217, 0.925, 2.48, 0.025, 0.035, mat.nickel);
        addBox(-1.63, 0.16, 1.05, 0.11, 0.13, 0.30, mat.darkAlloy);
        const pcieContacts = [];
        for (let i = 0; i < 44; i++) pcieContacts.push([-1.46 + i * 0.052, 0.218, 1.05]);
        const pcieGold = new THREE.Mesh(mergeTranslatedGeometry(new THREE.BoxGeometry(0.022,0.010,0.055), pcieContacts), mat.goldBright);
        pcieGold.userData.partId = 'motherboard'; g.add(pcieGold);
        [1.78, 2.05].forEach((z, i) => {
            addBox(-0.35, 0.105, z, 1.90, 0.09, 0.12, mat.socket);
            addBox(-0.35, 0.156, z, 1.78, 0.012, 0.035, mat.gold);
            addSilkText(i === 0 ? 'PCI_E2' : 'PCI_E3', -0.35, z + 0.16, 0.66, 0.09);
        });
        addSilkText('PCI_E1  PCIe x16', -0.35, 1.34, 1.10, 0.10);

        // PCH chipset heatsink and side ventilation grooves.
        addBox(1.48, 0.155, 1.42, 1.12, 0.20, 0.98, mat.darkAlloy);
        addBox(1.48, 0.267, 1.42, 0.94, 0.035, 0.80, mat.black);
        for (let i = 0; i < 7; i++) addBox(1.15 + i * 0.11, 0.29, 1.42, 0.025, 0.012, 0.70, mat.alloy);
        addSilkText('Z790 CHIPSET', 1.48, 2.01, 0.88, 0.11);

        // Rear I/O shield and individually framed USB, LAN, display and audio ports.
        addBox(-2.61, 0.22, -0.95, 0.25, 0.40, 2.26, mat.alloy);
        for (let i = 0; i < 4; i++) {
            const z = -1.77 + i * 0.22;
            addBox(-2.76, 0.31, z, 0.055, 0.15, 0.16, mat.black);
            addBox(-2.77, 0.31, z, 0.022, 0.055, 0.095, mat.blue);
        }
        addBox(-2.76, 0.23, -0.66, 0.055, 0.18, 0.28, mat.black);
        addBox(-2.76, 0.23, -0.28, 0.055, 0.18, 0.28, mat.black);
        addBox(-2.76, 0.23, 0.16, 0.055, 0.18, 0.28, mat.darkAlloy);
        for (let i = 0; i < 3; i++) addCylinder(-2.80, 0.21, 0.72 + i * 0.20, 0.065, 0.04, mat.gold, 'motherboard', 18);
        addSilkText('REAR I/O', -2.05, -2.20, 0.62, 0.10);

        // ATX 24-pin power connector on the right edge, two rows of contacts.
        addBox(2.48, 0.20, -0.35, 0.30, 0.27, 1.18, mat.black);
        for (let i = 0; i < 24; i++) {
            const row = Math.floor(i / 12);
            const col = i % 12;
            addBox(2.415 + row * 0.13, 0.345, -0.87 + col * 0.095, 0.018, 0.012, 0.035, mat.gold);
        }
        addSilkText('ATX 24-PIN', 2.12, -1.14, 0.82, 0.11);

        // Four SATA ports angled visually at the board's right-lower edge.
        for (let i = 0; i < 4; i++) {
            const z = 0.88 + i * 0.30;
            addBox(2.47, 0.15, z, 0.34, 0.18, 0.23, mat.black);
            addBox(2.47, 0.245, z, 0.23, 0.012, 0.12, mat.blue);
            addBox(2.47, 0.254, z, 0.16, 0.008, 0.035, mat.gold);
        }
        addSilkText('SATA 6Gb/s', 2.10, 2.10, 0.84, 0.10);

        // CMOS battery and audio section.
        addCylinder(-0.35, 0.105, 1.62, 0.245, 0.065, mat.black, 'motherboard', 32);
        addCylinder(-0.35, 0.15, 1.62, 0.202, 0.075, mat.nickel, 'motherboard', 32);
        addCylinder(-0.35, 0.19, 1.62, 0.168, 0.012, mat.alloy, 'motherboard', 32);
        addSilkText('CMOS', -0.35, 1.96, 0.38, 0.10);
        for (let i = 0; i < 6; i++) {
            addCylinder(-2.22 + (i % 3) * 0.20, 0.13, 1.40 + Math.floor(i / 3) * 0.25, 0.052, 0.13, mat.cap, 'motherboard', 18);
        }
        addSilkText('AUDIO', -2.22, 2.10, 0.48, 0.10);

        // Front-panel and fan headers at the bottom edge.
        for (let i = 0; i < 5; i++) {
            const x = -1.75 + i * 0.38;
            addBox(x, 0.11, 2.22, 0.20, 0.12, 0.15, mat.black);
            for (let j = 0; j < 4; j++) addBox(x - 0.06 + j * 0.04, 0.18, 2.22, 0.012, 0.035, 0.012, mat.gold);
        }
        addSilkText('F_PANEL  /  FAN_HEADER', -0.95, 2.36, 1.48, 0.09);

        // Small SMD arrays and copper via pads give the PCB scale and density.
        for (let i = 0; i < 42; i++) {
            const x = -2.25 + (i % 14) * 0.30;
            const z = -0.12 + Math.floor(i / 14) * 0.18;
            addBox(x, 0.079, z, 0.075, 0.025, 0.052, i % 3 === 0 ? mat.cap : mat.blackSoft);
            addBox(x - 0.050, 0.078, z, 0.014, 0.010, 0.052, mat.gold);
            addBox(x + 0.050, 0.078, z, 0.014, 0.010, 0.052, mat.gold);
        }
        for (let i = 0; i < 36; i++) {
            const x = -2.35 + (i % 12) * 0.42;
            const z = -0.35 + Math.floor(i / 12) * 0.42;
            const via = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 5, 10), mat.gold);
            via.rotation.x = Math.PI / 2; via.position.set(x, 0.064, z); via.userData.partId = 'motherboard'; g.add(via);
        }
        // Visible routed signal traces in selected areas, staying clear of slots.
        const traceMat = new THREE.MeshStandardMaterial({ color: 0x4b9a69, roughness: 0.34, metalness: 0.58 });
        [
            [[-2.35,0.067,-1.20],[-2.05,0.067,-1.20],[-1.86,0.067,-1.02]],
            [[-1.65,0.067,0.25],[-1.38,0.067,0.25],[-1.20,0.067,0.44]],
            [[0.62,0.067,-1.62],[0.75,0.067,-1.42],[0.75,0.067,-1.20]],
            [[1.95,0.067,0.15],[2.16,0.067,0.15],[2.30,0.067,0.35]],
            [[-2.10,0.067,1.10],[-1.90,0.067,1.10],[-1.72,0.067,0.95]]
        ].forEach(points => addTube(points, 0.008, traceMat));

        g.userData.partId = 'motherboard';
        return g;
    }

    function buildCPU3D() {
        // Intel Core i9-14900K LGA1700 package: ukuran ringkas disesuaikan
        // dengan target-slot CPU 1.25 x 1.25 di motherboard.
        const g=new THREE.Group();
        const substrateMat=new THREE.MeshStandardMaterial({color:0x123d2b,roughness:0.42,metalness:0.20});
        const edgeMat=new THREE.MeshStandardMaterial({color:0x1d5138,roughness:0.38,metalness:0.25});
        const goldMat=new THREE.MeshStandardMaterial({color:0xd7ad43,roughness:0.2,metalness:0.96});
        const darkMat=new THREE.MeshStandardMaterial({color:0x101820,roughness:0.35,metalness:0.22});
        const ihsMat=new THREE.MeshStandardMaterial({map:T.createCPUIHSTexture(),metalness:0.88,roughness:0.2});
        const substrate=new THREE.Mesh(new THREE.BoxGeometry(1.04,0.055,0.90),substrateMat);
        substrate.position.y=0.036;substrate.castShadow=true;substrate.userData.partId='cpu';g.add(substrate);
        // Lapisan tepi hijau dan garis laminasi package.
        const topBorder=new THREE.Mesh(new THREE.BoxGeometry(1.015,0.012,0.875),edgeMat);
        topBorder.position.y=0.068;g.add(topBorder);
        const ihs=new THREE.Mesh(new THREE.BoxGeometry(0.84,0.085,0.70),ihsMat);
        ihs.position.y=0.118;ihs.castShadow=true;ihs.userData.partId='cpu';g.add(ihs);
        // Bezel tipis di sekeliling integrated heat spreader.
        const rimMat=new THREE.MeshStandardMaterial({color:0x8e9aa5,metalness:0.9,roughness:0.24});
        [[0,0.076,-0.36,0.88,0.012,0.035],[0,0.076,0.36,0.88,0.012,0.035],[-0.44,0.076,0,0.035,0.012,0.69],[0.44,0.076,0,0.035,0.012,0.69]].forEach(a=>{
            const m=new THREE.Mesh(new THREE.BoxGeometry(a[3],a[4],a[5]),rimMat);m.position.set(a[0],a[1],a[2]);g.add(m);
        });
        // Index triangle and subtle laser marking on the substrate.
        const markerShape=new THREE.Shape();markerShape.moveTo(0,0);markerShape.lineTo(0.11,0);markerShape.lineTo(0,0.11);markerShape.closePath();
        const marker=new THREE.Mesh(new THREE.ShapeGeometry(markerShape),new THREE.MeshBasicMaterial({color:0xe6bd55,side:THREE.DoubleSide}));
        marker.rotation.x=-Math.PI/2;marker.position.set(-0.48,0.068,-0.40);g.add(marker);
        // LGA1700 flat contact lands: dense instanced micro pads on the underside.
        const padOffsets=[];
        for(let row=0;row<19;row++)for(let col=0;col<24;col++)padOffsets.push([-0.455+col*0.0395,0.006,-0.385+row*0.042]);
        const pads=new THREE.Mesh(mergeTranslatedGeometry(new THREE.CylinderGeometry(0.006,0.006,0.005,8),padOffsets),goldMat);
        pads.userData.partId='cpu';g.add(pads);
        // Edge contacts and side notches characteristic of the LGA1700 package.
        for(let i=0;i<9;i++){
            const x=-0.39+i*0.0975;
            const pad1=new THREE.Mesh(new THREE.BoxGeometry(0.052,0.006,0.012),goldMat);pad1.position.set(x,0.006,-0.435);g.add(pad1);
            const pad2=pad1.clone();pad2.position.z=0.435;g.add(pad2);
        }
        // Tiny passive components along the substrate perimeter.
        for(let i=0;i<10;i++){
            const x=-0.43+i*0.095;
            const cap=new THREE.Mesh(new THREE.BoxGeometry(0.045,0.018,0.028),i%2?darkMat:goldMat);
            cap.position.set(x,0.074,0.405);g.add(cap);
        }
        g.userData.partId='cpu';return g;
    }



    function buildCPUCooler3D(fanMeshesOut) {
        // Pendingin udara CPU model top-down: cold plate, tumpukan sirip aluminium,
        // rangka kipas 120 mm, rotor tujuh bilah, hub, klip, dan empat sekrup.
        const g = new THREE.Group();
        const nickel = new THREE.MeshStandardMaterial({ color: 0xb9c4cb, metalness: 0.88, roughness: 0.24 });
        const aluminium = new THREE.MeshStandardMaterial({ color: 0x8998a4, metalness: 0.91, roughness: 0.27 });
        const finMat = new THREE.MeshStandardMaterial({ color: 0xaab5bc, metalness: 0.88, roughness: 0.31 });
        const copper = new THREE.MeshStandardMaterial({ color: 0xb86e3c, metalness: 0.92, roughness: 0.22 });
        const black = new THREE.MeshStandardMaterial({ color: 0x151c24, metalness: 0.48, roughness: 0.30 });
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x202a34, metalness: 0.42, roughness: 0.29, side: THREE.DoubleSide });
        const screwMat = new THREE.MeshStandardMaterial({ color: 0x74818b, metalness: 0.94, roughness: 0.2 });

        // Mounting plate/cold plate duduk tepat di atas IHS processor.
        const coldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.075, 0.82), nickel);
        coldPlate.position.set(0, 0.210, 0);
        coldPlate.castShadow = true; coldPlate.receiveShadow = true; coldPlate.userData.partId = 'cpuCooler'; g.add(coldPlate);
        const thermalContact = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.012, 0.68), copper);
        thermalContact.position.set(0, 0.166, 0); thermalContact.userData.partId = 'cpuCooler'; g.add(thermalContact);

        // Sirip heatsink radial berlapis, terlihat dari sisi kipas.
        for (let i = 0; i < 12; i++) {
            const y = 0.31 + i * 0.034;
            const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.48 - i * 0.0015, 0.48 - i * 0.0015, 0.018, 48), finMat);
            fin.position.y = y; fin.castShadow = true; fin.receiveShadow = true; fin.userData.partId = 'cpuCooler'; g.add(fin);
        }
        // Empat heatpipe tembaga yang naik dari cold plate ke sirip pendingin.
        [-0.25, -0.08, 0.08, 0.25].forEach((x, i) => {
            const points = [
                new THREE.Vector3(x * 0.72, 0.25, 0.28),
                new THREE.Vector3(x, 0.40, 0.23),
                new THREE.Vector3(x, 0.66, 0.15),
                new THREE.Vector3(x * 0.72, 0.70, 0.08)
            ];
            const pipe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 0.025, 8, false), copper);
            pipe.castShadow = true; pipe.userData.partId = 'cpuCooler'; g.add(pipe);
        });

        // Rangka kipas persegi dan penyangga anti-getar.
        const frameY = 0.78;
        const frameBars = [
            [0, frameY, -0.46, 0.98, 0.10, 0.10], [0, frameY, 0.46, 0.98, 0.10, 0.10],
            [-0.46, frameY, 0, 0.10, 0.10, 0.82], [0.46, frameY, 0, 0.10, 0.10, 0.82]
        ];
        frameBars.forEach(([x,y,z,w,h,d]) => {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), black);
            bar.position.set(x,y,z); bar.castShadow = true; bar.userData.partId = 'cpuCooler'; g.add(bar);
        });
        const rotor = new THREE.Group(); rotor.position.set(0, 0.845, 0); rotor.userData.partId = 'cpuCooler';
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.10, 32), black); hub.castShadow = true; rotor.add(hub);
        const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.108, 32), nickel); hubCap.position.y = 0.008; rotor.add(hubCap);
        const hubDot = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.112, 20), copper); hubDot.position.y = 0.012; rotor.add(hubDot);
        for (let b = 0; b < 7; b++) {
            const shape = new THREE.Shape();
            shape.moveTo(0.105, -0.045);
            shape.bezierCurveTo(0.18, -0.13, 0.32, -0.17, 0.405, -0.055);
            shape.bezierCurveTo(0.34, 0.035, 0.22, 0.105, 0.115, 0.075);
            shape.closePath();
            const blade = new THREE.Mesh(new THREE.ShapeGeometry(shape, 10), bladeMat);
            blade.rotation.x = -Math.PI / 2;
            blade.rotation.y = b * Math.PI * 2 / 7;
            blade.position.y = 0.012;
            rotor.add(blade);
        }
        g.add(rotor);
        if (fanMeshesOut) fanMeshesOut.push(rotor);

        // Kisi pelindung dan empat baut sudut.
        const guardMat = new THREE.MeshStandardMaterial({ color: 0x65717b, metalness: 0.88, roughness: 0.25 });
        [0.17, 0.31, 0.445].forEach(r => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.009, 6, 48), guardMat);
            ring.rotation.x = Math.PI / 2; ring.position.y = 0.91; g.add(ring);
        });
        for (let a = 0; a < 4; a++) {
            const angle = a * Math.PI / 2 + Math.PI / 4;
            const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.025, 12), screwMat);
            screw.position.set(Math.cos(angle) * 0.41, 0.91, Math.sin(angle) * 0.41); g.add(screw);
        }
        const badge = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.012, 0.12), black);
        badge.position.set(0, 0.918, -0.29); g.add(badge);

        g.userData.partId = 'cpuCooler';
        return g;
    }

    function buildRAM3D(singleModule = false) {
        // Setiap keping RAM yang dipakai pada praktik dibuat sebagai objek terpisah.
        // Mode default legacy tetap dapat membuat dua keping untuk penggunaan galeri lama;
        // mode singleModule dipakai pada tray, pemasangan, galeri, dan ekspor GLB.
        const g = new THREE.Group();
        const pcbTexture = T.createGreenRAMPCBTexture();
        if (THREE.SRGBColorSpace) pcbTexture.colorSpace = THREE.SRGBColorSpace;
        else if (THREE.sRGBEncoding !== undefined) pcbTexture.encoding = THREE.sRGBEncoding;
        pcbTexture.anisotropy = 8;

        const pcbMat = new THREE.MeshStandardMaterial({
            map: pcbTexture,
            color: 0xffffff,
            roughness: 0.43,
            metalness: 0.18,
            side: THREE.DoubleSide
        });
        const icMat = new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.28, metalness: 0.26 });
        const icTopMat = new THREE.MeshStandardMaterial({ color: 0x202a32, roughness: 0.34, metalness: 0.22 });
        const solderMat = new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 0.86, roughness: 0.22 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd6a83b, metalness: 0.94, roughness: 0.2 });
        const goldBrightMat = new THREE.MeshStandardMaterial({ color: 0xf1ce72, metalness: 0.92, roughness: 0.18 });
        const traceMat = new THREE.MeshStandardMaterial({ color: 0x4b9b63, roughness: 0.52, metalness: 0.26, emissive: 0x09240f, emissiveIntensity: 0.18 });
        const passiveMat = new THREE.MeshStandardMaterial({ color: 0x20272d, roughness: 0.38, metalness: 0.2 });
        const labelTexture = (() => {
            const c = document.createElement('canvas');
            c.width = 512; c.height = 128;
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#e7e9e7'; ctx.fillRect(0, 0, c.width, c.height);
            ctx.strokeStyle = '#aab2ad'; ctx.lineWidth = 5; ctx.strokeRect(3, 3, 506, 122);
            ctx.fillStyle = '#19251e'; ctx.textAlign = 'center';
            ctx.font = 'bold 38px Arial'; ctx.fillText('DDR4 8GB 3200', 256, 52);
            ctx.font = '22px Arial'; ctx.fillText('PC4-25600 • 1.2V • UDIMM', 256, 87);
            ctx.font = '15px monospace'; ctx.fillText('288 PIN • DESKTOP MEMORY', 256, 111);
            const tex = new THREE.CanvasTexture(c);
            if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
            else if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
            tex.anisotropy = 8;
            return tex;
        })();
        const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture, side: THREE.DoubleSide, toneMapped: false });

        function addBox(parent, geometry, material, position, part = 'ram') {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.partId = part;
            parent.add(mesh);
            return mesh;
        }

        function createContactRows(stick) {
            // 288 kontak modul DDR4: 144 pad pada setiap muka. Semua pad dibuat
            // menjadi satu BufferGeometry per muka agar tetap ringan di HP/PID
            // dan kompatibel dengan proses ekspor GLB.
            const padGeometry = new THREE.BoxGeometry(0.009, 0.078, 0.0095);
            const basePos = padGeometry.attributes.position;
            const baseNormal = padGeometry.attributes.normal;
            const baseUV = padGeometry.attributes.uv;
            const baseIndex = padGeometry.index;
            const padPositions = [];
            for (let i = 0; i < 144; i++) {
                const z = -1.025 + (2.05 * i / 143);
                if (z > 0.075 && z < 0.225) continue; // takik posisi DDR4 yang asimetris
                padPositions.push(z);
            }
            [-1, 1].forEach(side => {
                const positions = [], normals = [], uvs = [], indices = [];
                padPositions.forEach((z, padIndex) => {
                    const vertexOffset = positions.length / 3;
                    for (let v = 0; v < basePos.count; v++) {
                        positions.push(
                            basePos.getX(v) + side * 0.023,
                            basePos.getY(v) + 0.121,
                            basePos.getZ(v) + z
                        );
                        normals.push(baseNormal.getX(v), baseNormal.getY(v), baseNormal.getZ(v));
                        uvs.push(baseUV.getX(v), baseUV.getY(v));
                    }
                    for (let j = 0; j < baseIndex.count; j++) indices.push(vertexOffset + baseIndex.getX(j));
                });
                const padsGeometry = new THREE.BufferGeometry();
                padsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                padsGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
                padsGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                padsGeometry.setIndex(indices);
                padsGeometry.computeBoundingSphere();
                const pads = new THREE.Mesh(padsGeometry, goldMat);
                pads.castShadow = false;
                pads.userData.partId = 'ram';
                stick.add(pads);
            });
        }

        function createModule(offsetX) {
            const stick = new THREE.Group();
            stick.position.x = offsetX;
            stick.userData.partId = 'ram';

            // PCB dibuat menjadi tiga bagian agar lekukan kunci bawah tampak nyata.
            // Board vertikal pada bidang Y-Z: ukuran mendekati DIMM desktop.
            addBox(stick, new THREE.BoxGeometry(0.036, 0.40, 2.12), pcbMat,
                new THREE.Vector3(0, 0.40, 0));
            addBox(stick, new THREE.BoxGeometry(0.036, 0.12, 1.14), pcbMat,
                new THREE.Vector3(0, 0.14, -0.49));
            addBox(stick, new THREE.BoxGeometry(0.036, 0.12, 0.84), pcbMat,
                new THREE.Vector3(0, 0.14, 0.64));

            // Garis laminasi / tepi PCB dan jalur sirkuit pada kedua sisi.
            [-1, 1].forEach(side => {
                const edgeLine = addBox(stick, new THREE.BoxGeometry(0.004, 0.365, 1.98), traceMat,
                    new THREE.Vector3(side * 0.0195, 0.405, 0));
                edgeLine.castShadow = false;
                for (let i = 0; i < 13; i++) {
                    const z = -0.91 + i * 0.15;
                    const trace = addBox(stick, new THREE.BoxGeometry(0.003, 0.12 + (i % 3) * 0.025, 0.012), traceMat,
                        new THREE.Vector3(side * 0.022, 0.25 + (i % 2) * 0.035, z));
                    trace.castShadow = false;
                }
            });

            // DRAM IC packages: delapan IC per sisi, dengan kaki solder halus.
            const chipPositions = [-0.84, -0.60, -0.36, -0.12, 0.12, 0.36, 0.60, 0.84];
            [-1, 1].forEach(side => {
                chipPositions.forEach((z, index) => {
                    addBox(stick, new THREE.BoxGeometry(0.046, 0.176, 0.165), icMat,
                        new THREE.Vector3(side * 0.050, 0.405, z), 'ram');
                    addBox(stick, new THREE.BoxGeometry(0.003, 0.148, 0.139), icTopMat,
                        new THREE.Vector3(side * 0.074, 0.405, z), 'ram');
                    // Garis penanda cetak pada permukaan IC (tanpa merek dagang palsu).
                    addBox(stick, new THREE.BoxGeometry(0.0018, 0.004, 0.055), solderMat,
                        new THREE.Vector3(side * 0.076, 0.43, z - 0.023), 'ram');
                });
            });

            // Chip SPD EEPROM kecil dan komponen pasif SMD pada area bawah board.
            addBox(stick, new THREE.BoxGeometry(0.038, 0.075, 0.085), icMat,
                new THREE.Vector3(0.045, 0.245, 0.91), 'ram');
            for (let i = 0; i < 10; i++) {
                const z = -0.91 + i * 0.19;
                addBox(stick, new THREE.BoxGeometry(0.035, 0.035, 0.055), passiveMat,
                    new THREE.Vector3(0.04, 0.235, z), 'ram');
                addBox(stick, new THREE.BoxGeometry(0.004, 0.012, 0.06), solderMat,
                    new THREE.Vector3(0.061, 0.235, z), 'ram');
            }

            // Stiker spesifikasi kecil pada muka depan tiap modul.
            const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.075), labelMat);
            sticker.rotation.y = Math.PI / 2;
            sticker.position.set(0.078, 0.55, 0.47);
            sticker.userData.partId = 'ram';
            stick.add(sticker);

            createContactRows(stick);

            // Lekukan key terlihat dari bentuk PCB dan celah kontak yang asimetris.

            g.add(stick);
        }

        // Mode tray memakai satu modul agar siswa dapat memasang RAM satu per satu.
        // Tanpa argumen, galeri tetap menampilkan sepasang modul dual-channel.
        if (singleModule) {
            createModule(0);
        } else {
            createModule(-0.18);
            createModule(0.54);
        }
        g.userData.partId = 'ram';
        return g;
    }

    function buildSSD3D() {
        // NVMe M.2 2280 satu sisi. Papan mempunyai takik M-Key pada hujung
        // konektor dan lubang baut tembus pada hujung 80 mm. Ukuran serta
        // pusat model dipertahankan agar snap ke slot_ssd tetap sama.
        const g = new THREE.Group();
        const pcbMat = new THREE.MeshStandardMaterial({ color: 0x073e2c, roughness: 0.40, metalness: 0.24, side: THREE.DoubleSide });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.28, metalness: 0.30 });
        const chipMat = new THREE.MeshStandardMaterial({ color: 0x202932, roughness: 0.30, metalness: 0.34 });
        const solderMat = new THREE.MeshStandardMaterial({ color: 0xc0c7cc, roughness: 0.22, metalness: 0.90 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd8ac45, roughness: 0.17, metalness: 0.96 });
        const goldBright = new THREE.MeshStandardMaterial({ color: 0xf0c96a, roughness: 0.16, metalness: 0.97 });
        const traceMat = new THREE.MeshStandardMaterial({ color: 0x69a977, roughness: 0.36, metalness: 0.56 });
        const passiveMat = new THREE.MeshStandardMaterial({ color: 0x242a30, roughness: 0.38, metalness: 0.28 });

        function addSSDBox(x, y, z, w, h, d, material, part = 'ssd') {
            const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
            o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
            o.userData.partId = part; g.add(o); return o;
        }
        function addMark(text, x, z, w, h, color = '#dce8e1') {
            const c = document.createElement('canvas'); c.width = 512; c.height = 128;
            const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 512, 128);
            ctx.fillStyle = color; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(text, 256, 64, 500);
            const tex = new THREE.CanvasTexture(c);
            if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 8;
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
            plane.rotation.x = -Math.PI / 2; plane.position.set(x, 0, z); plane.userData.partId = 'ssd'; g.add(plane); return plane;
        }
        function addTrace(points, radius = 0.0035) {
            const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
            const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, radius, 5, false), traceMat);
            tube.userData.partId = 'ssd'; g.add(tube); return tube;
        }

        // PCB outline 80 x 22 mm, with M-Key edge notch and a real screw opening.
        const shape = new THREE.Shape();
        shape.moveTo(-0.79, -0.215);
        shape.lineTo(0.79, -0.215);
        shape.lineTo(0.79, 0.215);
        shape.lineTo(-0.79, 0.215);
        shape.lineTo(-0.79, 0.112);
        shape.lineTo(-0.635, 0.112);
        shape.lineTo(-0.635, 0.035);
        shape.lineTo(-0.79, 0.035);
        shape.closePath();
        const screwHole = new THREE.Path();
        screwHole.absarc(0.72, 0, 0.055, 0, Math.PI * 2, true);
        shape.holes.push(screwHole);
        const boardGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false, steps: 1, curveSegments: 24 });
        boardGeo.rotateX(Math.PI / 2);
        boardGeo.translate(0, 0.04, 0);
        const board = new THREE.Mesh(boardGeo, pcbMat);
        board.castShadow = true; board.receiveShadow = true; board.userData.partId = 'ssd'; g.add(board);

        // M-Key gold fingers: individual contact pads separated by the key notch.
        for (let i = 0; i < 20; i++) {
            const z = -0.185 + i * 0.019;
            if (z > 0.035 && z < 0.112) continue;
            const pad = addSSDBox(-0.705, 0.047, z, 0.145, 0.010, 0.012, i % 2 ? goldMat : goldBright);
            pad.castShadow = false;
        }
        addSSDBox(-0.624, 0.044, -0.142, 0.025, 0.006, 0.045, goldMat);
        addSSDBox(-0.624, 0.044, 0.165, 0.025, 0.006, 0.045, goldMat);

        // NVMe controller dekat konektor; package hitam dengan marking kecil.
        addSSDBox(-0.385, 0.078, 0.0, 0.275, 0.072, 0.205, blackMat);
        addSSDBox(-0.385, 0.116, 0.0, 0.235, 0.010, 0.165, chipMat);
        addMark('NVMe CTRL', -0.385, 0.0, 0.205, 0.065, '#c5d2d8').position.y = 0.122;

        // Dua paket NAND flash dan satu cache/DRAM package pada permukaan PCB.
        const chipSpecs = [
            { x: -0.035, z: 0.0, label: 'NAND 1' },
            { x: 0.285, z: 0.0, label: 'NAND 2' },
            { x: 0.555, z: 0.0, label: 'DRAM' }
        ];
        chipSpecs.forEach((spec, index) => {
            addSSDBox(spec.x, 0.071, spec.z, index === 2 ? 0.18 : 0.245, 0.062, index === 2 ? 0.17 : 0.205, blackMat);
            addSSDBox(spec.x, 0.105, spec.z, index === 2 ? 0.15 : 0.21, 0.009, index === 2 ? 0.14 : 0.17, chipMat);
            addMark(spec.label, spec.x, spec.z, index === 2 ? 0.13 : 0.18, 0.055, '#d3dce2').position.y = 0.111;
            // Solder pads di sepanjang sisi package.
            for (let j = 0; j < 5; j++) {
                const px = spec.x - (index === 2 ? 0.065 : 0.095) + j * (index === 2 ? 0.032 : 0.0475);
                addSSDBox(px, 0.045, -0.115, 0.020, 0.008, 0.018, solderMat);
                addSSDBox(px, 0.045, 0.115, 0.020, 0.008, 0.018, solderMat);
            }
        });

        // Resistor, kapasitor, dan komponen SMD kecil yang mengisi area kosong.
        const smdPositions = [
            [-0.59,-0.15],[-0.53,-0.15],[-0.48,0.15],[-0.28,0.15],[-0.17,-0.15],
            [0.12,-0.15],[0.20,0.15],[0.40,0.15],[0.48,-0.15],[0.64,0.14]
        ];
        smdPositions.forEach(([x,z], i) => {
            addSSDBox(x, 0.052, z, 0.052, 0.022, 0.035, passiveMat);
            addSSDBox(x - 0.035, 0.047, z, 0.012, 0.008, 0.037, solderMat);
            addSSDBox(x + 0.035, 0.047, z, 0.012, 0.008, 0.037, solderMat);
        });

        // Jalur tembaga tipis dari controller ke NAND dan cache.
        for (let i = 0; i < 10; i++) {
            const z = -0.125 + i * 0.027;
            addTrace([[-0.23,0.044,z],[-0.12,0.044,z],[-0.08,0.044,z * 0.7]], 0.0027);
            addTrace([[0.12,0.044,z],[0.19,0.044,z],[0.24,0.044,z * 0.7]], 0.0027);
        }
        for (let i = 0; i < 7; i++) {
            const x = 0.30 + i * 0.045;
            addTrace([[x,0.044,-0.14],[x + 0.03,0.044,-0.12],[x + 0.05,0.044,-0.10]], 0.0024);
        }

        // Silkscreen label kecil ditempatkan di area terbuka; tidak menutupi chip.
        addMark('NVMe 1TB • PCIe Gen4 x4 • 2280', 0.205, -0.178, 0.56, 0.055, '#d9e8dd').position.y = 0.043;
        addMark('M-KEY', -0.55, 0.165, 0.20, 0.045, '#d4e2d8').position.y = 0.043;

        // Cincin penguat metal di sekitar lubang sekrup; lubang PCB tetap tembus.
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.061, 0.010, 8, 28), solderMat);
        ring.rotation.x = Math.PI / 2; ring.position.set(0.72, 0.043, 0); ring.userData.partId = 'ssd'; g.add(ring);
        const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.004, 6, 24), goldMat);
        innerRing.rotation.x = Math.PI / 2; innerRing.position.set(0.72, 0.044, 0); innerRing.userData.partId = 'ssd'; g.add(innerRing);

        // Komponen pengaman/ID kecil pada sisi bawah dekat ujung baut.
        addSSDBox(0.64, 0.051, -0.135, 0.075, 0.022, 0.045, blackMat);
        addMark('2280', 0.64, -0.135, 0.055, 0.025, '#c8d2d8').position.y = 0.063;

        g.userData.partId = 'ssd';
        return g;
    }

    function buildVGA3D(fanMeshesOut) {
        // GPU triple-fan kelas performa tinggi: shroud, axial fans, heatsink,
        // heatpipe tembaga, backplate, bracket I/O, dan konektor PCIe.
        const g=new THREE.Group();
        const pcbMat=new THREE.MeshStandardMaterial({color:0x101820,roughness:0.36,metalness:0.32});
        const metal=new THREE.MeshStandardMaterial({color:0x778695,roughness:0.25,metalness:0.9});
        const finMat=new THREE.MeshStandardMaterial({color:0x9aa7b2,roughness:0.24,metalness:0.94});
        const dark=new THREE.MeshStandardMaterial({color:0x151d27,roughness:0.3,metalness:0.55});
        const copper=new THREE.MeshStandardMaterial({color:0xb86b38,roughness:0.2,metalness:0.94});
        const gold=new THREE.MeshStandardMaterial({color:0xd6a63b,roughness:0.18,metalness:0.97});
        const fanBladeMat=new THREE.MeshStandardMaterial({color:0x202a35,roughness:0.28,metalness:0.38,side:THREE.DoubleSide});
        const board=new THREE.Mesh(new THREE.BoxGeometry(3.28,0.085,1.30),pcbMat);
        board.position.y=0.16;board.castShadow=true;board.userData.partId='vga';g.add(board);
        // Dense aluminium heatsink fin stack, visible through fan openings.
        const core=new THREE.Mesh(new THREE.BoxGeometry(3.02,0.28,1.18),finMat);core.position.y=0.37;core.castShadow=true;g.add(core);
        for(let i=0;i<34;i++){
            const z=-0.56+i*0.034;
            const fin=new THREE.Mesh(new THREE.BoxGeometry(2.92,0.31,0.012),metal);
            fin.position.set(0,0.40,z);g.add(fin);
        }
        // Two broad copper heat pipes crossing the card length.
        [-0.40,0.40].forEach(z=>{
            const pipe=new THREE.Mesh(new THREE.CylinderGeometry(0.043,0.043,3.0,16),copper);
            pipe.rotation.z=Math.PI/2;pipe.position.set(0,0.40,z);pipe.castShadow=true;g.add(pipe);
        });
        // Full length metal shroud with three fan wells.
        const shroudMat=new THREE.MeshStandardMaterial({map:T.createNvidiaVGAShroudTexture(),metalness:0.66,roughness:0.29});
        const shroud=new THREE.Mesh(new THREE.BoxGeometry(3.36,0.22,1.42),shroudMat);
        shroud.position.y=0.57;shroud.castShadow=true;shroud.userData.partId='vga';g.add(shroud);
        // Angular frame rails and accent strip.
        const railMat=new THREE.MeshStandardMaterial({color:0x303d4b,metalness:0.82,roughness:0.22});
        [-0.66,0.66].forEach(z=>{
            const rail=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.07,0.055),railMat);rail.position.set(0,0.705,z);g.add(rail);
        });
        const glow=new THREE.Mesh(new THREE.BoxGeometry(1.12,0.025,0.018),new THREE.MeshStandardMaterial({color:0x5b9c37,emissive:0x284d16,emissiveIntensity:0.45}));
        glow.position.set(0,0.69,0.716);g.add(glow);
        // Fan rotor maker: swept curved blades rather than rectangular paddles.
        function createFanRotor(radius,x){
            const rotor=new THREE.Group();rotor.position.set(x,0.72,0);
            const hub=new THREE.Mesh(new THREE.CylinderGeometry(radius*0.25,radius*0.25,0.065,32),dark);rotor.add(hub);
            const hubCap=new THREE.Mesh(new THREE.CylinderGeometry(radius*0.13,radius*0.13,0.072,28),metal);rotor.add(hubCap);
            const hubDot=new THREE.Mesh(new THREE.CylinderGeometry(radius*0.055,radius*0.055,0.076,20),gold);rotor.add(hubDot);
            for(let b=0;b<9;b++){
                const shape=new THREE.Shape();
                shape.moveTo(radius*0.19,-radius*0.08);
                shape.bezierCurveTo(radius*0.38,-radius*0.17,radius*0.73,-radius*0.12,radius*0.96,radius*0.12);
                shape.bezierCurveTo(radius*0.78,radius*0.20,radius*0.47,radius*0.24,radius*0.23,radius*0.15);
                shape.closePath();
                const blade=new THREE.Mesh(new THREE.ShapeGeometry(shape,10),fanBladeMat);
                blade.rotation.x=Math.PI/2;blade.rotation.y=b*Math.PI*2/9;blade.position.y=0.012;rotor.add(blade);
            }
            if(fanMeshesOut)fanMeshesOut.push(rotor);
            g.add(rotor);
            const ring=new THREE.Mesh(new THREE.TorusGeometry(radius*1.01,0.026,10,48),metal);
            ring.rotation.x=Math.PI/2;ring.position.set(x,0.73,0);g.add(ring);
            const well=new THREE.Mesh(new THREE.CylinderGeometry(radius*0.98,radius*0.98,0.028,40),dark);
            well.position.set(x,0.695,0);g.add(well);
            // Four small fan mounting screws around each fan well.
            [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([sx,sz])=>{
                const screw=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.025,12),gold);
                screw.position.set(x+sx*radius*0.88,0.73,sz*radius*0.88);g.add(screw);
            });
        }
        [-1.06,0,1.06].forEach(x=>createFanRotor(0.43,x));
        // Rear I/O bracket with display output ports.
        const bracket=new THREE.Mesh(new THREE.BoxGeometry(0.085,0.92,1.40),metal);
        bracket.position.set(-1.68,0.34,0);bracket.castShadow=true;g.add(bracket);
        const portMat=new THREE.MeshStandardMaterial({color:0x080d14,roughness:0.32,metalness:0.3});
        for(let i=0;i<3;i++){
            const port=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.12,0.24),portMat);
            port.position.set(-1.728,0.55,0.43-i*0.42);g.add(port);
        }
        // PCIe x16 gold edge connector and reinforcement tab.
        const edge=new THREE.Mesh(new THREE.BoxGeometry(2.05,0.035,0.085),gold);edge.position.set(-0.18,0.085,-0.69);g.add(edge);
        for(let i=0;i<35;i++){
            const contact=new THREE.Mesh(new THREE.BoxGeometry(0.042,0.012,0.07),new THREE.MeshStandardMaterial({color:0xf0cd74,metalness:0.95,roughness:0.16}));
            contact.position.set(-1.17+i*0.058,0.105,-0.69);g.add(contact);
        }
        // 12V-2x6 / 16-pin auxiliary power socket on top edge.
        const power=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.14,0.22),dark);power.position.set(0.48,0.69,0.53);g.add(power);
        for(let i=0;i<12;i++){
            const pin=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.025,0.025),gold);
            pin.position.set(0.34+(i%4)*0.09,0.715,0.47+Math.floor(i/4)*0.075);g.add(pin);
        }
        // Backplate details and PCB mounting screws.
        const backplate=new THREE.Mesh(new THREE.BoxGeometry(3.22,0.045,1.25),dark);backplate.position.y=0.075;g.add(backplate);
        for(let i=0;i<8;i++){
            const slot=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.008,0.035),metal);slot.position.set(-1.25+i*0.36,0.05,0.50);g.add(slot);
        }
        g.userData.partId='vga';return g;
    }


    function buildPSU3D() {
        // ATX 850W modular PSU, sasis metal, grille kipas 120 mm,
        // panel label, AC inlet, rocker switch, dan port modular.
        const g=new THREE.Group();
        const shellMat=new THREE.MeshStandardMaterial({color:0x202934,roughness:0.31,metalness:0.78});
        const edgeMat=new THREE.MeshStandardMaterial({color:0x485563,roughness:0.24,metalness:0.88});
        const black=new THREE.MeshStandardMaterial({color:0x080d13,roughness:0.42,metalness:0.28});
        const grillMat=new THREE.MeshStandardMaterial({color:0x7f8b96,roughness:0.26,metalness:0.9});
        const fanBlade=new THREE.MeshStandardMaterial({color:0x17212b,roughness:0.29,metalness:0.4,side:THREE.DoubleSide});
        const gold=new THREE.MeshStandardMaterial({color:0xc99b3c,roughness:0.18,metalness:0.95});
        const body=new THREE.Mesh(new THREE.BoxGeometry(1.96,1.02,1.96),shellMat);
        body.position.y=0.51;body.castShadow=true;body.receiveShadow=true;body.userData.partId='psu';g.add(body);
        // Folded metal edge rails and front/rear seams.
        [0.94,-0.94].forEach(z=>{
            const rail=new THREE.Mesh(new THREE.BoxGeometry(1.82,0.045,0.035),edgeMat);rail.position.set(0,0.95,z);g.add(rail);
        });
        // 120 mm top fan, round frame, 9 curved blades and metal grille.
        const fanWell=new THREE.Mesh(new THREE.CylinderGeometry(0.69,0.69,0.025,48),black);fanWell.position.set(0,1.035,0);g.add(fanWell);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(0.69,0.035,12,56),grillMat);ring.rotation.x=Math.PI/2;ring.position.set(0,1.06,0);g.add(ring);
        const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.06,28),edgeMat);hub.position.set(0,1.065,0);g.add(hub);
        for(let b=0;b<9;b++){
            const shape=new THREE.Shape();shape.moveTo(0.14,-0.07);shape.bezierCurveTo(0.31,-0.17,0.55,-0.10,0.64,0.08);shape.bezierCurveTo(0.46,0.17,0.28,0.18,0.16,0.12);shape.closePath();
            const blade=new THREE.Mesh(new THREE.ShapeGeometry(shape,8),fanBlade);blade.rotation.x=Math.PI/2;blade.rotation.y=b*Math.PI*2/9;blade.position.y=1.079;g.add(blade);
        }
        // Grille rings and crossing bars above the fan.
        [0.27,0.43,0.57].forEach(r=>{const rMesh=new THREE.Mesh(new THREE.TorusGeometry(r,0.012,6,48),grillMat);rMesh.rotation.x=Math.PI/2;rMesh.position.y=1.105;g.add(rMesh);});
        for(let a=0;a<8;a++){
            const spoke=new THREE.Mesh(new THREE.BoxGeometry(1.25,0.018,0.018),grillMat);spoke.position.y=1.105;spoke.rotation.y=a*Math.PI/8;g.add(spoke);
        }
        // PSU rating label on side panel, readable in isolated component view.
        const label=new THREE.Mesh(new THREE.PlaneGeometry(1.55,0.64),new THREE.MeshStandardMaterial({map:T.createPSULabelTexture(),roughness:0.34,metalness:0.12,side:THREE.DoubleSide}));
        label.position.set(0,0.52,0.985);label.userData.partId='psu';g.add(label);
        // Rear AC inlet, earth/safety detail, and I/O rocker switch.
        const acPanel=new THREE.Mesh(new THREE.BoxGeometry(0.045,0.65,1.38),edgeMat);acPanel.position.set(-0.985,0.52,0);g.add(acPanel);
        const inlet=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.37,0.50),black);inlet.position.set(-1.02,0.54,0.28);g.add(inlet);
        const inletInner=new THREE.Mesh(new THREE.BoxGeometry(0.018,0.24,0.34),new THREE.MeshStandardMaterial({color:0x02060a,roughness:0.5}));inletInner.position.set(-1.07,0.54,0.28);g.add(inletInner);
        const rocker=new THREE.Mesh(new THREE.BoxGeometry(0.075,0.20,0.15),new THREE.MeshStandardMaterial({color:0x9d2430,roughness:0.3}));rocker.position.set(-1.035,0.52,-0.36);g.add(rocker);
        // Rear ventilation grille on the opposite half.
        for(let i=0;i<7;i++){
            const vent=new THREE.Mesh(new THREE.BoxGeometry(0.018,0.035,0.46),grillMat);vent.position.set(-1.015,0.22+i*0.09,-0.68);g.add(vent);
        }
        // Fully modular cable sockets on the front face (toward -Z).
        const modularPanel=new THREE.Mesh(new THREE.BoxGeometry(1.58,0.70,0.045),black);modularPanel.position.set(0,0.51,-0.995);g.add(modularPanel);
        const portRows=[[-0.47,0.67],[-0.47,0.32],[0.02,0.67],[0.02,0.32],[0.48,0.67],[0.48,0.32]];
        portRows.forEach(([x,y],i)=>{
            const port=new THREE.Mesh(new THREE.BoxGeometry(0.29,0.19,0.035),edgeMat);port.position.set(x,y,-1.025);g.add(port);
            const inner=new THREE.Mesh(new THREE.BoxGeometry(0.21,0.11,0.018),black);inner.position.set(x,y,-1.047);g.add(inner);
            for(let j=0;j<3;j++){
                const pin=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.035,0.012),gold);pin.position.set(x-0.055+j*0.055,y,-1.058);g.add(pin);
            }
        });
        // Small 80 PLUS badge and stamped screws.
        const badge=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.19,0.018),new THREE.MeshStandardMaterial({color:0x9a742b,metalness:0.78,roughness:0.24}));badge.position.set(-0.58,0.16,0.99);g.add(badge);
        [[-0.84,0.88],[0.84,0.88],[-0.84,-0.88],[0.84,-0.88]].forEach(([x,z])=>{
            const screw=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.035,0.018,12),grillMat);screw.position.set(x,1.035,z);g.add(screw);
        });
        g.userData.partId='psu';return g;
    }


    function buildCable3D() {
        // Kabel ATX 24-pin: ujung PSU berada di soket modular PSU dan ujung utama
        // diarahkan tepat ke header ATX 24-pin pada tepi motherboard.
        // Group origin saat terpasang adalah titik tengah rute kabel.
        const g = new THREE.Group();
        const wireColors = [
            0xf2c230, 0xe34b42, 0xf28a32, 0x161b22, 0x161b22, 0x2f75b9,
            0x4d9a61, 0xeeeeea, 0xf2c230, 0xe34b42, 0xf28a32, 0x161b22,
            0x161b22, 0x2f75b9, 0x4d9a61, 0xeeeeea, 0xf2c230, 0xe34b42,
            0xf28a32, 0x161b22, 0x161b22, 0x2f75b9, 0x4d9a61, 0xeeeeea
        ];
        const start = new THREE.Vector3(-3.08, 0.17, 0.70);
        const routePoints = [
            start.clone().add(new THREE.Vector3(0, 0, -0.12)),
            new THREE.Vector3(-2.92, 0.42, 0.24),
            new THREE.Vector3(-2.30, 0.48, -0.34),
            new THREE.Vector3(-1.20, 0.42, -0.82),
            new THREE.Vector3(0.05, 0.27, -1.02),
            new THREE.Vector3(1.35, 0.08, -0.94),
            new THREE.Vector3(2.45, -0.08, -0.79),
            new THREE.Vector3(3.28, -0.16, -0.695)
        ];
        // Dua puluh empat konduktor halus mengikuti satu jalur harness yang sama.
        for (let i = 0; i < wireColors.length; i++) {
            const row = Math.floor(i / 6) - 1.5;
            const col = (i % 6) - 2.5;
            const offsetY = row * 0.014;
            const offsetZ = col * 0.014;
            const pts = routePoints.map((p, index) => new THREE.Vector3(
                p.x,
                p.y + offsetY * (index / (routePoints.length - 1)),
                p.z + offsetZ * (index / (routePoints.length - 1))
            ));
            const wire = new THREE.Mesh(
                new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 42, 0.012, 6, false),
                new THREE.MeshStandardMaterial({ color: wireColors[i], roughness: 0.43, metalness: 0.08 })
            );
            wire.castShadow = true; wire.userData.partId = 'cable'; g.add(wire);
        }

        const black = new THREE.MeshStandardMaterial({ color: 0x0b1118, roughness: 0.34, metalness: 0.22 });
        const latchMat = new THREE.MeshStandardMaterial({ color: 0x202a34, roughness: 0.35, metalness: 0.48 });
        const gold = new THREE.MeshStandardMaterial({ color: 0xd3ad55, roughness: 0.2, metalness: 0.92 });

        // Konektor modular PSU 12-pin di titik awal kabel, tepat pada port PSU.
        const psuPlug = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.31, 0.22), black);
        psuPlug.position.set(-3.08, 0.17, 0.79); psuPlug.castShadow = true; psuPlug.userData.partId = 'cable'; g.add(psuPlug);
        const psuFace = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.25, 0.018), latchMat);
        psuFace.position.set(-3.08, 0.17, 0.675); psuFace.userData.partId = 'cable'; g.add(psuFace);
        for (let i = 0; i < 12; i++) {
            const x = -3.08 + ((i % 3) - 1) * 0.105;
            const y = 0.17 + (Math.floor(i / 3) - 1.5) * 0.052;
            const contact = new THREE.Mesh(new THREE.BoxGeometry(0.050, 0.032, 0.009), gold);
            contact.position.set(x, y, 0.663); contact.userData.partId = 'cable'; g.add(contact);
        }
        const psuStrainRelief = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.26, 0.15), black);
        psuStrainRelief.position.set(-3.08, 0.17, 0.54); g.add(psuStrainRelief);

        // Kepala 24-pin ATX: posisi case-group (3.48, 0.67, -0.60).
        // Muka konektor menghadap -X dan masuk ke soket board pada x=3.23.
        const plugCenter = new THREE.Vector3(3.08, -0.17, -0.695);
        const plug = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.38, 1.30), black);
        plug.position.copy(plugCenter); plug.castShadow = true; plug.userData.partId = 'cable'; g.add(plug);
        const face = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.31, 1.19), latchMat);
        face.position.set(plugCenter.x - 0.258, plugCenter.y, plugCenter.z); face.userData.partId = 'cable'; g.add(face);
        // Dua baris, masing-masing 12 lubang kontak yang searah dengan soket motherboard.
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 12; col++) {
                const hole = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.058, 0.060), black);
                hole.position.set(plugCenter.x - 0.270, plugCenter.y + (row ? 0.095 : -0.095), plugCenter.z - 0.5225 + col * 0.095);
                hole.userData.partId = 'cable'; g.add(hole);
            }
        }
        // Pengunci kait di punggung konektor.
        const latch = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.065, 0.24), latchMat);
        latch.position.set(plugCenter.x + 0.12, plugCenter.y + 0.215, plugCenter.z); latch.userData.partId = 'cable'; g.add(latch);
        const strain = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.30, 1.12), black);
        strain.position.set(plugCenter.x + 0.30, plugCenter.y, plugCenter.z); g.add(strain);

        g.userData.partId = 'cable';
        return g;
    }

    return {
        buildMotherboardAssembly,
        buildCPU3D,
        buildCPUCooler3D,
        buildRAM3D,
        buildSSD3D,
        buildVGA3D,
        buildPSU3D,
        buildCable3D
    };
})();
