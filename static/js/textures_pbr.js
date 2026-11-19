/**
 * ============================================================================
 * PBR TEXTURE GENERATOR (static/js/textures_pbr.js)
 * Menghasilkan tekstur permukaan perangkat keras resolusi tinggi agar
 * tampilan Motherboard, CPU, RAM, SSD, VGA, PSU, dan Monitor menyerupai asli.
 * ============================================================================
 */

window.HardwareTextures = (function () {
    function createMotherboardPCBTexture() {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 1024;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0d231a';
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1024; i += 6) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(218, 178, 62, 0.32)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 95; i++) {
            const x = 55 + (i * 11) % 910;
            const y = 70 + ((i * 41) % 880);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 75, y);
            ctx.lineTo(x + 115, y + 38);
            ctx.lineTo(x + 220, y + 38);
            ctx.stroke();

            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(x, y, 2.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(45, 720);
        ctx.lineTo(190, 720);
        ctx.lineTo(220, 760);
        ctx.lineTo(220, 975);
        ctx.stroke();

        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('SIM-HARDWARE Z790-PRO ATX', 65, 968);

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#fde047';
        ctx.fillText('SOCKET LGA1700 (CPU)', 375, 235);
        ctx.fillText('DDR4_DIMM_A1 / B1 (RAM)', 630, 128);
        ctx.fillText('M.2_NVME_PCIe4 (SSD)', 365, 515);
        ctx.fillText('PCIEX16_STEEL (VGA)', 215, 642);
        ctx.fillText('ATX_PWR_24PIN', 835, 340);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('HD_AUDIO', 80, 910);
        ctx.fillText('SATA6G_1..4', 790, 860);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 8;
        return tex;
    }

    function createCPUSocketPinTexture() {
        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(0, 0, 256, 256);

        ctx.fillStyle = '#facc15';
        for (let y = 12; y < 244; y += 6) {
            for (let x = 12; x < 244; x += 6) {
                if (x > 96 && x < 160 && y > 96 && y < 160) continue;
                ctx.fillRect(x, y, 3, 3);
            }
        }
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(98, 98, 60, 60);
        return new THREE.CanvasTexture(c);
    }

    function createCPUIHSTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');

        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#cbd5e1');
        grad.addColorStop(0.45, '#f8fafc');
        grad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 10;
        ctx.strokeRect(18, 18, 476, 476);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('INTEL® CORE™ i7', 256, 175);
        ctx.font = 'bold 26px monospace';
        ctx.fillText('i7-13700K • 5.40GHz', 256, 225);
        ctx.font = '20px monospace';
        ctx.fillStyle = '#334155';
        ctx.fillText('SRMB8 • LGA1700', 256, 270);
        ctx.fillText('SMPIT SAHABAT ALAM', 256, 315);

        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(36, 476);
        ctx.lineTo(86, 476);
        ctx.lineTo(36, 426);
        ctx.closePath();
        ctx.fill();

        return new THREE.CanvasTexture(c);
    }

    function createRAMStickerTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 128;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, 512, 128);

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, 0, 512, 22);
        ctx.fillRect(0, 106, 512, 22);

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(140, 30, 240, 68);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DDR4 16GB (2x8GB)', 152, 56);
        ctx.font = '14px monospace';
        ctx.fillText('3200MHz CL16 • 1.35V', 152, 82);

        return new THREE.CanvasTexture(c);
    }

    function createSSDTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(48, 36, 92, 184);
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('NVMe CTRL', 54, 132);

        const grad = ctx.createLinearGradient(155, 30, 465, 220);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e3a8a');
        ctx.fillStyle = grad;
        ctx.fillRect(156, 30, 312, 196);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(156, 30, 312, 196);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('SSD NVMe M.2', 176, 86);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('1TB • PCIe Gen4 x4', 176, 132);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '17px monospace';
        ctx.fillText('Read 7000MB/s • 2280', 176, 176);

        return new THREE.CanvasTexture(c);
    }

    function createPSULabelTexture() {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 256;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, 492, 236);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText('ATX 650W', 30, 62);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('80 PLUS GOLD CERTIFIED', 210, 60);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 86, 452, 130);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px monospace';
        ctx.fillText('AC INPUT : 100-240V ~ 50/60Hz 8A', 44, 116);
        ctx.fillStyle = '#fde047';
        ctx.fillText('DC OUTPUT: +12V (54A) | +5V (20A) | +3.3V (20A)', 44, 152);
        ctx.fillStyle = '#4ade80';
        ctx.fillText('STATUS   : POWER SUPPLY EKSTERNAL MOTHERBOARD', 44, 188);

        return new THREE.CanvasTexture(c);
    }

    function renderMonitorCanvas(ctx, w, h, mode, errorMsg = '') {
        if (mode === 'OFF') {
            ctx.fillStyle = '#05080f';
            ctx.fillRect(0, 0, w, h);

            const sheen = ctx.createLinearGradient(0, 0, w, h);
            sheen.addColorStop(0, 'rgba(255,255,255,0.06)');
            sheen.addColorStop(0.5, 'rgba(255,255,255,0.01)');
            sheen.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = sheen;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#475569';
            ctx.font = 'bold 22px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('NO SIGNAL • TEKAN TOMBOL POWER DI CASING', w / 2, h / 2);
        } else if (mode === 'BIOS') {
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 28px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('AMERICAN MEGATRENDS / SIM-HARDWARE UEFI BIOS', 48, 76);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '21px monospace';
            ctx.fillText('CPU : Intel(R) Core(TM) i7-13700K @ 5.40GHz [OK]', 48, 150);
            ctx.fillText('MEM : 16384 MB DDR4-3200 Dual-Channel      [OK]', 48, 198);
            ctx.fillText('SSD : 1000 GB NVMe M.2 PCIe Gen4 x4        [OK]', 48, 246);
            ctx.fillText('VGA : NVIDIA GeForce RTX 8GB GDDR6         [OK]', 48, 294);
            ctx.fillText('PSU : 650W ATX 24-Pin + 8-Pin PCIe Power   [OK]', 48, 342);

            ctx.fillStyle = '#4ade80';
            ctx.fillText('POST Complete. Loading Windows 11 Pro...', 48, 430);
        } else if (mode === 'WINDOWS') {
            const grad = ctx.createRadialGradient(w * 0.54, h * 0.45, 35, w * 0.5, h * 0.5, w * 0.78);
            grad.addColorStop(0, '#38bdf8');
            grad.addColorStop(0.45, '#2563eb');
            grad.addColorStop(0.85, '#1e1b4b');
            grad.addColorStop(1, '#090d16');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = 'rgba(147, 197, 253, 0.25)';
            ctx.beginPath();
            ctx.ellipse(w * 0.54, h * 0.46, 240, 125, -0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
            ctx.beginPath();
            ctx.ellipse(w * 0.48, h * 0.50, 195, 105, 0.45, 0, Math.PI * 2);
            ctx.fill();

            const icons = [
                { y: 45, label: 'This PC', color: '#38bdf8' },
                { y: 150, label: 'Device Mgr', color: '#4ade80' },
                { y: 255, label: 'Sertifikat', color: '#fbbf24' }
            ];
            icons.forEach(ic => {
                ctx.fillStyle = ic.color;
                ctx.fillRect(40, ic.y, 46, 38);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(ic.label, 63, ic.y + 56);
            });

            ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
            ctx.fillRect(220, 95, 610, 365);
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
            ctx.lineWidth = 2;
            ctx.strokeRect(220, 95, 610, 365);

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(220, 95, 610, 42);
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Windows 11 Pro — Sistem Komputer Aktif!', 240, 122);

            ctx.fillStyle = '#4ade80';
            ctx.font = 'bold 25px sans-serif';
            ctx.fillText('✓ PERAKITAN PC 3D BERHASIL 100%', 248, 184);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '18px sans-serif';
            ctx.fillText('• CPU  : Intel Core i7-13700K (LGA1700)', 248, 230);
            ctx.fillText('• RAM  : 16GB DDR4-3200 Dual Channel', 248, 265);
            ctx.fillText('• SSD  : NVMe M.2 1TB (Windows OS Boot)', 248, 300);
            ctx.fillText('• VGA  : NVIDIA GeForce RTX PCIe x16', 248, 335);
            ctx.fillText('• PSU  : 650W Gold + Kabel ATX 24-Pin OK', 248, 370);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('Klik layar monitor ini untuk membuka Windows interaktif!', 248, 422);

            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
            ctx.fillRect(0, h - 48, w, 48);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(w / 2 - 70, h - 36, 24, 24);
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(w / 2 - 34, h - 36, 24, 24);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(w / 2 + 2, h - 36, 24, 24);
            ctx.fillStyle = '#34d399';
            ctx.fillRect(w / 2 + 38, h - 36, 24, 24);
        } else if (mode === 'ERROR') {
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 72px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(':(', 60, 125);

            ctx.font = 'bold 26px sans-serif';
            ctx.fillText('HARDWARE BOOT ERROR — PERAKITAN BELUM LENGKAP / SALAH!', 60, 192);

            ctx.font = '19px monospace';
            ctx.fillStyle = '#fecaca';
            const words = errorMsg.split(' ');
            let line = '';
            let y = 252;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > 890 && n > 0) {
                    ctx.fillText(line, 60, y);
                    line = words[n] + ' ';
                    y += 30;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 60, y);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 17px monospace';
            ctx.fillText('TINDAKAN: Lengkapi & perbaiki posisi komponen, lalu tekan tombol Power lagi.', 60, 520);
        }
    }

    return {
        createMotherboardPCBTexture,
        createCPUSocketPinTexture,
        createCPUIHSTexture,
        createRAMStickerTexture,
        createSSDTexture,
        createPSULabelTexture,
        renderMonitorCanvas
    };
})();
