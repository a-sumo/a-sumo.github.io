import { useState, type ReactNode } from "react";

interface NoteProps {
  type?: "note" | "tip" | "important" | "warning";
  title?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

const typeConfig = {
  note: {
    defaultTitle: "Note",
    borderColor: "rgb(80, 100, 140)",
    bgColor: "rgba(80, 100, 140, 0.06)",
    accentColor: "rgb(120, 140, 180)",
  },
  tip: {
    defaultTitle: "Tip",
    borderColor: "rgb(72, 150, 100)",
    bgColor: "rgba(72, 150, 100, 0.06)",
    accentColor: "rgb(72, 150, 100)",
  },
  important: {
    defaultTitle: "Important",
    borderColor: "rgb(180, 140, 80)",
    bgColor: "rgba(180, 140, 80, 0.06)",
    accentColor: "rgb(180, 150, 100)",
  },
  warning: {
    defaultTitle: "Warning",
    borderColor: "rgb(180, 80, 80)",
    bgColor: "rgba(180, 80, 80, 0.06)",
    accentColor: "rgb(180, 100, 100)",
  },
};

export default function Note({ type = "note", title, collapsible = false, defaultOpen = false, children }: NoteProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = typeConfig[type];
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      style={{
        margin: "20px 0",
        padding: "12px 16px",
        borderLeft: `3px solid ${config.borderColor}`,
        background: config.bgColor,
        borderRadius: "0 6px 6px 0",
      }}
    >
      <div
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
        style={{
          marginBottom: collapsible && !isOpen ? "0" : "8px",
          fontFamily: "Roboto, sans-serif",
          fontWeight: 500,
          fontSize: "12px",
          color: config.accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          cursor: collapsible ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          userSelect: collapsible ? "none" : "auto",
        }}
      >
        {collapsible && (
          <span
            style={{
              display: "inline-block",
              transition: "transform 0.2s ease",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              fontSize: "10px",
            }}
          >
            ▶
          </span>
        )}
        {displayTitle}
      </div>
      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.55,
          color: "rgb(170, 170, 170)",
          display: collapsible && !isOpen ? "none" : "block",
        }}
      >
        {children}
      </div>
    </div>
  );
}
