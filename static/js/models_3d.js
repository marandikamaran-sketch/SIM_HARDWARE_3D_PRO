/**
 * ============================================================================
 * REALISTIC 3D HARDWARE BUILDER (static/js/models_3d.js)
 * Membangun model 3D komponen komputer menyerupai bentuk & warna aslinya.
 * ============================================================================
 */

window.HardwareModels3D = (function () {
    const T = window.HardwareTextures;

    function buildMotherboardAssembly() {
        const moboGroup = new THREE.Group();

        const pcbMat = new THREE.MeshStandardMaterial({
            map: T.createMotherboardPCBTexture(),
            roughness: 0.42,
            metalness: 0.16
        });
        const pcb = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 4.9), pcbMat);
        pcb.castShadow = true;
        pcb.receiveShadow = true;
        moboGroup.add(pcb);

        const alumMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.88, roughness: 0.22 });
        const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.82, roughness: 0.28 });

        const vrmTop = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.36, 0.46), alumMat);
        vrmTop.position.set(-0.2, 0.24, -1.78);
        vrmTop.castShadow = true;
        moboGroup.add(vrmTop);

        const vrmLeft = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 1.65), alumMat);
        vrmLeft.position.set(-1.58, 0.24, -0.75);
        vrmLeft.castShadow = true;
        moboGroup.add(vrmLeft);

        const pchHeatsink = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.20, 1.18), darkMetalMat);
        pchHeatsink.position.set(1.45, 0.16, 1.38);
        pchHeatsink.castShadow = true;
        moboGroup.add(pchHeatsink);

        const capSilverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.18 });
        const capTopBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
        const chokeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.3 });

        for (let i = 0; i < 7; i++) {
            const cx = -1.0 + i * 0.26;
            const choke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.18), chokeMat);
            choke.position.set(cx, 0.13, -1.42);
            moboGroup.add(choke);

            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 16), capSilverMat);
            cap.position.set(cx + 0.08, 0.15, -1.22);
            moboGroup.add(cap);

            const capStripe = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.04, 16), capTopBlueMat);
            capStripe.position.set(cx + 0.08, 0.22, -1.22);
            moboGroup.add(capStripe);
        }

        const cmosHolder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.07, 24),
            new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 })
        );
        cmosHolder.position.set(-0.35, 0.09, 1.62);
        moboGroup.add(cmosHolder);

        const cmosCoin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.20, 0.20, 0.09, 24),
            capSilverMat
        );
        cmosCoin.position.set(-0.35, 0.10, 1.62);
        moboGroup.add(cmosCoin);

        const ioBlock = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.68, 1.95),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.88, roughness: 0.22 })
        );
        ioBlock.position.set(-2.5, 0.39, -1.35);
        ioBlock.castShadow = true;
        moboGroup.add(ioBlock);

        const jackColors = [0xec4899, 0x22c55e, 0x3b82f6];
        jackColors.forEach((col, idx) => {
            const jack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12),
                new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 })
            );
            jack.rotation.z = Math.PI / 2;
            jack.position.set(-2.78, 0.26, -0.65 - idx * 0.18);
            moboGroup.add(jack);
        });

        for (let s = 0; s < 2; s++) {
            const sata = new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.18, 0.42),
                new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
            );
            sata.position.set(2.55, 0.15, 1.35 + s * 0.55);
            moboGroup.add(sata);
        }

        return moboGroup;
    }

    function buildCPU3D() {
        const g = new THREE.Group();

        const greenPCB = new THREE.Mesh(
            new THREE.BoxGeometry(0.98, 0.055, 0.98),
            new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.38 })
        );
        g.add(greenPCB);

        const goldContact = new THREE.Mesh(
            new THREE.BoxGeometry(0.92, 0.02, 0.92),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.18 })
        );
        goldContact.position.y = -0.025;
        g.add(goldContact);

        const ihsMat = new THREE.MeshStandardMaterial({
            map: T.createCPUIHSTexture(),
            metalness: 0.86,
            roughness: 0.20
        });
        const ihsMain = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.085, 0.82), ihsMat);
        ihsMain.position.y = 0.065;
        ihsMain.castShadow = true;
        g.add(ihsMain);

        const earMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.22 });
        const earLeft = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.05, 0.28), earMat);
        earLeft.position.y = 0.05;
        g.add(earLeft);

        return g;
    }

    function buildRAM3D() {
        const g = new THREE.Group();
        const stickerTex = T.createRAMStickerTexture();

        [-0.18, 0.18].forEach(offsetX => {
            const stick = new THREE.Group();
            stick.position.x = offsetX;

            const greenEdge = new THREE.Mesh(
                new THREE.BoxGeometry(0.055, 0.18, 2.08),
                new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.4 })
            );
            greenEdge.position.y = 0.11;
            stick.add(greenEdge);

            const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.94, roughness: 0.18 });
            const pinsFront = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.05), goldMat);
            pinsFront.position.set(0, 0.04, -0.50);
            stick.add(pinsFront);

            const pinsBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.90), goldMat);
            pinsBack.position.set(0, 0.04, 0.56);
            stick.add(pinsBack);

            const spreaderMat = new THREE.MeshStandardMaterial({
                map: stickerTex,
                color: 0xffffff,
                metalness: 0.65,
                roughness: 0.28
            });
            const spreader = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 2.10), spreaderMat);
            spreader.position.y = 0.36;
            spreader.castShadow = true;
            stick.add(spreader);

            const finMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.78, roughness: 0.25 });
            const topFin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 2.06), finMat);
            topFin.position.y = 0.60;
            stick.add(topFin);

            g.add(stick);
        });
        return g;
    }

    function buildSSD3D() {
        const g = new THREE.Group();

        const board = new THREE.Mesh(
            new THREE.BoxGeometry(1.34, 0.055, 0.44),
            new THREE.MeshStandardMaterial({
                map: T.createSSDTexture(),
                roughness: 0.32,
                metalness: 0.22
            })
        );
        board.castShadow = true;
        g.add(board);

        const goldEdge = new THREE.Mesh(
            new THREE.BoxGeometry(0.11, 0.06, 0.42),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.94, roughness: 0.18 })
        );
        goldEdge.position.x = -0.68;
        g.add(goldEdge);

        const screwHead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
        );
        screwHead.position.set(0.65, 0.02, 0);
        g.add(screwHead);

        return g;
    }

    function buildVGA3D(fanMeshesOut) {
        const g = new THREE.Group();

        const pcb = new THREE.Mesh(
            new THREE.BoxGeometry(3.15, 0.08, 1.32),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
        );
        pcb.position.y = 0.16;
        g.add(pcb);

        const heatsinkCore = new THREE.Mesh(
            new THREE.BoxGeometry(2.95, 0.24, 1.18),
            new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.25 })
        );
        heatsinkCore.position.y = 0.32;
        g.add(heatsinkCore);

        const copperPipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 2.85, 16),
            new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.92, roughness: 0.2 })
        );
        copperPipe.rotation.z = Math.PI / 2;
        copperPipe.position.set(0, 0.34, 0.62);
        g.add(copperPipe);

        const shroud = new THREE.Mesh(
            new THREE.BoxGeometry(3.18, 0.24, 1.34),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.78, roughness: 0.28 })
        );
        shroud.position.y = 0.54;
        shroud.castShadow = true;
        g.add(shroud);

        const rearBracket = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.85, 1.36),
            new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
        );
        rearBracket.position.set(-1.60, 0.32, 0);
        g.add(rearBracket);

        const pciePins = new THREE.Mesh(
            new THREE.BoxGeometry(2.15, 0.14, 0.07),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.94, roughness: 0.18 })
        );
        pciePins.position.set(-0.22, 0.06, -0.35);
        g.add(pciePins);

        [-0.76, 0.76].forEach(fx => {
            const fanWell = new THREE.Mesh(
                new THREE.CylinderGeometry(0.50, 0.50, 0.06, 28),
                new THREE.MeshStandardMaterial({ color: 0x060912, roughness: 0.5 })
            );
            fanWell.position.set(fx, 0.67, 0);
            g.add(fanWell);

            const fanRotor = new THREE.Group();
            fanRotor.position.set(fx, 0.69, 0);

            const hub = new THREE.Mesh(
                new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20),
                new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 })
            );
            fanRotor.add(hub);

            for (let b = 0; b < 9; b++) {
                const blade = new THREE.Mesh(
                    new THREE.BoxGeometry(0.44, 0.02, 0.085),
                    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.3 })
                );
                blade.rotation.y = (b * Math.PI * 2) / 9;
                fanRotor.add(blade);
            }
            if (fanMeshesOut) fanMeshesOut.push(fanRotor);
            g.add(fanRotor);
        });

        return g;
    }

    function buildPSU3D() {
        const g = new THREE.Group();

        const chassis = new THREE.Mesh(
            new THREE.BoxGeometry(1.96, 1.02, 1.96),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.78, roughness: 0.34 })
        );
        chassis.position.y = 0.51;
        chassis.castShadow = true;
        g.add(chassis);

        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(1.72, 0.86),
            new THREE.MeshStandardMaterial({ map: T.createPSULabelTexture(), roughness: 0.35 })
        );
        label.rotation.x = -Math.PI / 2;
        label.position.set(0, 1.025, 0);
        g.add(label);

        const acSocket = new THREE.Mesh(
            new THREE.BoxGeometry(0.10, 0.36, 0.52),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
        );
        acSocket.position.set(-0.99, 0.52, 0.45);
        g.add(acSocket);

        const switchRed = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.22, 0.16),
            new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })
        );
        switchRed.position.set(-0.99, 0.52, -0.35);
        g.add(switchRed);

        return g;
    }

    function buildCable3D() {
        const g = new THREE.Group();

        const atxColors = [0xfacc15, 0xdc2626, 0xf97316, 0x111827, 0xfacc15];
        for (let i = 0; i < atxColors.length; i++) {
            const offset = (i - 2) * 0.065;
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-4.15, 0.58, 2.05 + offset),
                new THREE.Vector3(-3.15, 1.42, 1.15 + offset),
                new THREE.Vector3(-0.35, 1.58, 0.15 + offset),
                new THREE.Vector3(1.85, 0.55, -0.58 + offset)
            ]);
            const tube = new THREE.Mesh(
                new THREE.TubeGeometry(curve, 36, 0.032, 8, false),
                new THREE.MeshStandardMaterial({ color: atxColors[i], roughness: 0.42, metalness: 0.15 })
            );
            tube.castShadow = true;
            g.add(tube);
        }

        const connector24 = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.28, 1.24),
            new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.38 })
        );
        connector24.position.set(1.85, 0.45, -0.58);
        g.add(connector24);

        return g;
    }

    return {
        buildMotherboardAssembly,
        buildCPU3D,
        buildRAM3D,
        buildSSD3D,
        buildVGA3D,
        buildPSU3D,
        buildCable3D
    };
})();
