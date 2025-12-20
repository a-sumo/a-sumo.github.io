import { useState, useEffect } from "react";

const ASSETS_PATH = "/assets/visualizing-color-spaces-in-ar-glasses";

type ExpandedNode = "material" | "script" | "vfx" | null;
type ExpandedDetail = "material" | "vfx" | null;

// ============ Helper Components ============

interface NodeIconProps {
  icon: string;
  label: string;
  isExpanded: boolean;
  onClick: () => void;
}

interface PortConfig {
  inputs?: boolean;
  outputs?: boolean;
}

function NodeIcon({ icon, label, isExpanded, onClick, ports }: NodeIconProps & { ports?: PortConfig }) {
  return (
    <div className="node-wrapper relative flex items-center">
      {/* Input ports - aligned with dotted lines */}
      {ports?.inputs && (
        <div className="input-ports absolute -left-[3px] flex flex-col z-10" style={{ gap: '4px' }}>
          <div className="w-[6px] h-[6px] rounded-full bg-[#07eaff]" title="positionRenderTarget" />
          <div className="w-[6px] h-[6px] rounded-full bg-[#ff89e6]" title="colorRenderTarget" />
        </div>
      )}

      <button
        onClick={onClick}
        className={`workflow-node flex flex-col items-center rounded-lg p-2 transition-all duration-200 hover:bg-skin-card/50 ${
          isExpanded ? "bg-skin-card/50" : ""
        }`}
        aria-expanded={isExpanded}
      >
        <img
          src={`${ASSETS_PATH}/icons/${icon}.png`}
          alt={label}
          className="h-12 w-12 md:h-16 md:w-16"
        />
        <span className="mt-1 text-xs md:text-sm font-medium">{label}</span>
      </button>

      {/* Output ports - aligned with dotted lines */}
      {ports?.outputs && (
        <div className="output-ports absolute -right-[3px] flex flex-col z-10" style={{ gap: '4px' }}>
          <div className="w-[6px] h-[6px] rounded-full bg-[#07eaff]" title="positionRenderTarget" />
          <div className="w-[6px] h-[6px] rounded-full bg-[#ff89e6]" title="colorRenderTarget" />
        </div>
      )}
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language: string;
}

function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block relative">
      <button
        onClick={copyToClipboard}
        className="absolute right-2 top-2 z-10 rounded bg-skin-fill px-2 py-1 text-xs opacity-70 transition-opacity hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="max-h-[400px] overflow-auto rounded-lg bg-skin-fill p-4 text-xs leading-relaxed md:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ============ Main Component ============

export default function WorkflowDiagram() {
  const [expandedNode, setExpandedNode] = useState<ExpandedNode>(null);
  const [expandedDetail, setExpandedDetail] = useState<ExpandedDetail>(null);
  const [scriptCode, setScriptCode] = useState<string>("");
  const [encoderCode, setEncoderCode] = useState<string>("");
  const [decoderCode, setDecoderCode] = useState<string>("");

  useEffect(() => {
    fetch(`${ASSETS_PATH}/scripts/encoder_script.txt`)
      .then(res => res.text())
      .then(setScriptCode)
      .catch(() => setScriptCode("// Failed to load script"));

    fetch(`${ASSETS_PATH}/scripts/encoder_code_node.txt`)
      .then(res => res.text())
      .then(setEncoderCode)
      .catch(() => setEncoderCode("// Failed to load code"));

    fetch(`${ASSETS_PATH}/scripts/decoder_code_node.txt`)
      .then(res => res.text())
      .then(text => setDecoderCode(text || "// Decoder code not yet available"))
      .catch(() => setDecoderCode("// Failed to load code"));
  }, []);

  const toggleNode = (node: ExpandedNode) => {
    if (expandedNode === node) {
      setExpandedNode(null);
      setExpandedDetail(null);
    } else {
      setExpandedNode(node);
      setExpandedDetail(null);
    }
  };

  const toggleDetail = (detail: ExpandedDetail) => {
    setExpandedDetail(prev => (prev === detail ? null : detail));
  };

  return (
    <div className="workflow-diagram my-8">
      {/* Level 1: Icons */}
      <div className="level-1 flex items-center justify-center gap-0">
        <NodeIcon
          icon="Material"
          label="Encoder Material"
          isExpanded={expandedNode === "material"}
          onClick={() => toggleNode("material")}
          ports={{ outputs: true }}
        />
        <NodeIcon
          icon="Script"
          label="Encoder Script"
          isExpanded={expandedNode === "script"}
          onClick={() => toggleNode("script")}
          ports={{ inputs: true, outputs: true }}
        />
        <NodeIcon
          icon="VFX"
          label="Decoder VFX"
          isExpanded={expandedNode === "vfx"}
          onClick={() => toggleNode("vfx")}
          ports={{ inputs: true }}
        />
      </div>

      {/* Level 2: Screenshots or Script Code */}
      <div
        className={`level-2 overflow-hidden transition-all duration-300 ease-in-out ${
          expandedNode ? "mt-6 max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Material Screenshot */}
        {expandedNode === "material" && (
          <div className="flex flex-col items-center animate-slideDown">
            <button
              onClick={() => toggleDetail("material")}
              className={`screenshot-btn overflow-hidden rounded-lg border-2 transition-all duration-200 hover:border-skin-accent ${
                expandedDetail === "material"
                  ? "border-skin-accent"
                  : "border-skin-line"
              }`}
              aria-expanded={expandedDetail === "material"}
              aria-label="Toggle Material encoder code"
            >
              <img
                src={`${ASSETS_PATH}/captures/material_encoder.png`}
                alt="Material Encoder"
                className="max-w-[520px] md:max-w-[680px]"
              />
            </button>
            <span className="mt-2 text-xs text-skin-base/60">
              Click to view code
            </span>
          </div>
        )}

        {/* Script Code */}
        {expandedNode === "script" && (
          <div className="animate-slideDown">
            <div className="mx-auto max-w-3xl rounded-lg border border-skin-line bg-skin-card p-4">
              <h4 className="mb-3 text-base font-semibold">
                Encoder Script (TypeScript)
              </h4>
              <CodeBlock code={scriptCode} language="typescript" />
            </div>
          </div>
        )}

        {/* VFX Screenshot */}
        {expandedNode === "vfx" && (
          <div className="flex flex-col items-center animate-slideDown">
            <button
              onClick={() => toggleDetail("vfx")}
              className={`screenshot-btn overflow-hidden rounded-lg border-2 transition-all duration-200 hover:border-skin-accent ${
                expandedDetail === "vfx"
                  ? "border-skin-accent"
                  : "border-skin-line"
              }`}
              aria-expanded={expandedDetail === "vfx"}
              aria-label="Toggle VFX decoder code"
            >
              <img
                src={`${ASSETS_PATH}/captures/vfx_decoder.png`}
                alt="VFX Decoder"
                className="max-w-[520px] md:max-w-[680px]"
              />
            </button>
            <span className="mt-2 text-xs text-skin-base/60">
              Click to view code
            </span>
          </div>
        )}
      </div>

      {/* Level 3: Code Details */}
      <div
        className={`level-3 overflow-hidden transition-all duration-300 ease-in-out ${
          expandedDetail ? "mt-4 max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {expandedDetail === "material" && (
          <div className="animate-slideDown mx-auto max-w-3xl rounded-lg border border-skin-line bg-skin-card p-4">
            <h4 className="mb-3 text-base font-semibold">
              Encoder Code Node (GLSL)
            </h4>
            <p className="mb-3 text-sm text-skin-base/70">
              Converts RGB → LAB color space and outputs position + color to render textures.
            </p>
            <CodeBlock code={encoderCode} language="glsl" />
          </div>
        )}

        {expandedDetail === "vfx" && (
          <div className="animate-slideDown mx-auto max-w-3xl rounded-lg border border-skin-line bg-skin-card p-4">
            <h4 className="mb-3 text-base font-semibold">
              Decoder Code Node (GLSL)
            </h4>
            <p className="mb-3 text-sm text-skin-base/70">
              Samples render textures to set particle position and color.
            </p>
            <CodeBlock code={decoderCode} language="glsl" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes dashSlide {
          from {
            stroke-dashoffset: 14;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        .screenshot-btn {
          cursor: pointer;
          background: none;
          padding: 0;
        }
        .screenshot-btn:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
        .animated-dash-cyan {
          animation: dashSlide 0.5s linear infinite;
        }
        .animated-dash-pink {
          animation: dashSlide 0.6s linear infinite;
        }
      `}</style>
    </div>
  );
}
