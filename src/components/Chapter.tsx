import { useState, type ReactNode } from "react";

interface ChapterProps {
  id?: string;
  number: number;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Chapter({ id, number, title, children, defaultOpen = true }: ChapterProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} style={{ margin: "40px 0", scrollMarginTop: "80px" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 0 16px 0",
          borderBottom: "2px solid rgb(40, 39, 40)",
          marginBottom: isOpen ? "24px" : "0",
          textAlign: "left",
        }}
      >
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          background: "rgb(40, 39, 40)",
          color: "rgb(255, 248, 222)",
          fontFamily: "Libertinus Sans, sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          borderRadius: "4px",
          flexShrink: 0,
        }}>
          {number}
        </span>
        <span style={{
          fontFamily: "Libertinus Sans, sans-serif",
          fontSize: "24px",
          fontWeight: 700,
          color: "rgb(40, 39, 40)",
          flex: 1,
        }}>
          {title}
        </span>
        <span style={{
          color: "rgb(140, 169, 255)",
          fontSize: "14px",
          transition: "transform 0.2s ease",
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
        }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ paddingLeft: "0" }}>
          {children}
        </div>
      )}
    </section>
  );
}
