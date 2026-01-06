import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  src: string;
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
  autoPlay = false,
  loop = true,
  muted = true,
  controls = true,
  maxWidth = "300px",
  borderRadius = "12px",
  noBorder = false,
  preload = "metadata",
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force load the video source (helps with View Transitions)
    video.load();

    // IntersectionObserver for lazy loading and auto-play/pause
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (autoPlay) {
              video.play().catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [autoPlay]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <video
        ref={videoRef}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        preload={preload}
        className={className}
        style={{
          maxWidth,
          width: "100%",
          borderRadius: noBorder ? "0" : borderRadius,
          boxShadow: noBorder ? "none" : "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
