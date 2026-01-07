import type { ReactNode } from "react";

interface NoteProps {
  type?: "note" | "tip" | "important" | "warning";
  title?: string;
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

export default function Note({ type = "note", title, children }: NoteProps) {
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
        style={{
          marginBottom: "8px",
          fontFamily: "Roboto, sans-serif",
          fontWeight: 500,
          fontSize: "12px",
          color: config.accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        {displayTitle}
      </div>
      <div
        style={{
          fontSize: "13px",
          lineHeight: 1.55,
          color: "rgb(170, 170, 170)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
