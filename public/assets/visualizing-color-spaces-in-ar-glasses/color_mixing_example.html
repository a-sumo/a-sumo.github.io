<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paint Gamut Projection</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'DM Sans', sans-serif; 
            background: #0a0a0b; 
            color: #e8e8e8; 
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .noise {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            opacity: 0.03;
            pointer-events: none;
            z-index: 1000;
        }
        
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            padding: 40px 30px;
            position: relative;
        }
        
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 1px solid #1f1f22;
        }
        
        h1 { 
            font-family: 'Space Mono', monospace;
            font-size: 28px; 
            font-weight: 700;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 13px;
            color: #666;
            font-family: 'Space Mono', monospace;
        }
        
        .status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Space Mono', monospace;
            font-size: 12px;
            color: #48dbfb;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #48dbfb;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.8); }
        }
        
        .main-grid {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 30px;
        }
        
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .panel {
            background: linear-gradient(145deg, #111113, #0d0d0e);
            border: 1px solid #1f1f22;
            border-radius: 12px;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }
        
        .panel::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,107,107,0.3), transparent);
        }
        
        .panel-title {
            font-family: 'Space Mono', monospace;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #555;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .panel-title::before {
            content: '●';
            color: #ff6b6b;
            font-size: 6px;
        }
        
        .pigment {
            display: grid;
            grid-template-columns: 24px 1fr 36px;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #1a1a1c;
        }
        
        .pigment:last-child { border-bottom: none; }
        
        .swatch {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            border: 2px solid #2a2a2e;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .pig-name {
            font-size: 11px;
            color: #888;
            font-family: 'Space Mono', monospace;
        }
        
        .pig-val {
            font-family: 'Space Mono', monospace;
            font-size: 11px;
            color: #48dbfb;
            text-align: right;
        }
        
        input[type="range"] {
            width: 100%;
            height: 4px;
            background: #1a1a1c;
            border-radius: 2px;
            outline: none;
            -webkit-appearance: none;
            margin-top: 6px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(255,107,107,0.4);
            transition: transform 0.2s;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }
        
        .mix-result {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #1f1f22;
        }
        
        .mix-box {
            width: 100%;
            height: 50px;
            border-radius: 8px;
            border: 2px solid #2a2a2e;
            margin-bottom: 10px;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .mix-info {
            font-family: 'Space Mono', monospace;
            font-size: 10px;
            color: #555;
            text-align: center;
        }
        
        .stats-panel {
            font-family: 'Space Mono', monospace;
            font-size: 11px;
            line-height: 1.8;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #1a1a1c;
        }
        
        .stat-label { color: #555; }
        .stat-value { color: #feca57; }
        
        .main-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .result-container {
            background: linear-gradient(145deg, #111113, #0d0d0e);
            border: 1px solid #1f1f22;
            border-radius: 12px;
            padding: 25px;
            position: relative;
        }
        
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .result-title {
            font-family: 'Space Mono', monospace;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #555;
        }
        
        .canvas-wrapper {
            position: relative;
            display: flex;
            justify-content: center;
            background: #080808;
            border-radius: 8px;
            padding: 15px;
            border: 1px solid #1a1a1c;
        }
        
        #resultCanvas {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        
        .divider-label {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            background: #0a0a0b;
            padding: 5px 15px;
            font-family: 'Space Mono', monospace;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #666;
            border: 1px solid #1f1f22;
            border-radius: 20px;
            z-index: 10;
        }
        
        .divider-original { top: 15px; }
        .divider-projected { bottom: calc(50% + 10px); }
        
        .gamut-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .gamut-canvas-wrap {
            background: linear-gradient(145deg, #111113, #0d0d0e);
            border: 1px solid #1f1f22;
            border-radius: 12px;
            padding: 15px;
        }
        
        .gamut-canvas-wrap canvas {
            width: 100%;
            height: auto;
            border-radius: 6px;
        }
        
        .palette-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 4px;
            margin-top: 10px;
        }
        
        .pal-cell {
            aspect-ratio: 1;
            border-radius: 4px;
            border: 1px solid #2a2a2e;
            position: relative;
            transition: transform 0.2s, border-color 0.2s;
        }
        
        .pal-cell:hover {
            transform: scale(1.1);
            border-color: #ff6b6b;
            z-index: 10;
        }
        
        .pal-de {
            position: absolute;
            bottom: 1px;
            right: 1px;
            background: rgba(0,0,0,0.85);
            color: #48dbfb;
            font-family: 'Space Mono', monospace;
            font-size: 7px;
            padding: 1px 3px;
            border-radius: 2px;
        }
        
        .loading-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10,10,11,0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            transition: opacity 0.5s;
        }
        
        .loading-overlay.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        .loader {
            width: 60px;
            height: 60px;
            border: 3px solid #1f1f22;
            border-top-color: #ff6b6b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .loading-text {
            margin-top: 20px;
            font-family: 'Space Mono', monospace;
            font-size: 12px;
            color: #666;
        }
        
        .controls-row {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .control-group {
            flex: 1;
        }
        
        .control-group label {
            display: block;
            font-family: 'Space Mono', monospace;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #555;
            margin-bottom: 6px;
        }
        
        select, input[type="number"] {
            width: 100%;
            background: #0d0d0e;
            border: 1px solid #2a2a2e;
            border-radius: 6px;
            color: #e8e8e8;
            padding: 8px 10px;
            font-family: 'Space Mono', monospace;
            font-size: 11px;
            outline: none;
            transition: border-color 0.2s;
        }
        
        select:focus, input[type="number"]:focus {
            border-color: #ff6b6b;
        }
        
        button {
            background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
            border: none;
            border-radius: 8px;
            color: #fff;
            padding: 12px 20px;
            font-family: 'Space Mono', monospace;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(255,107,107,0.3);
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255,107,107,0.4);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        @media (max-width: 1000px) {
            .main-grid { grid-template-columns: 1fr; }
            .gamut-section { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="noise"></div>
    
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loader"></div>
        <div class="loading-text" id="loadingText">Loading landscape image...</div>
    </div>
    
    <div class="container">
        <header>
            <div>
                <h1>Paint Gamut Projection</h1>
                <div class="subtitle">Kubelka-Munk pigment mixing & color projection</div>
            </div>
            <div class="status">
                <div class="status-dot"></div>
                <span id="statusText">Initializing</span>
            </div>
        </header>
        
        <div class="main-grid">
            <div class="sidebar">
                <div class="panel">
                    <div class="panel-title">Pigment Palette</div>
                    <div id="pigments"></div>
                    <div class="mix-result">
                        <div class="mix-box" id="mixBox"></div>
                        <div class="mix-info" id="mixInfo">L* a* b*</div>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">Projection Settings</div>
                    <div class="controls-row">
                        <div class="control-group">
                            <label>Colors</label>
                            <input type="number" id="numColors" value="24" min="8" max="48">
                        </div>
                        <div class="control-group">
                            <label>Method</label>
                            <select id="method">
                                <option value="closest">Min ΔE</option>
                                <option value="hue">Const Hue</option>
                            </select>
                        </div>
                    </div>
                    <div class="controls-row">
                        <div class="control-group">
                            <label>Dithering</label>
                            <select id="dither">
                                <option value="none">None</option>
                                <option value="floyd" selected>Floyd-Steinberg</option>
                                <option value="atkinson">Atkinson</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label>Strength</label>
                            <input type="number" id="ditherStr" value="0.85" min="0" max="1" step="0.05">
                        </div>
                    </div>
                    <button id="reprocess" style="width: 100%; margin-top: 10px;">Reprocess Image</button>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #1f1f22;">
                        <label style="display: block; margin-bottom: 8px;">Or upload your own image:</label>
                        <input type="file" id="fileInput" accept="image/*" style="width: 100%; font-size: 10px;">
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">Statistics</div>
                    <div class="stats-panel" id="stats">
                        <div class="stat-row">
                            <span class="stat-label">Status</span>
                            <span class="stat-value">Processing...</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="main-content">
                <div class="result-container">
                    <div class="result-header">
                        <div class="result-title">● Original vs Projected Comparison</div>
                    </div>
                    <div class="canvas-wrapper">
                        <canvas id="resultCanvas"></canvas>
                    </div>
                </div>
                
                <div class="gamut-section">
                    <div class="gamut-canvas-wrap">
                        <div class="panel-title">Lab Color Space Gamut</div>
                        <canvas id="gamutCanvas" width="400" height="400"></canvas>
                    </div>
                    <div class="gamut-canvas-wrap">
                        <div class="panel-title">Extracted → Projected Palette</div>
                        <div class="palette-grid" id="palette"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Pigments with Kubelka-Munk coefficients
        const pigs = [
            { name: 'Titanium White', rgb: [255,255,255], k: [0.02,0.02,0.02], s: [1,1,1] },
            { name: 'Ivory Black', rgb: [20,20,20], k: [8,8,8], s: [0.2,0.2,0.2] },
            { name: 'Cadmium Yellow', rgb: [255,235,0], k: [0.1,0.15,2.5], s: [0.8,0.8,0.3] },
            { name: 'Cadmium Red', rgb: [227,0,34], k: [0.2,2.5,2], s: [0.8,0.3,0.3] },
            { name: 'Ultramarine', rgb: [25,25,180], k: [2,2,0.2], s: [0.4,0.4,0.9] },
            { name: 'Viridian', rgb: [0,121,111], k: [2.5,0.5,1.5], s: [0.3,0.8,0.6] }
        ];
        
        let conc = [0.2, 0.2, 0.2, 0.15, 0.15, 0.1];
        let gamut = [];
        let img = null;
        let extPal = [];
        let projPal = [];

        // Color conversion functions
        function rgb2xyz(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
            g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
            b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
            return {
                x: (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
                y: (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
                z: (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100
            };
        }

        function xyz2lab(x, y, z) {
            x /= 95.047; y /= 100; z /= 108.883;
            x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
            y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
            z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);
            return { l: (116 * y) - 16, a: 500 * (x - y), b: 200 * (y - z) };
        }

        function lab2xyz(l, a, b) {
            let y = (l + 16) / 116;
            let x = a / 500 + y;
            let z = y - b / 200;
            x = Math.pow(x, 3) > 0.008856 ? Math.pow(x, 3) : (x - 16/116) / 7.787;
            y = Math.pow(y, 3) > 0.008856 ? Math.pow(y, 3) : (y - 16/116) / 7.787;
            z = Math.pow(z, 3) > 0.008856 ? Math.pow(z, 3) : (z - 16/116) / 7.787;
            return { x: x * 95.047, y: y * 100, z: z * 108.883 };
        }

        function xyz2rgb(x, y, z) {
            x /= 100; y /= 100; z /= 100;
            let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
            let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
            let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
            r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
            g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
            b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;
            return {
                r: Math.max(0, Math.min(255, Math.round(r * 255))),
                g: Math.max(0, Math.min(255, Math.round(g * 255))),
                b: Math.max(0, Math.min(255, Math.round(b * 255)))
            };
        }

        function rgb2lab(r, g, b) {
            const xyz = rgb2xyz(r, g, b);
            return xyz2lab(xyz.x, xyz.y, xyz.z);
        }

        function lab2rgb(l, a, b) {
            const xyz = lab2xyz(l, a, b);
            return xyz2rgb(xyz.x, xyz.y, xyz.z);
        }

        function lab2lch(l, a, b) {
            const c = Math.sqrt(a * a + b * b);
            const h = Math.atan2(b, a) * 180 / Math.PI;
            return { l, c, h: h < 0 ? h + 360 : h };
        }

        // Kubelka-Munk mixing
        function mix(pigs, conc) {
            const sum = conc.reduce((a, b) => a + b, 0);
            const norm = conc.map(c => c / sum);
            let k = [0, 0, 0], s = [0, 0, 0];
            for (let i = 0; i < pigs.length; i++) {
                for (let j = 0; j < 3; j++) {
                    k[j] += norm[i] * pigs[i].k[j];
                    s[j] += norm[i] * pigs[i].s[j];
                }
            }
            const r = k.map((kv, i) => {
                const ks = kv / s[i];
                return Math.max(0, Math.min(1, 1 + ks - Math.sqrt(ks * ks + 2 * ks)));
            });
            return r.map(rv => Math.round(rv * 255));
        }

        // Build gamut from pigment mixtures
        function buildGamut() {
            const g = [];
            
            pigs.forEach(p => {
                const lab = rgb2lab(p.rgb[0], p.rgb[1], p.rgb[2]);
                g.push({ lab, rgb: p.rgb });
            });

            for (let i = 0; i < pigs.length; i++) {
                for (let j = i + 1; j < pigs.length; j++) {
                    for (let s = 1; s < 20; s++) {
                        const r = s / 20;
                        const c = Array(pigs.length).fill(0);
                        c[i] = r; c[j] = 1 - r;
                        const rgb = mix(pigs, c);
                        const lab = rgb2lab(rgb[0], rgb[1], rgb[2]);
                        g.push({ lab, rgb });
                    }
                }
            }

            for (let i = 0; i < pigs.length; i++) {
                for (let j = i + 1; j < pigs.length; j++) {
                    for (let k = j + 1; k < pigs.length; k++) {
                        for (let s1 = 1; s1 < 8; s1++) {
                            for (let s2 = 1; s2 < 8 - s1; s2++) {
                                const r1 = s1 / 8;
                                const r2 = s2 / 8;
                                const r3 = 1 - r1 - r2;
                                if (r3 <= 0) continue;
                                const c = Array(pigs.length).fill(0);
                                c[i] = r1; c[j] = r2; c[k] = r3;
                                const rgb = mix(pigs, c);
                                const lab = rgb2lab(rgb[0], rgb[1], rgb[2]);
                                g.push({ lab, rgb });
                            }
                        }
                    }
                }
            }
            return g;
        }

        // Project color to gamut
        function project(color, method) {
            const tLab = rgb2lab(color[0], color[1], color[2]);
            
            if (method === 'hue') {
                const tLch = lab2lch(tLab.l, tLab.a, tLab.b);
                let minD = Infinity, closest = gamut[0];
                gamut.forEach(p => {
                    const pLch = lab2lch(p.lab.l, p.lab.a, p.lab.b);
                    const hDiff = Math.min(Math.abs(tLch.h - pLch.h), 360 - Math.abs(tLch.h - pLch.h));
                    const d = hDiff * 2 + Math.abs(tLch.l - pLch.l) * 0.5 + Math.abs(tLch.c - pLch.c) * 0.5;
                    if (d < minD) { minD = d; closest = p; }
                });
                const de = Math.sqrt(
                    Math.pow(tLab.l - closest.lab.l, 2) +
                    Math.pow(tLab.a - closest.lab.a, 2) +
                    Math.pow(tLab.b - closest.lab.b, 2)
                );
                return { rgb: closest.rgb, lab: closest.lab, de };
            } else {
                let minD = Infinity, closest = gamut[0];
                gamut.forEach(p => {
                    const d = Math.sqrt(
                        Math.pow(tLab.l - p.lab.l, 2) +
                        Math.pow(tLab.a - p.lab.a, 2) +
                        Math.pow(tLab.b - p.lab.b, 2)
                    );
                    if (d < minD) { minD = d; closest = p; }
                });
                return { rgb: closest.rgb, lab: closest.lab, de: minD };
            }
        }

        // K-means clustering
        function kmeans(pixels, k, maxIter = 50) {
            let cents = [];
            for (let i = 0; i < k; i++) {
                cents.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
            }

            for (let iter = 0; iter < maxIter; iter++) {
                const clusters = Array(k).fill(null).map(() => []);
                pixels.forEach(p => {
                    let minD = Infinity, nearIdx = 0;
                    cents.forEach((c, idx) => {
                        const d = Math.sqrt(
                            Math.pow(p[0] - c[0], 2) +
                            Math.pow(p[1] - c[1], 2) +
                            Math.pow(p[2] - c[2], 2)
                        );
                        if (d < minD) { minD = d; nearIdx = idx; }
                    });
                    clusters[nearIdx].push(p);
                });

                let changed = false;
                cents = clusters.map((cl, idx) => {
                    if (cl.length === 0) return cents[idx];
                    const sum = cl.reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0]);
                    const newC = [
                        Math.round(sum[0] / cl.length),
                        Math.round(sum[1] / cl.length),
                        Math.round(sum[2] / cl.length)
                    ];
                    if (newC[0] !== cents[idx][0] || newC[1] !== cents[idx][1] || newC[2] !== cents[idx][2]) {
                        changed = true;
                    }
                    return newC;
                });

                if (!changed) break;
            }
            return cents;
        }

        // Floyd-Steinberg and Atkinson dithering
        function ditherImage(srcData, palette, method, strength) {
            const w = srcData.width;
            const h = srcData.height;
            const data = new Float32Array(srcData.data.length);
            for (let i = 0; i < srcData.data.length; i++) data[i] = srcData.data[i];
            const result = new ImageData(w, h);
            
            const matrices = {
                floyd: [
                    [1, 0, 7/16],
                    [-1, 1, 3/16],
                    [0, 1, 5/16],
                    [1, 1, 1/16]
                ],
                atkinson: [
                    [1, 0, 1/8],
                    [2, 0, 1/8],
                    [-1, 1, 1/8],
                    [0, 1, 1/8],
                    [1, 1, 1/8],
                    [0, 2, 1/8]
                ]
            };
            
            const matrix = matrices[method] || null;
            
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const idx = (y * w + x) * 4;
                    const oldR = Math.max(0, Math.min(255, data[idx]));
                    const oldG = Math.max(0, Math.min(255, data[idx + 1]));
                    const oldB = Math.max(0, Math.min(255, data[idx + 2]));
                    
                    let minDist = Infinity;
                    let closest = palette[0];
                    palette.forEach(c => {
                        const d = Math.sqrt(
                            Math.pow(oldR - c[0], 2) +
                            Math.pow(oldG - c[1], 2) +
                            Math.pow(oldB - c[2], 2)
                        );
                        if (d < minDist) {
                            minDist = d;
                            closest = c;
                        }
                    });
                    
                    result.data[idx] = closest[0];
                    result.data[idx + 1] = closest[1];
                    result.data[idx + 2] = closest[2];
                    result.data[idx + 3] = srcData.data[idx + 3];
                    
                    if (matrix && method !== 'none') {
                        const errR = (oldR - closest[0]) * strength;
                        const errG = (oldG - closest[1]) * strength;
                        const errB = (oldB - closest[2]) * strength;
                        
                        matrix.forEach(([dx, dy, weight]) => {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                                const nIdx = (ny * w + nx) * 4;
                                data[nIdx] += errR * weight;
                                data[nIdx + 1] += errG * weight;
                                data[nIdx + 2] += errB * weight;
                            }
                        });
                    }
                }
            }
            
            return result;
        }

        // Draw gamut visualization
        function drawGamut() {
            const c = document.getElementById('gamutCanvas');
            const ctx = c.getContext('2d');
            const w = c.width, h = c.height;

            ctx.fillStyle = '#080808';
            ctx.fillRect(0, 0, w, h);

            const sc = 1.8;
            const ox = w / 2, oy = h / 2;

            // Grid
            ctx.strokeStyle = '#151517';
            ctx.lineWidth = 1;
            for (let i = -100; i <= 100; i += 20) {
                ctx.beginPath();
                ctx.moveTo(ox + i * sc, 0);
                ctx.lineTo(ox + i * sc, h);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, oy + i * sc);
                ctx.lineTo(w, oy + i * sc);
                ctx.stroke();
            }

            // Axes
            ctx.strokeStyle = '#252527';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, oy); ctx.lineTo(w, oy);
            ctx.moveTo(ox, 0); ctx.lineTo(ox, h);
            ctx.stroke();

            // Gamut points
            gamut.forEach(p => {
                const x = ox + p.lab.a * sc;
                const y = oy - p.lab.b * sc;
                ctx.fillStyle = `rgb(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]})`;
                ctx.fillRect(x - 1, y - 1, 2, 2);
            });

            // Gamut boundary
            const ext = findExt(gamut);
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ext.forEach((p, i) => {
                const x = ox + p.lab.a * sc;
                const y = oy - p.lab.b * sc;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.stroke();

            // Extracted palette
            if (extPal.length > 0) {
                extPal.forEach((c, i) => {
                    const x = ox + c.lab.a * sc;
                    const y = oy - c.lab.b * sc;
                    ctx.fillStyle = `rgb(${c.rgb[0]},${c.rgb[1]},${c.rgb[2]})`;
                    ctx.strokeStyle = '#9b59b6';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                });
            }

            // Projected palette with connections
            if (projPal.length > 0) {
                projPal.forEach((c, i) => {
                    if (extPal[i]) {
                        const ox1 = ox + extPal[i].lab.a * sc;
                        const oy1 = oy - extPal[i].lab.b * sc;
                        const ox2 = ox + c.lab.a * sc;
                        const oy2 = oy - c.lab.b * sc;
                        ctx.strokeStyle = 'rgba(72, 219, 251, 0.3)';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([3, 3]);
                        ctx.beginPath();
                        ctx.moveTo(ox1, oy1);
                        ctx.lineTo(ox2, oy2);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }

                    const x = ox + c.lab.a * sc;
                    const y = oy - c.lab.b * sc;
                    ctx.fillStyle = `rgb(${c.rgb[0]},${c.rgb[1]},${c.rgb[2]})`;
                    ctx.strokeStyle = '#48dbfb';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                });
            }
        }

        function findExt(g) {
            const angles = [];
            for (let i = 0; i < 32; i++) angles.push(i * Math.PI / 16);
            const ext = [];
            angles.forEach(a => {
                let maxD = -Infinity, ex = null;
                g.forEach(p => {
                    const d = p.lab.a * Math.cos(a) + p.lab.b * Math.sin(a);
                    if (d > maxD) { maxD = d; ex = p; }
                });
                if (ex) ext.push(ex);
            });
            return ext;
        }

        // Initialize pigment controls
        function initPigments() {
            const cont = document.getElementById('pigments');
            cont.innerHTML = '';
            pigs.forEach((p, i) => {
                const div = document.createElement('div');
                div.className = 'pigment';
                const pct = Math.round(conc[i] * 100);
                div.innerHTML = `
                    <div class="swatch" style="background:rgb(${p.rgb[0]},${p.rgb[1]},${p.rgb[2]})"></div>
                    <div>
                        <div class="pig-name">${p.name}</div>
                        <input type="range" min="0" max="100" value="${pct}" id="sl${i}">
                    </div>
                    <div class="pig-val">${pct}%</div>
                `;
                cont.appendChild(div);
                
                setTimeout(() => {
                    document.getElementById(`sl${i}`).addEventListener('input', (e) => {
                        conc[i] = parseFloat(e.target.value) / 100;
                        updateMix();
                    });
                }, 0);
            });
            updateMix();
        }

        function updateMix() {
            pigs.forEach((p, i) => {
                const pct = Math.round(conc[i] * 100);
                const items = document.querySelectorAll('.pigment');
                if (items[i]) items[i].querySelector('.pig-val').textContent = `${pct}%`;
            });

            const m = mix(pigs, conc);
            document.getElementById('mixBox').style.background = `rgb(${m[0]},${m[1]},${m[2]})`;
            const lab = rgb2lab(m[0], m[1], m[2]);
            document.getElementById('mixInfo').textContent = `L*=${lab.l.toFixed(0)} a*=${lab.a.toFixed(0)} b*=${lab.b.toFixed(0)}`;
        }

        // Show palette
        function showPalette() {
            const grid = document.getElementById('palette');
            grid.innerHTML = '';

            extPal.forEach((c, i) => {
                const cell = document.createElement('div');
                cell.className = 'pal-cell';

                const grad = projPal[i] ?
                    `linear-gradient(135deg, rgb(${c.rgb[0]},${c.rgb[1]},${c.rgb[2]}) 50%, rgb(${projPal[i].rgb[0]},${projPal[i].rgb[1]},${projPal[i].rgb[2]}) 50%)` :
                    `rgb(${c.rgb[0]},${c.rgb[1]},${c.rgb[2]})`;

                cell.style.background = grad;

                if (projPal[i]) {
                    const de = document.createElement('div');
                    de.className = 'pal-de';
                    de.textContent = projPal[i].de.toFixed(1);
                    cell.appendChild(de);
                }

                grid.appendChild(cell);
            });
        }

        // Update statistics
        function updateStats() {
            const avg = projPal.reduce((s, c) => s + c.de, 0) / projPal.length;
            const max = Math.max(...projPal.map(c => c.de));
            const min = Math.min(...projPal.map(c => c.de));
            const method = document.getElementById('method').value;

            document.getElementById('stats').innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">Average ΔE</span>
                    <span class="stat-value">${avg.toFixed(2)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Max ΔE</span>
                    <span class="stat-value">${max.toFixed(2)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Min ΔE</span>
                    <span class="stat-value">${min.toFixed(2)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Method</span>
                    <span class="stat-value">${method === 'closest' ? 'Min ΔE' : 'Const Hue'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Gamut Size</span>
                    <span class="stat-value">${gamut.length} colors</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Palette Size</span>
                    <span class="stat-value">${extPal.length} colors</span>
                </div>
            `;
        }

        // Full processing pipeline
        async function processImage() {
            const loadingText = document.getElementById('loadingText');
            const statusText = document.getElementById('statusText');
            
            loadingText.textContent = 'Extracting palette...';
            statusText.textContent = 'Extracting';
            await new Promise(r => setTimeout(r, 50));
            
            // Create temp canvas
            const tempCanvas = document.createElement('canvas');
            const maxSz = 500;
            const sc = Math.min(1, maxSz / Math.max(img.width, img.height));
            tempCanvas.width = Math.round(img.width * sc);
            tempCanvas.height = Math.round(img.height * sc);
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            
            const srcData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Sample pixels for k-means
            const px = [];
            for (let i = 0; i < srcData.data.length; i += 4) {
                px.push([srcData.data[i], srcData.data[i + 1], srcData.data[i + 2]]);
            }
            
            const samp = Math.min(10000, px.length);
            const sampled = [];
            for (let i = 0; i < samp; i++) {
                sampled.push(px[Math.floor(Math.random() * px.length)]);
            }
            
            // Extract palette
            const n = parseInt(document.getElementById('numColors').value);
            const pal = kmeans(sampled, n);
            extPal = pal.map(c => ({ rgb: c, lab: rgb2lab(c[0], c[1], c[2]) }));
            
            loadingText.textContent = 'Projecting to gamut...';
            statusText.textContent = 'Projecting';
            await new Promise(r => setTimeout(r, 50));
            
            // Project palette
            const method = document.getElementById('method').value;
            projPal = extPal.map(c => project(c.rgb, method));
            
            loadingText.textContent = 'Regenerating image...';
            statusText.textContent = 'Rendering';
            await new Promise(r => setTimeout(r, 50));
            
            // Dither and regenerate
            const ditherMethod = document.getElementById('dither').value;
            const ditherStr = parseFloat(document.getElementById('ditherStr').value);
            const projRgb = projPal.map(p => p.rgb);
            
            const dstData = ditherImage(srcData, projRgb, ditherMethod, ditherStr);
            
            // Create stitched result
            const resultCanvas = document.getElementById('resultCanvas');
            resultCanvas.width = tempCanvas.width;
            resultCanvas.height = tempCanvas.height * 2 + 4; // 4px divider
            const resultCtx = resultCanvas.getContext('2d');
            
            // Draw original on top
            resultCtx.drawImage(tempCanvas, 0, 0);
            
            // Divider
            resultCtx.fillStyle = '#1f1f22';
            resultCtx.fillRect(0, tempCanvas.height, tempCanvas.width, 4);
            
            // Draw projected on bottom
            const projCanvas = document.createElement('canvas');
            projCanvas.width = tempCanvas.width;
            projCanvas.height = tempCanvas.height;
            projCanvas.getContext('2d').putImageData(dstData, 0, 0);
            resultCtx.drawImage(projCanvas, 0, tempCanvas.height + 4);
            
            // Labels
            resultCtx.font = '12px "Space Mono", monospace';
            resultCtx.fillStyle = 'rgba(255,255,255,0.9)';
            resultCtx.fillRect(8, 8, 70, 20);
            resultCtx.fillStyle = '#0a0a0b';
            resultCtx.fillText('ORIGINAL', 12, 22);
            
            resultCtx.fillStyle = 'rgba(255,255,255,0.9)';
            resultCtx.fillRect(8, tempCanvas.height + 12, 78, 20);
            resultCtx.fillStyle = '#0a0a0b';
            resultCtx.fillText('PROJECTED', 12, tempCanvas.height + 26);
            
            // Update UI
            showPalette();
            drawGamut();
            updateStats();
            
            statusText.textContent = 'Complete';
            document.getElementById('loadingOverlay').classList.add('hidden');
        }

        // Generate a beautiful procedural landscape image
        function generateLandscapeImage() {
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 450;
            const ctx = canvas.getContext('2d');
            
            // Sky gradient
            const skyGrad = ctx.createLinearGradient(0, 0, 0, 250);
            skyGrad.addColorStop(0, '#1a237e');
            skyGrad.addColorStop(0.3, '#4a148c');
            skyGrad.addColorStop(0.5, '#e65100');
            skyGrad.addColorStop(0.7, '#ff8f00');
            skyGrad.addColorStop(1, '#ffcc80');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, 600, 280);
            
            // Sun
            const sunGrad = ctx.createRadialGradient(450, 180, 0, 450, 180, 60);
            sunGrad.addColorStop(0, '#fff9c4');
            sunGrad.addColorStop(0.3, '#ffee58');
            sunGrad.addColorStop(0.7, '#ff9800');
            sunGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = sunGrad;
            ctx.fillRect(380, 120, 140, 120);
            
            // Mountains - back layer
            ctx.fillStyle = '#311b92';
            ctx.beginPath();
            ctx.moveTo(0, 280);
            ctx.lineTo(100, 180);
            ctx.lineTo(200, 220);
            ctx.lineTo(300, 150);
            ctx.lineTo(400, 200);
            ctx.lineTo(500, 160);
            ctx.lineTo(600, 210);
            ctx.lineTo(600, 280);
            ctx.closePath();
            ctx.fill();
            
            // Mountains - mid layer
            ctx.fillStyle = '#4a148c';
            ctx.beginPath();
            ctx.moveTo(0, 280);
            ctx.lineTo(80, 220);
            ctx.lineTo(180, 250);
            ctx.lineTo(280, 190);
            ctx.lineTo(380, 230);
            ctx.lineTo(480, 200);
            ctx.lineTo(600, 240);
            ctx.lineTo(600, 280);
            ctx.closePath();
            ctx.fill();
            
            // Mountains - front layer
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.moveTo(0, 280);
            ctx.lineTo(120, 240);
            ctx.lineTo(220, 260);
            ctx.lineTo(350, 220);
            ctx.lineTo(450, 250);
            ctx.lineTo(550, 230);
            ctx.lineTo(600, 260);
            ctx.lineTo(600, 280);
            ctx.closePath();
            ctx.fill();
            
            // Water/lake
            const waterGrad = ctx.createLinearGradient(0, 280, 0, 450);
            waterGrad.addColorStop(0, '#0d47a1');
            waterGrad.addColorStop(0.5, '#1565c0');
            waterGrad.addColorStop(1, '#0a1628');
            ctx.fillStyle = waterGrad;
            ctx.fillRect(0, 280, 600, 170);
            
            // Water reflections
            ctx.globalAlpha = 0.3;
            const reflectGrad = ctx.createLinearGradient(0, 280, 0, 380);
            reflectGrad.addColorStop(0, '#ff8f00');
            reflectGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = reflectGrad;
            ctx.fillRect(350, 280, 200, 100);
            ctx.globalAlpha = 1;
            
            // Horizontal water lines
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            for (let y = 290; y < 450; y += 15) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                for (let x = 0; x < 600; x += 20) {
                    ctx.lineTo(x + 10, y + Math.sin(x * 0.05) * 2);
                }
                ctx.stroke();
            }
            
            // Foreground - grass/ground
            ctx.fillStyle = '#1b5e20';
            ctx.beginPath();
            ctx.moveTo(0, 400);
            ctx.quadraticCurveTo(100, 380, 150, 400);
            ctx.quadraticCurveTo(200, 420, 250, 410);
            ctx.lineTo(250, 450);
            ctx.lineTo(0, 450);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#2e7d32';
            ctx.beginPath();
            ctx.moveTo(400, 420);
            ctx.quadraticCurveTo(500, 390, 600, 410);
            ctx.lineTo(600, 450);
            ctx.lineTo(400, 450);
            ctx.closePath();
            ctx.fill();
            
            // Trees silhouettes
            ctx.fillStyle = '#0d1f0d';
            for (let i = 0; i < 8; i++) {
                const tx = 20 + i * 28;
                const th = 30 + Math.random() * 20;
                ctx.beginPath();
                ctx.moveTo(tx, 410);
                ctx.lineTo(tx + 12, 410 - th);
                ctx.lineTo(tx + 24, 410);
                ctx.closePath();
                ctx.fill();
            }
            
            for (let i = 0; i < 6; i++) {
                const tx = 420 + i * 30;
                const th = 25 + Math.random() * 15;
                ctx.beginPath();
                ctx.moveTo(tx, 420);
                ctx.lineTo(tx + 10, 420 - th);
                ctx.lineTo(tx + 20, 420);
                ctx.closePath();
                ctx.fill();
            }
            
            // Stars
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 50; i++) {
                const sx = Math.random() * 600;
                const sy = Math.random() * 150;
                const sr = Math.random() * 1.5;
                ctx.beginPath();
                ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Add some clouds
            ctx.fillStyle = 'rgba(255,200,150,0.2)';
            ctx.beginPath();
            ctx.ellipse(100, 80, 60, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(250, 60, 80, 25, 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            return canvas;
        }
        
        // Load preset image
        function loadPresetImage() {
            const loadingText = document.getElementById('loadingText');
            loadingText.textContent = 'Generating landscape...';
            
            // Generate a procedural landscape
            const generatedCanvas = generateLandscapeImage();
            
            // Convert to image
            img = new Image();
            img.onload = () => {
                loadingText.textContent = 'Building gamut...';
                gamut = buildGamut();
                processImage();
            };
            img.src = generatedCanvas.toDataURL('image/png');
        }

        // Reprocess button
        document.getElementById('reprocess').addEventListener('click', () => {
            document.getElementById('loadingOverlay').classList.remove('hidden');
            document.getElementById('loadingText').textContent = 'Reprocessing...';
            gamut = buildGamut();
            setTimeout(processImage, 100);
        });

        // File upload handler
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    document.getElementById('loadingOverlay').classList.remove('hidden');
                    document.getElementById('loadingText').textContent = 'Loading your image...';
                    img = new Image();
                    img.onload = () => {
                        document.getElementById('loadingText').textContent = 'Building gamut...';
                        gamut = buildGamut();
                        processImage();
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Initialize
        initPigments();
        loadPresetImage();
    </script>
</body>
</html>