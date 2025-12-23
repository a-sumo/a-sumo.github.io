import { useState, useRef } from "react";

interface CollapsibleVideoProps {
  src: string;
  trigger: string;
  preText?: string;
  postText?: string;
  description?: string;
}

export default function CollapsibleVideo({ src, trigger, preText = "", postText = "", description }: CollapsibleVideoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Small delay to let the video element render
      setTimeout(() => {
        if (videoRef.current && !hasPlayed) {
          videoRef.current.play();
          setHasPlayed(true);
        }
      }, 100);
    } else {
      setIsOpen(false);
    }
  };

  const handleVideoEnd = () => {
    // Optionally collapse after playing
    // setIsOpen(false);
  };

  return (
    <span style={{ display: "inline" }}>
      {preText}
      <span
        onClick={handleToggle}
        style={{
          color: "rgb(140, 169, 255)",
          cursor: "pointer",
          textDecoration: "underline",
          textDecorationStyle: "dashed",
          textUnderlineOffset: "4px",
        }}
        title="Click to reveal"
      >
        {trigger}
      </span>
      {postText}
      {isOpen && (
        <span style={{ display: "block", marginTop: "12px", marginBottom: "12px", textAlign: "center" }}>
          <video
            ref={videoRef}
            src={src}
            onEnded={handleVideoEnd}
            controls
            muted
            playsInline
            style={{
              display: "block",
              maxWidth: "300px",
              margin: "0 auto",
              borderRadius: "8px",
              border: "1px solid rgb(220, 220, 220)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          {description && (
            <span style={{
              display: "block",
              fontSize: "11px",
              color: "rgb(140, 140, 140)",
              marginTop: "4px",
              fontStyle: "italic",
            }}>
              {description}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
