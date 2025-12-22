import { useState, useEffect } from "react";

interface CollapsibleCodeProps {
  src: string;
  trigger: string;
  language?: string;
}

export default function CollapsibleCode({ src, trigger, language = "glsl" }: CollapsibleCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !code) {
      fetch(src)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load");
          return res.text();
        })
        .then(setCode)
        .catch(() => setError("Failed to load code"));
    }
  }, [isOpen, src, code]);

  return (
    <span style={{ display: "inline" }}>
      <span
        onClick={() => setIsOpen(!isOpen)}
        style={{
          color: "rgb(140, 169, 255)",
          cursor: "pointer",
          textDecoration: "underline",
          textDecorationStyle: "dashed",
          textUnderlineOffset: "4px",
        }}
        title="Click to reveal code"
      >
        {trigger}
      </span>
      {isOpen && (
        <div style={{
          display: "block",
          marginTop: "12px",
          marginBottom: "12px",
          background: "rgb(40, 44, 52)",
          borderRadius: "8px",
          border: "1px solid rgb(60, 64, 72)",
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: "rgb(33, 37, 43)",
            borderBottom: "1px solid rgb(60, 64, 72)",
          }}>
            <span style={{
              fontSize: "11px",
              color: "rgb(140, 140, 140)",
              fontFamily: "monospace",
            }}>
              {language}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgb(140, 140, 140)",
                cursor: "pointer",
                fontSize: "12px",
                padding: "2px 6px",
              }}
            >
              ✕
            </button>
          </div>
          <pre style={{
            margin: 0,
            padding: "12px",
            overflow: "auto",
            maxHeight: "400px",
            fontSize: "12px",
            lineHeight: 1.5,
            fontFamily: "Roboto Mono, monospace",
          }}>
            <code style={{ color: "rgb(220, 220, 220)" }}>
              {error || code || "Loading..."}
            </code>
          </pre>
        </div>
      )}
    </span>
  );
}
