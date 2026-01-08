import { useState, useEffect } from "react";

type MediaQuality = "low" | "medium" | "high";
const STORAGE_KEY = "media-quality";
const QUALITY_CHANGE_EVENT = "media-quality-change";

export function getStoredQuality(): MediaQuality {
  if (typeof window === "undefined") return "high";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "low") return "low";
  if (stored === "medium") return "medium";
  return "high";
}

export function setStoredQuality(quality: MediaQuality) {
  localStorage.setItem(STORAGE_KEY, quality);
  window.dispatchEvent(new CustomEvent(QUALITY_CHANGE_EVENT, { detail: quality }));
}

export function useMediaQuality() {
  const [quality, setQuality] = useState<MediaQuality>("high");

  useEffect(() => {
    setQuality(getStoredQuality());

    const handleChange = (e: Event) => {
      const customEvent = e as CustomEvent<MediaQuality>;
      setQuality(customEvent.detail);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setQuality((e.newValue as MediaQuality) || "high");
      }
    };

    window.addEventListener(QUALITY_CHANGE_EVENT, handleChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(QUALITY_CHANGE_EVENT, handleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return quality;
}

// Map of files that have medium versions
const HAS_MEDIUM: Record<string, boolean> = {
  // GIFs
  "videos/FieldContraction.gif": true,
  "videos/FieldExpansion.gif": true,
  "videos/FieldCirculation.gif": true,
  "videos/FieldVortex.gif": true,
  "videos/FieldWaves.gif": true,
  "videos/MagneticField.gif": true,
  "videos/TubeConstruction.gif": true,
  "videos/TubeDeformation.gif": true,
  "videos/NaiveOffset.gif": true,
  "videos/TNBFrame.gif": true,
  // MP4s
  "videos/VectorFieldPreview.mp4": true,
  "videos/contraction-demo.mp4": true,
  "videos/expansion-demo.mp4": true,
  "videos/circulation-demo.mp4": true,
  "videos/vortex-demo.mp4": true,
  "videos/waves-demo.mp4": true,
  "videos/magnetic-field-demo.mp4": true,
  "videos/TubeTestDemo.mp4": true,
  "videos/test-tube-recording.mp4": true,
  "videos/vector-field2-tube-mode-demo.mp4": true,
  "videos/settings-bg-demo-bg.mp4": true,
  "videos/contraction.mp4": true,
  "videos/expansion.mp4": true,
  "videos/circulation.mp4": true,
  "videos/vortex.mp4": true,
  "videos/waves.mp4": true,
  "videos/magnetic.mp4": true,
  "videos/field_source.mp4": true,
  "videos/field_saddle.mp4": true,
  "videos/field_double_vortex.mp4": true,
  // PNGs -> JPGs
  "captures/animated-sprite-sheet.png": true,
  "captures/transform-vector-hue-saturation.png": true,
  "captures/tube-deformation-material.png": true,
  "captures/vector-field-material.png": true,
  "captures/magnetic-field-material.png": true,
  "captures/magnet-pole-material.png": true,
  "sprites/circulation_sprite.png": true,
  "sprites/contraction_sprite.png": true,
  "sprites/expansion_sprite.png": true,
  "sprites/magnetic_sprite.png": true,
  "sprites/vortex_sprite.png": true,
  "sprites/waves_sprite.png": true,
  "sprites/circulation_preview.png": true,
  "sprites/contraction_preview.png": true,
  "sprites/expansion_preview.png": true,
  "sprites/magnetic_preview.png": true,
  "sprites/vortex_preview.png": true,
  "sprites/waves_preview.png": true,
};

const BASE_PATH = "/assets/visualizing-vector-fields-on-ar-glasses/";

export function getMediaPath(originalPath: string, quality: MediaQuality): string {
  if (quality === "high") return originalPath;
  if (!originalPath.includes(BASE_PATH)) return originalPath;

  const relativePath = originalPath.replace(BASE_PATH, "");

  if (quality === "low") {
    // In low quality, ALL videos become GIFs
    if (relativePath.endsWith(".mp4")) {
      return `${BASE_PATH}low/${relativePath.replace(".mp4", ".gif")}`;
    }
    // GIFs stay as GIFs but use low quality version
    if (relativePath.endsWith(".gif")) {
      return `${BASE_PATH}low/${relativePath}`;
    }
    // PNGs become JPGs in low quality
    if (relativePath.endsWith(".png")) {
      return `${BASE_PATH}low/${relativePath.replace(".png", ".jpg")}`;
    }
    return originalPath;
  }

  // Medium quality
  if (!HAS_MEDIUM[relativePath]) return originalPath;

  // PNGs become JPGs in medium quality
  if (relativePath.endsWith(".png")) {
    return `${BASE_PATH}medium/${relativePath.replace(".png", ".jpg")}`;
  }

  return `${BASE_PATH}medium/${relativePath}`;
}

const qualityLabels: Record<MediaQuality, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function MediaQualityToggle() {
  const quality = useMediaQuality();
  const qualities: MediaQuality[] = ["low", "medium", "high"];

  return (
    <div className="mq-toggle-container">
      <span className="mq-label">Media Quality</span>
      <div className="mq-track">
        {qualities.map((q) => (
          <button
            key={q}
            className={`mq-item ${quality === q ? "active" : ""}`}
            onClick={() => setStoredQuality(q)}
          >
            {qualityLabels[q]}
          </button>
        ))}
      </div>

      <style>{`
        .mq-toggle-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 8px 14px;
          margin: 16px auto;
          background: rgba(var(--color-fill), 0.8);
          border-radius: 10px;
          border: 1px solid rgba(40, 39, 40, 0.15);
          backdrop-filter: blur(8px);
          font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace;
          width: fit-content;
        }
        .mq-label {
          color: rgb(100, 100, 100);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .mq-track {
          display: flex;
          gap: 2px;
          background: rgba(40, 39, 40, 0.08);
          padding: 3px;
          border-radius: 8px;
        }
        .mq-item {
          padding: 6px 16px;
          border: none;
          background: transparent;
          color: rgb(80, 80, 80);
          cursor: pointer;
          border-radius: 6px;
          font-size: 12px;
          font-family: inherit;
          font-weight: 500;
          white-space: nowrap;
          letter-spacing: 0.01em;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mq-item:hover:not(.active) {
          background: rgba(100, 130, 220, 0.12);
          color: rgb(40, 39, 40);
        }
        .mq-item.active {
          background: rgb(100, 130, 220);
          color: white;
          box-shadow: 0 2px 8px rgba(100, 130, 220, 0.35);
        }
        @media (max-width: 480px) {
          .mq-toggle-container {
            padding: 6px 10px;
            gap: 8px;
          }
          .mq-label {
            font-size: 11px;
          }
          .mq-item {
            padding: 5px 12px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
