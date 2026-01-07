import { useState, useEffect, useCallback } from "react";

interface ExpandableImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export default function ExpandableImage({ src, alt, caption }: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isExpanded, handleClose]);

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => setIsExpanded(true)}
        style={{
          cursor: "zoom-in",
          position: "relative",
        }}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            borderRadius: "8px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {/* Zoom hint icon */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            right: "8px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "4px",
            padding: "4px 6px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.8)",
            pointerEvents: "none",
          }}
        >
          Click to expand
        </div>
      </div>

      {/* Expanded modal with backdrop blur */}
      {isExpanded && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            cursor: "zoom-out",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              animation: "scaleIn 0.2s ease",
            }}
          >
            <img
              src={src}
              alt={alt}
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "8px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              }}
            />
            {caption && (
              <p
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.8)",
                  marginTop: "12px",
                  fontSize: "0.9em",
                }}
              >
                {caption}
              </p>
            )}
          </div>
          {/* Close hint */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
            }}
          >
            Press ESC or click to close
          </div>
        </div>
      )}
    </>
  );
}
