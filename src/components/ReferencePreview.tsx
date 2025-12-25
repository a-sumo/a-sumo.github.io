import { useState } from "react";

interface ReferencePreviewProps {
  trigger: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth?: string;
  refNumber?: number;
}

export default function ReferencePreview({
  trigger,
  href,
  imageSrc,
  imageAlt,
  imageWidth = "320px",
  refNumber,
}: ReferencePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          color: "rgb(140, 169, 255)",
          cursor: "pointer",
          textDecoration: "underline",
          textDecorationStyle: "dashed",
          textUnderlineOffset: "4px",
        }}
      >
        {trigger}
        {refNumber && (
          <sup
            style={{
              fontSize: "0.7em",
              marginLeft: "2px",
              fontWeight: "bold",
            }}
          >
            [{refNumber}]
          </sup>
        )}
      </span>

      {/* Hover preview */}
      {isHovered && !isExpanded && (
        <span
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            zIndex: 9999,
            background: "white",
            padding: "12px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            border: "1px solid rgb(220, 220, 220)",
            whiteSpace: "nowrap",
          }}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              width: imageWidth,
              maxWidth: "none",
              display: "block",
              borderRadius: "8px",
            }}
          />
          <span
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "8px",
              fontSize: "12px",
              color: "rgb(100, 100, 100)",
            }}
          >
            Click to expand
          </span>
        </span>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div
          style={{
            display: "block",
            margin: "16px 0",
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: "1px solid rgb(220, 220, 220)",
          }}
        >
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block" }}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              style={{
                width: "100%",
                maxWidth: "500px",
                display: "block",
                borderRadius: "8px",
                margin: "0 auto",
                cursor: "pointer",
              }}
            />
          </a>
          <div
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "14px",
            }}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgb(140, 169, 255)",
                textDecoration: "underline",
              }}
            >
              {imageAlt} →
            </a>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              style={{
                marginLeft: "16px",
                padding: "4px 12px",
                fontSize: "12px",
                background: "rgb(240, 240, 240)",
                border: "1px solid rgb(200, 200, 200)",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </span>
  );
}
