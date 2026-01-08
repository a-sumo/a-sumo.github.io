import { useEffect, useRef, useState } from "react";
import { useMediaQuality, getMediaPath } from "./MediaQualityToggle";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  maxWidth?: string;
  borderRadius?: string;
  noBorder?: boolean;
  preload?: "auto" | "metadata" | "none";
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true,
  maxWidth = "300px",
  borderRadius = "12px",
  noBorder = false,
  preload = "none",
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const quality = useMediaQuality();
  const actualSrc = getMediaPath(src, quality);
  const isGif = actualSrc.endsWith(".gif");

  useEffect(() => {
    if (isGif) return;

    const video = videoRef.current;
    if (!video) return;

    // IntersectionObserver for lazy loading and auto-play/pause
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
  }, [autoPlay, hasLoaded, isGif]);

  const sharedStyles = {
    maxWidth,
    width: "100%",
    borderRadius: noBorder ? "0" : borderRadius,
    boxShadow: noBorder ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {isGif ? (
        <img
          src={actualSrc}
          alt="Animation"
          loading="lazy"
          decoding="async"
          className={className}
          style={sharedStyles}
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
          poster={poster}
          className={className}
          style={sharedStyles}
        >
          <source src={actualSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
