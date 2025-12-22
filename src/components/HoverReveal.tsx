import { useState } from "react";

interface HoverRevealProps {
  trigger: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth?: string;
}

export default function HoverReveal({ trigger, imageSrc, imageAlt, imageWidth = "200px" }: HoverRevealProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          color: "rgb(140, 169, 255)",
          cursor: "pointer",
          textDecoration: "underline",
          textDecorationStyle: "dashed",
          textUnderlineOffset: "4px",
        }}
      >
        {trigger}
      </span>
      {isHovered && (
        <span style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "8px",
          zIndex: 100,
          background: "white",
          padding: "8px",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgb(220, 220, 220)",
        }}>
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: imageWidth,
              display: "block",
              borderRadius: "4px",
            }}
          />
        </span>
      )}
    </span>
  );
}
