import { useState, useEffect } from "react";

const ASSETS_PATH = "/assets/visualizing-color-spaces-in-ar-glasses";

export default function WorkflowDiagram3D() {
  const [scriptCode, setScriptCode] = useState<string>("");
  const [encoderCode, setEncoderCode] = useState<string>("");
  const [decoderCode, setDecoderCode] = useState<string>("");
  const [focusedLevel, setFocusedLevel] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${ASSETS_PATH}/scripts/encoder_script.txt`)
      .then(res => res.text())
      .then(setScriptCode)
      .catch(() => setScriptCode("// Failed to load"));

    fetch(`${ASSETS_PATH}/scripts/encoder_code_node.txt`)
      .then(res => res.text())
      .then(setEncoderCode)
      .catch(() => setEncoderCode("// Failed to load"));

    fetch(`${ASSETS_PATH}/scripts/decoder_code_node.txt`)
      .then(res => res.text())
      .then(text => setDecoderCode(text || "// Not yet available"))
      .catch(() => setDecoderCode("// Failed to load"));
  }, []);

  const handleLevelClick = (level: number) => {
    setFocusedLevel(prev => prev === level ? null : level);
  };

  return (
    <div className="workflow-3d my-12">
      {/* 3D Stage */}
      <div
        className="stage"
        style={{
          perspective: '1200px',
          perspectiveOrigin: '50% 30%',
        }}
      >
        <div
          className="scene"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: focusedLevel === null
              ? 'rotateX(25deg)'
              : focusedLevel === 1
                ? 'rotateX(5deg) translateZ(100px)'
                : focusedLevel === 2
                  ? 'rotateX(15deg) translateY(-80px)'
                  : 'rotateX(10deg) translateY(-160px)',
          }}
        >
          {/* ===== LEVEL 1: Node Icons ===== */}
          <div
            onClick={() => handleLevelClick(1)}
            className="level level-1"
            style={{
              transform: 'translateZ(0px) translateY(0px)',
              opacity: focusedLevel === null || focusedLevel === 1 ? 1 : 0.4,
              transition: 'all 0.5s ease',
            }}
          >
            <div className="level-content flex items-center justify-center gap-1 p-4 rounded-2xl bg-gradient-to-b from-[#1a1a2e]/90 to-[#0f0f1a]/90 backdrop-blur-sm border border-white/10">
              {/* Material Node */}
              <div className="node flex flex-col items-center p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                <img src={`${ASSETS_PATH}/icons/Material.png`} alt="Material" className="w-12 h-12 md:w-16 md:h-16" />
                <span className="mt-1 text-[10px] md:text-xs text-white/80 font-medium">Encoder Material</span>
                <div className="flex gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07eaff]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff89e6]" />
                </div>
              </div>

              {/* Connector */}
              <div className="connector flex flex-col gap-1 px-1">
                <div className="h-[2px] w-8 md:w-12 bg-gradient-to-r from-[#07eaff] to-[#07eaff]/50 animate-flow" />
                <div className="h-[2px] w-8 md:w-12 bg-gradient-to-r from-[#ff89e6] to-[#ff89e6]/50 animate-flow-delayed" />
              </div>

              {/* Script Node */}
              <div className="node flex flex-col items-center p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                <img src={`${ASSETS_PATH}/icons/Script.png`} alt="Script" className="w-12 h-12 md:w-16 md:h-16" />
                <span className="mt-1 text-[10px] md:text-xs text-white/80 font-medium">Encoder Script</span>
                <div className="flex gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07eaff]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff89e6]" />
                </div>
              </div>

              {/* Connector */}
              <div className="connector flex flex-col gap-1 px-1">
                <div className="h-[2px] w-8 md:w-12 bg-gradient-to-r from-[#07eaff] to-[#07eaff]/50 animate-flow" />
                <div className="h-[2px] w-8 md:w-12 bg-gradient-to-r from-[#ff89e6] to-[#ff89e6]/50 animate-flow-delayed" />
              </div>

              {/* VFX Node */}
              <div className="node flex flex-col items-center p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                <img src={`${ASSETS_PATH}/icons/VFX.png`} alt="VFX" className="w-12 h-12 md:w-16 md:h-16" />
                <span className="mt-1 text-[10px] md:text-xs text-white/80 font-medium">Decoder VFX</span>
                <div className="flex gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07eaff]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff89e6]" />
                </div>
              </div>
            </div>
          </div>

          {/* ===== LEVEL 2: Screenshots ===== */}
          <div
            onClick={() => handleLevelClick(2)}
            className="level level-2"
            style={{
              transform: 'translateZ(-150px) translateY(140px)',
              opacity: focusedLevel === null || focusedLevel === 2 ? 1 : 0.3,
              transition: 'all 0.5s ease',
            }}
          >
            <div className="level-content flex justify-center gap-4 md:gap-8">
              {/* Material Screenshot */}
              <div className="screenshot-card rounded-xl overflow-hidden border-2 border-[#07eaff]/20 hover:border-[#07eaff]/60 transition-all cursor-pointer bg-[#0a0a1a]/80 backdrop-blur">
                <img
                  src={`${ASSETS_PATH}/captures/material_encoder.png`}
                  alt="Material Encoder"
                  className="w-[200px] md:w-[280px]"
                />
                <div className="px-2 py-1.5 text-center text-[10px] text-white/50 bg-[#1a1a2e]">
                  Material Graph
                </div>
              </div>

              {/* VFX Screenshot */}
              <div className="screenshot-card rounded-xl overflow-hidden border-2 border-[#ff89e6]/20 hover:border-[#ff89e6]/60 transition-all cursor-pointer bg-[#0a0a1a]/80 backdrop-blur">
                <img
                  src={`${ASSETS_PATH}/captures/vfx_decoder.png`}
                  alt="VFX Decoder"
                  className="w-[200px] md:w-[280px]"
                />
                <div className="px-2 py-1.5 text-center text-[10px] text-white/50 bg-[#1a1a2e]">
                  VFX Graph
                </div>
              </div>
            </div>
          </div>

          {/* ===== LEVEL 3: Code ===== */}
          <div
            onClick={() => handleLevelClick(3)}
            className="level level-3"
            style={{
              transform: 'translateZ(-300px) translateY(300px)',
              opacity: focusedLevel === null || focusedLevel === 3 ? 1 : 0.2,
              transition: 'all 0.5s ease',
            }}
          >
            <div className="level-content flex justify-center gap-3 md:gap-4">
              {/* Encoder GLSL */}
              <div className="code-card rounded-lg bg-[#0d1117] border border-[#07eaff]/20 hover:border-[#07eaff]/50 transition-all cursor-pointer overflow-hidden" style={{ width: '200px' }}>
                <div className="px-2 py-1 bg-[#07eaff]/10 text-[9px] text-[#07eaff] font-mono">
                  encoder_code_node.glsl
                </div>
                <pre className="p-2 text-[8px] leading-relaxed text-gray-400 max-h-[120px] overflow-hidden">
                  <code>{encoderCode.slice(0, 300)}...</code>
                </pre>
              </div>

              {/* Script TS */}
              <div className="code-card rounded-lg bg-[#0d1117] border border-white/10 hover:border-white/30 transition-all cursor-pointer overflow-hidden" style={{ width: '200px' }}>
                <div className="px-2 py-1 bg-white/5 text-[9px] text-white/70 font-mono">
                  encoder_script.ts
                </div>
                <pre className="p-2 text-[8px] leading-relaxed text-gray-400 max-h-[120px] overflow-hidden">
                  <code>{scriptCode.slice(0, 300)}...</code>
                </pre>
              </div>

              {/* Decoder GLSL */}
              <div className="code-card rounded-lg bg-[#0d1117] border border-[#ff89e6]/20 hover:border-[#ff89e6]/50 transition-all cursor-pointer overflow-hidden" style={{ width: '200px' }}>
                <div className="px-2 py-1 bg-[#ff89e6]/10 text-[9px] text-[#ff89e6] font-mono">
                  decoder_code_node.glsl
                </div>
                <pre className="p-2 text-[8px] leading-relaxed text-gray-400 max-h-[120px] overflow-hidden">
                  <code>{decoderCode.slice(0, 300) || '// Coming soon...'}...</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls flex justify-center gap-2 mt-6">
        {[1, 2, 3].map(level => (
          <button
            key={level}
            onClick={() => handleLevelClick(level)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              focusedLevel === level
                ? 'bg-[#07eaff] text-black'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {level === 1 ? 'Nodes' : level === 2 ? 'Graphs' : 'Code'}
          </button>
        ))}
        {focusedLevel !== null && (
          <button
            onClick={() => setFocusedLevel(null)}
            className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/40 hover:bg-white/10"
          >
            Reset
          </button>
        )}
      </div>

      <style>{`
        .workflow-3d {
          background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
          padding: 2rem 1rem;
          border-radius: 1rem;
          min-height: 500px;
        }
        .stage {
          min-height: 420px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 20px;
        }
        .scene {
          position: relative;
          transform-style: preserve-3d;
        }
        .level {
          position: absolute;
          left: 50%;
          transform-style: preserve-3d;
          cursor: pointer;
        }
        .level-content {
          transform: translateX(-50%);
        }
        @keyframes flow {
          0% { opacity: 0.3; transform: scaleX(0.5); transform-origin: left; }
          50% { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0.3; transform: scaleX(0.5); transform-origin: right; }
        }
        .animate-flow {
          animation: flow 1.5s ease-in-out infinite;
        }
        .animate-flow-delayed {
          animation: flow 1.5s ease-in-out infinite;
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}
