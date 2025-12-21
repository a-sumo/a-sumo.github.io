import { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";

const ASSETS_PATH = "/assets/visualizing-color-spaces-in-ar-glasses";

type ExpandedNode = "script" | "material" | null;
type ExpandedDetail = "script" | "material" | null;

interface WorkflowDiagramSimpleProps {
  scriptLabel?: string;
  materialLabel?: string;
  materialCapture: string;
  scriptCodeFile: string;
  materialCodeFile: string;
}

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
      {ports?.inputs && (
        <div className="input-ports absolute -left-[4px] flex flex-col z-10" style={{ gap: '8px' }}>
          <div className="w-[8px] h-[8px] rounded-full bg-[#07eaff]" title="input" />
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

      {ports?.outputs && (
        <div className="output-ports absolute -right-[4px] flex flex-col z-10" style={{ gap: '8px' }}>
          <div className="w-[8px] h-[8px] rounded-full bg-[#07eaff]" title="output" />
        </div>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col justify-center -mx-[4px]">
      <div className="h-[2px] w-10 bg-[#07eaff]" />
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
        className="absolute right-2 top-2 z-10 rounded bg-[#1a1a1a] px-2 py-1 text-xs opacity-70 transition-opacity hover:opacity-100 text-gray-300"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
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

export default function WorkflowDiagramSimple({
  scriptLabel = "Script",
  materialLabel = "Material",
  materialCapture,
  scriptCodeFile,
  materialCodeFile,
}: WorkflowDiagramSimpleProps) {
  const [expandedNode, setExpandedNode] = useState<ExpandedNode>(null);
  const [expandedDetail, setExpandedDetail] = useState<ExpandedDetail>(null);
  const [scriptCode, setScriptCode] = useState<string>("");
  const [materialCode, setMaterialCode] = useState<string>("");

  useEffect(() => {
    fetch(`${ASSETS_PATH}/scripts/${scriptCodeFile}`)
      .then(res => res.text())
      .then(setScriptCode)
      .catch(() => setScriptCode("// Failed to load script"));

    fetch(`${ASSETS_PATH}/scripts/${materialCodeFile}`)
      .then(res => res.text())
      .then(setMaterialCode)
      .catch(() => setMaterialCode("// Failed to load code"));
  }, [scriptCodeFile, materialCodeFile]);

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
    <div className="workflow-diagram-simple my-8">
      {/* Level 1: Icons with Connectors */}
      <div className="level-1 flex items-center justify-center">
        <NodeIcon
          icon="Script"
          label={scriptLabel}
          isExpanded={expandedNode === "script"}
          onClick={() => toggleNode("script")}
          ports={{ outputs: true }}
        />
        <Connector />
        <NodeIcon
          icon="Material"
          label={materialLabel}
          isExpanded={expandedNode === "material"}
          onClick={() => toggleNode("material")}
          ports={{ inputs: true }}
        />
      </div>

      {/* Level 2: Script code directly OR Material screenshot */}
      <div
        className={`level-2 overflow-hidden transition-all duration-300 ease-in-out ${
          expandedNode ? "mt-6 max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {/* Script: show code directly */}
        {expandedNode === "script" && (
          <div className="animate-slideDown mx-auto max-w-3xl rounded-lg border-2 border-black bg-skin-card p-4">
            <h4 className="mb-3 text-base font-semibold">
              {scriptLabel} (TypeScript)
            </h4>
            <CodeBlock code={scriptCode} language="typescript" />
          </div>
        )}

        {/* Material: show capture first */}
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
              aria-label="Toggle Material code"
            >
              <img
                src={`${ASSETS_PATH}/captures/${materialCapture}`}
                alt={materialLabel}
                className="max-w-[520px] md:max-w-[680px]"
              />
            </button>
            <span className="mt-2 text-xs text-skin-base/60">
              Click to view code
            </span>
          </div>
        )}
      </div>

      {/* Level 3: Material Code Details */}
      <div
        className={`level-3 overflow-hidden transition-all duration-300 ease-in-out ${
          expandedDetail === "material" ? "mt-4 max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {expandedDetail === "material" && (
          <div className="animate-slideDown mx-auto max-w-3xl rounded-lg border-2 border-black bg-skin-card p-4">
            <h4 className="mb-3 text-base font-semibold">
              {materialLabel} (GLSL)
            </h4>
            <CodeBlock code={materialCode} language="glsl" />
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
      `}</style>
    </div>
  );
}
