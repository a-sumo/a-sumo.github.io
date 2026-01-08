import { useState, useEffect, useRef } from "react";
import { useMediaQuality, getMediaPath } from "./MediaQualityToggle";

interface ManimVideoProps {
  src: string;
  codeSrc: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  maxWidth?: string;
  borderRadius?: string;
  noBorder?: boolean;
  preload?: "auto" | "metadata" | "none";
  caption?: string;
  figureId?: string;
  gif?: boolean;
}

export default function ManimVideo({
  src,
  codeSrc,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true,
  maxWidth = "100%",
  borderRadius = "12px",
  noBorder = false,
  preload = "none",
  caption,
  figureId,
  gif = false,
}: ManimVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const quality = useMediaQuality();
  const actualSrc = getMediaPath(src, quality);

  const copyToClipboard = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (gif) return;

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Only load video when it comes into view
            if (!hasLoaded) {
              video.load();
              setHasLoaded(true);
            }
            if (autoPlay) {
              video.play().catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading slightly before visible
        threshold: 0.1,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [autoPlay, gif, hasLoaded]);

  useEffect(() => {
    if (isCodeOpen && !code) {
      fetch(codeSrc)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load");
          return res.text();
        })
        .then(setCode)
        .catch(() => setError("Failed to load code"));
    }
  }, [isCodeOpen, codeSrc, code]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "16px 0" }}>
      <div
        style={{
          maxWidth,
          width: "100%",
          borderRadius: noBorder ? "0" : borderRadius,
          overflow: "hidden",
          boxShadow: noBorder ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
          background: "rgb(30, 30, 30)",
        }}
      >
        {/* Video or GIF */}
        {gif ? (
          <img
            src={actualSrc}
            alt={caption || "Animation"}
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              display: "block",
            }}
          />
        ) : (
          <video
            ref={videoRef}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            preload={preload}
            style={{
              width: "100%",
              display: "block",
            }}
          >
            <source src={actualSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Source Code Toggle Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: "rgb(40, 44, 52)",
            borderTop: "1px solid rgb(60, 64, 72)",
            cursor: "pointer",
          }}
          onClick={() => setIsCodeOpen(!isCodeOpen)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(140, 169, 255)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span
              style={{
                fontSize: "13px",
                color: "rgb(140, 169, 255)",
                fontFamily: "monospace",
              }}
            >
              Manim Source
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(140, 140, 140)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isCodeOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Collapsible Code Panel */}
        <div
          style={{
            maxHeight: isCodeOpen ? "400px" : "0",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}
        >
          <div
            style={{
              background: "rgb(40, 44, 52)",
              borderTop: "1px solid rgb(60, 64, 72)",
            }}
          >
            {/* Code Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "rgb(33, 37, 43)",
                borderBottom: "1px solid rgb(60, 64, 72)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "rgb(140, 140, 140)",
                  fontFamily: "monospace",
                }}
              >
                python
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: copied ? "rgb(72, 187, 120)" : "rgb(140, 140, 140)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                <img
                  src={copied ? "/assets/icons/check-icon.svg" : "/assets/icons/copy-icon.svg"}
                  alt={copied ? "Copied" : "Copy"}
                  style={{
                    width: "20px",
                    height: "20px",
                    filter: copied
                      ? "invert(48%) sepia(79%) saturate(2476%) hue-rotate(118deg) brightness(95%) contrast(80%)"
                      : "invert(70%)",
                  }}
                />
              </button>
            </div>

            {/* Code Content */}
            <pre
              style={{
                margin: 0,
                padding: "12px",
                overflow: "auto",
                maxHeight: "340px",
                fontSize: "12px",
                lineHeight: 1.5,
                fontFamily: "Roboto Mono, monospace",
              }}
            >
              <code style={{ color: "rgb(220, 220, 220)" }}>
                {error || code || "Loading..."}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Caption */}
      {caption && (
        <p
          style={{
            fontSize: "0.85em",
            color: "#888",
            textAlign: "center",
            fontStyle: "italic",
            marginTop: "8px",
            maxWidth,
          }}
        >
          {figureId && <span>{figureId}: </span>}
          {caption}
        </p>
      )}
    </div>
  );
}
