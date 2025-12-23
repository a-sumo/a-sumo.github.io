import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";

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
      {/* Input ports */}
      {ports?.inputs && (
        <div className="input-ports absolute -left-[4px] flex flex-col z-10" style={{ gap: '8px' }}>
          <div className="w-[8px] h-[8px] rounded-full bg-[#07eaff]" title="positionRenderTarget" />
          <div className="w-[8px] h-[8px] rounded-full bg-[#ff89e6]" title="colorRenderTarget" />
        </div>
      )}

      <button
        onClick={onClick}
        className="workflow-node flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer rounded-lg border w-[120px] h-[130px] md:w-[140px] md:h-[150px]"
        style={{
          background: '#fafafa',
          borderColor: isExpanded ? '#8CA9FF' : '#e0e0e0',
          boxShadow: isExpanded ? '0 2px 8px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)',
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.borderColor = '#8CA9FF';
            e.currentTarget.style.background = '#f5f5f5';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.borderColor = '#e0e0e0';
            e.currentTarget.style.background = '#fafafa';
          }
        }}
        aria-expanded={isExpanded}
      >
        <img
          src={`${ASSETS_PATH}/icons/${icon}.png`}
          alt={label}
          className="h-14 w-14 md:h-16 md:w-16"
          style={{ border: 'none' }}
        />
        <span className="mt-2 text-[11px] md:text-xs font-medium text-center leading-tight text-gray-700">{label}</span>
        <span className="text-[9px] mt-1 text-gray-400">click</span>
      </button>

      {/* Output ports */}
      {ports?.outputs && (
        <div className="output-ports absolute -right-[4px] flex flex-col z-10" style={{ gap: '8px' }}>
          <div className="w-[8px] h-[8px] rounded-full bg-[#07eaff]" title="positionRenderTarget" />
          <div className="w-[8px] h-[8px] rounded-full bg-[#ff89e6]" title="colorRenderTarget" />
        </div>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col justify-center -mx-[4px]" style={{ gap: '15px' }}>
      <div className="h-[2px] w-10 bg-[#07eaff]" />
      <div className="h-[2px] w-10 bg-[#ff89e6]" />
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map language names to prism language keys
  const langMap: Record<string, string> = {
    glsl: "c",
    typescript: "typescript",
    ts: "typescript",
    javascript: "javascript",
    js: "javascript",
  };
  const prismLang = langMap[language] || language;

  return (
    <div className="code-block relative">
      <button
        onClick={copyToClipboard}
        className="absolute right-2 top-2 z-10 rounded bg-[#1a1a1a] p-2 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Copy code"
      >
        <img
          src={copied ? "/assets/icons/check-icon.svg" : "/assets/icons/copy-icon.svg"}
          alt={copied ? "Copied" : "Copy"}
          style={{
            width: "28px",
            height: "28px",
            filter: copied
              ? "invert(48%) sepia(79%) saturate(2476%) hue-rotate(118deg) brightness(95%) contrast(80%)"
              : "invert(70%)"
          }}
        />
      </button>
      <Highlight theme={themes.vsDark} code={code.trim()} language={prismLang}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="max-h-[400px] overflow-auto rounded-lg p-4 text-xs leading-relaxed md:text-sm"
            style={{ ...style, margin: 0 }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
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
      {/* Level 1: Icons with Connectors */}
      <div className="level-1 flex items-center justify-center">
        <NodeIcon
          icon="Material"
          label="Encoder Material"
          isExpanded={expandedNode === "material"}
          onClick={() => toggleNode("material")}
          ports={{ outputs: true }}
        />
        <Connector />
        <NodeIcon
          icon="Script"
          label="Encoder Script"
          isExpanded={expandedNode === "script"}
          onClick={() => toggleNode("script")}
          ports={{ inputs: true, outputs: true }}
        />
        <Connector />
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
              className="screenshot-btn rounded-lg border-2 transition-all duration-200"
              style={{
                borderColor: expandedDetail === "material" ? '#8CA9FF' : '#000',
                padding: '12px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8CA9FF'}
              onMouseLeave={(e) => { if (expandedDetail !== "material") e.currentTarget.style.borderColor = '#000'; }}
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
            <div className="mx-auto max-w-3xl rounded-lg border-2 border-black bg-skin-card p-4">
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
              className="screenshot-btn rounded-lg border-2 transition-all duration-200"
              style={{
                borderColor: expandedDetail === "vfx" ? '#8CA9FF' : '#000',
                padding: '12px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8CA9FF'}
              onMouseLeave={(e) => { if (expandedDetail !== "vfx") e.currentTarget.style.borderColor = '#000'; }}
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
          <div className="animate-slideDown mx-auto max-w-3xl rounded-lg border-2 border-black bg-skin-card p-4">
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
          <div className="animate-slideDown mx-auto max-w-3xl rounded-lg border-2 border-black bg-skin-card p-4">
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
        }
        .screenshot-btn:focus {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
        .animate-dash {
          animation: dashFlow 1s linear infinite;
        }
        @keyframes dashFlow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
