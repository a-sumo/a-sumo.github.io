import { useState, useMemo, useEffect, useRef } from "react";

interface ColorMixingChallengeProps {
  targetColor?: string;
}

type Difficulty = "story" | "challenge" | "god";

interface LeaderboardEntry {
  accuracy: number;
  time: number;
  difficulty: Difficulty;
  date: number;
}

interface Stats {
  totalAttempts: number;
  bestScores: {
    story: LeaderboardEntry | null;
    challenge: LeaderboardEntry | null;
    god: LeaderboardEntry | null;
  };
}

const STORAGE_KEY = "colorMixingStats";

function loadStats(): Stats {
  if (typeof window === "undefined") {
    return { totalAttempts: 0, bestScores: { story: null, challenge: null, god: null } };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { totalAttempts: 0, bestScores: { story: null, challenge: null, god: null } };
}

function saveStats(stats: Stats) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const centis = Math.floor((ms % 1000) / 10);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
  }
  return `${secs}.${centis.toString().padStart(2, "0")}s`;
}

interface Pigment {
  name: string;
  hex: string;
  category: string;
}

const PIGMENTS: Pigment[] = [
  // Whites
  { name: "Titanium White", hex: "#F5F5F5", category: "White" },
  { name: "Zinc White", hex: "#FAFAFA", category: "White" },
  { name: "Flake White", hex: "#F0EDE5", category: "White" },

  // Yellows
  { name: "Cadmium Yellow Light", hex: "#FFEC00", category: "Yellow" },
  { name: "Cadmium Yellow Medium", hex: "#FFD700", category: "Yellow" },
  { name: "Cadmium Yellow Deep", hex: "#F5B800", category: "Yellow" },
  { name: "Yellow Ochre", hex: "#CC8E35", category: "Yellow" },
  { name: "Naples Yellow", hex: "#FADA5E", category: "Yellow" },
  { name: "Indian Yellow", hex: "#E3A857", category: "Yellow" },
  { name: "Lemon Yellow", hex: "#FFF44F", category: "Yellow" },

  // Oranges
  { name: "Cadmium Orange", hex: "#ED872D", category: "Orange" },
  { name: "Transparent Orange", hex: "#FF6F00", category: "Orange" },

  // Reds
  { name: "Cadmium Red Light", hex: "#E3242B", category: "Red" },
  { name: "Cadmium Red Medium", hex: "#C41E3A", category: "Red" },
  { name: "Cadmium Red Deep", hex: "#A52A2A", category: "Red" },
  { name: "Alizarin Crimson", hex: "#E32636", category: "Red" },
  { name: "Venetian Red", hex: "#A42F2F", category: "Red" },
  { name: "Indian Red", hex: "#CD5C5C", category: "Red" },
  { name: "Burnt Sienna", hex: "#8A3324", category: "Red" },
  { name: "Quinacridone Rose", hex: "#E63E62", category: "Red" },

  // Violets/Purples
  { name: "Cobalt Violet", hex: "#8B5CF6", category: "Violet" },
  { name: "Dioxazine Purple", hex: "#5B21B6", category: "Violet" },
  { name: "Ultramarine Violet", hex: "#6B4C9A", category: "Violet" },
  { name: "Quinacridone Magenta", hex: "#C62F87", category: "Violet" },

  // Blues
  { name: "Ultramarine Blue", hex: "#3F00FF", category: "Blue" },
  { name: "Cobalt Blue", hex: "#0047AB", category: "Blue" },
  { name: "Cerulean Blue", hex: "#2A52BE", category: "Blue" },
  { name: "Phthalo Blue", hex: "#000F89", category: "Blue" },
  { name: "Prussian Blue", hex: "#003153", category: "Blue" },
  { name: "Indigo", hex: "#4B0082", category: "Blue" },
  { name: "Manganese Blue", hex: "#03A89E", category: "Blue" },

  // Greens
  { name: "Viridian", hex: "#40826D", category: "Green" },
  { name: "Phthalo Green", hex: "#123524", category: "Green" },
  { name: "Chromium Oxide Green", hex: "#4E7F50", category: "Green" },
  { name: "Terre Verte", hex: "#5E7F63", category: "Green" },
  { name: "Sap Green", hex: "#507D2A", category: "Green" },
  { name: "Cadmium Green", hex: "#006B3C", category: "Green" },

  // Browns
  { name: "Raw Umber", hex: "#6E5E40", category: "Brown" },
  { name: "Burnt Umber", hex: "#3D2314", category: "Brown" },
  { name: "Raw Sienna", hex: "#B87333", category: "Brown" },
  { name: "Van Dyke Brown", hex: "#3B2212", category: "Brown" },
  { name: "Transparent Brown Oxide", hex: "#6B4423", category: "Brown" },

  // Blacks
  { name: "Ivory Black", hex: "#1B1B1B", category: "Black" },
  { name: "Lamp Black", hex: "#0D0D0D", category: "Black" },
  { name: "Mars Black", hex: "#1C1C1C", category: "Black" },
  { name: "Payne's Gray", hex: "#40404F", category: "Black" },
];

interface PaletteSlot {
  pigment: Pigment | null;
  concentration: number;
}

// Color conversion utilities
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [255, 255, 255];
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let rr = r / 255, gg = g / 255, bb = b / 255;
  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

  let x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) * 100;
  let y = (rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750) * 100;
  let z = (rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041) * 100;

  x /= 95.047; y /= 100; z /= 108.883;
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
}

function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}

// Weighted subtractive color mixing
function mixColors(slots: PaletteSlot[]): [number, number, number] {
  const activeSlots = slots.filter(s => s.pigment !== null && s.concentration > 0);
  if (activeSlots.length === 0) return [255, 255, 255];

  const totalConcentration = activeSlots.reduce((sum, s) => sum + s.concentration, 0);
  if (totalConcentration === 0) return [255, 255, 255];

  let c = 0, m = 0, y = 0;

  activeSlots.forEach(slot => {
    const [r, g, b] = hexToRgb(slot.pigment!.hex);
    const weight = slot.concentration / totalConcentration;
    c += ((255 - r) / 255) * weight;
    m += ((255 - g) / 255) * weight;
    y += ((255 - b) / 255) * weight;
  });

  // Apply total concentration as opacity/strength
  const strength = Math.min(1, totalConcentration / 100);
  c *= strength;
  m *= strength;
  y *= strength;

  return [
    Math.round((1 - c) * 255),
    Math.round((1 - m) * 255),
    Math.round((1 - y) * 255)
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

const emptySlot: PaletteSlot = { pigment: null, concentration: 0 };

const DIFFICULTY_CONFIG = {
  story: {
    name: "Give Me Grace",
    description: "All pigments available",
    pigments: PIGMENTS,
  },
  challenge: {
    name: "Give Me Balance",
    description: "Limited palette",
    pigments: PIGMENTS.filter(p => [
      "Titanium White", "Ivory Black",
      "Cadmium Yellow Medium", "Yellow Ochre",
      "Cadmium Red Medium", "Alizarin Crimson", "Burnt Sienna",
      "Ultramarine Blue", "Cerulean Blue",
      "Viridian", "Sap Green",
      "Raw Umber", "Burnt Umber",
    ].includes(p.name)),
  },
  god: {
    name: "Give Me No Mercy!",
    description: "Primary colors only",
    pigments: PIGMENTS.filter(p => [
      "Titanium White", "Ivory Black",
      "Cadmium Yellow Medium",
      "Cadmium Red Medium",
      "Ultramarine Blue",
    ].includes(p.name)),
  },
};

function randomColor(): string {
  const h = Math.random() * 360;
  const s = 30 + Math.random() * 50; // 30-80% saturation
  const l = 25 + Math.random() * 40; // 25-65% lightness
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function ColorMixingChallenge({ targetColor: initialTarget = "#8B4513" }: ColorMixingChallengeProps) {
  const [target, setTarget] = useState(initialTarget);
  const [difficulty, setDifficulty] = useState<Difficulty>("story");
  const [palette, setPalette] = useState<PaletteSlot[]>([
    { ...emptySlot },
    { ...emptySlot },
    { ...emptySlot },
    { ...emptySlot },
    { ...emptySlot },
  ]);

  // Timer and stats state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [showStats, setShowStats] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{ accuracy: number; time: number; isNewBest: boolean } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect (millisecond accuracy)
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(t => t + 10);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const availablePigments = DIFFICULTY_CONFIG[difficulty].pigments;

  const mixedRgb = useMemo(() => mixColors(palette), [palette]);
  const mixedHex = rgbToHex(mixedRgb[0], mixedRgb[1], mixedRgb[2]);

  const targetRgb = hexToRgb(target);
  const targetLab = rgbToLab(targetRgb[0], targetRgb[1], targetRgb[2]);
  const mixedLab = rgbToLab(mixedRgb[0], mixedRgb[1], mixedRgb[2]);
  const de = deltaE(targetLab, mixedLab);

  // DeltaE scale: 0-1 imperceptible, 1-2 close observation, 2-10 noticeable, 10-50 similar
  const accuracy = Math.max(0, 100 - de);
  const isClose = de < 15;
  const isPerfect = de < 5;

  const startTimer = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setIsTimerRunning(true);
      setLastSubmission(null);
    }
  };

  const randomizeTarget = () => {
    setTarget(randomColor());
    setElapsedTime(0);
    setHasStarted(false);
    setIsTimerRunning(false);
    setLastSubmission(null);
  };

  const submitScore = () => {
    if (!hasStarted) return;

    setIsTimerRunning(false);

    const currentBest = stats.bestScores[difficulty];
    const isNewBest = !currentBest || accuracy > currentBest.accuracy ||
      (accuracy === currentBest.accuracy && elapsedTime < currentBest.time);

    const newStats: Stats = {
      totalAttempts: stats.totalAttempts + 1,
      bestScores: {
        ...stats.bestScores,
        ...(isNewBest ? {
          [difficulty]: {
            accuracy,
            time: elapsedTime,
            difficulty,
            date: Date.now(),
          }
        } : {})
      }
    };

    setStats(newStats);
    saveStats(newStats);
    setLastSubmission({ accuracy, time: elapsedTime, isNewBest });
  };

  const startNewRound = () => {
    setPalette([
      { ...emptySlot },
      { ...emptySlot },
      { ...emptySlot },
      { ...emptySlot },
      { ...emptySlot },
    ]);
    setTarget(randomColor());
    setElapsedTime(0);
    setHasStarted(false);
    setIsTimerRunning(false);
    setLastSubmission(null);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // Clear pigments that are no longer available
    const newAvailable = DIFFICULTY_CONFIG[newDifficulty].pigments;
    setPalette(palette.map(slot => {
      if (slot.pigment && !newAvailable.find(p => p.name === slot.pigment!.name)) {
        return { ...emptySlot };
      }
      return slot;
    }));
  };

  const handlePigmentChange = (index: number, pigmentName: string) => {
    startTimer();
    const pigment = availablePigments.find(p => p.name === pigmentName) || null;
    const newPalette = [...palette];
    newPalette[index] = {
      pigment,
      concentration: pigment && newPalette[index].concentration === 0 ? 20 : newPalette[index].concentration
    };
    setPalette(newPalette);
  };

  const handleConcentrationChange = (index: number, concentration: number) => {
    startTimer();
    const newPalette = [...palette];
    newPalette[index] = { ...newPalette[index], concentration };
    setPalette(newPalette);
  };

  const resetSlot = (index: number) => {
    const newPalette = [...palette];
    newPalette[index] = { ...emptySlot };
    setPalette(newPalette);
  };

  const resetAll = () => {
    setPalette([
      { ...emptySlot },
      { ...emptySlot },
      { ...emptySlot },
      { ...emptySlot },
      { ...emptySlot },
    ]);
  };

  const titleFont = "Libertinus Sans, sans-serif";

  return (
    <div style={{
      background: "rgb(35, 35, 40)",
      border: "2px solid rgb(60, 60, 70)",
      borderRadius: "12px",
      padding: isCollapsed ? "16px 24px" : "24px",
      margin: "24px 0",
      fontFamily: titleFont,
      color: "rgb(240, 240, 240)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: isCollapsed ? 0 : "16px",
      }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 700,
            color: "rgb(255, 200, 100)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: titleFont,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          <span style={{
            color: "rgb(255, 200, 100)",
            fontSize: "10px",
            transition: "transform 0.2s ease",
            display: "inline-block",
            transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
          }}>▼</span>
          Color Mixing Challenge
        </button>
        {!isCollapsed && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* Timer */}
            <div style={{
              background: hasStarted ? "rgb(100, 140, 255)" : "rgb(200, 200, 200)",
              color: "white",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              minWidth: "80px",
              textAlign: "center",
              fontFamily: "monospace",
            }}>
              {formatTime(elapsedTime)}
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              style={{
                background: showStats ? "rgb(100, 140, 255)" : "white",
                color: showStats ? "white" : "rgb(60, 60, 60)",
                border: "1px solid rgb(180, 180, 180)",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: titleFont,
              }}
              title="View stats"
            >
              Stats
            </button>
          </div>
        )}
      </div>

      {isCollapsed ? null : (
        <>

      {/* Difficulty Selector */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "20px",
        justifyContent: "center",
      }}>
        {(["story", "challenge", "god"] as Difficulty[]).map((d) => {
          const borderColors = {
            story: "rgb(72, 187, 120)",      // green
            challenge: "rgb(236, 201, 75)",  // yellow
            god: "rgb(180, 50, 50)",         // deep red
          };
          const isSelected = difficulty === d;
          return (
            <button
              key={d}
              onClick={() => handleDifficultyChange(d)}
              style={{
                background: isSelected ? "rgb(55, 55, 60)" : "rgb(45, 45, 50)",
                color: isSelected ? "rgb(255, 255, 255)" : "rgb(150, 150, 150)",
                border: isSelected ? `2px solid ${borderColors[d]}` : "2px solid rgb(60, 60, 65)",
                borderRadius: "6px",
                padding: "10px 14px",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "center",
                fontFamily: titleFont,
                textTransform: "uppercase",
              }}
            >
              <div style={{ fontWeight: 700 }}>{DIFFICULTY_CONFIG[d].name}</div>
              <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "2px", fontWeight: 500, textTransform: "none" }}>
                {DIFFICULTY_CONFIG[d].pigments.length} pigments
              </div>
            </button>
          );
        })}
      </div>

      {/* Stats Panel - Compact */}
      {showStats && (
        <div style={{
          background: "rgb(45, 45, 50)",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "16px",
          border: "1px solid rgb(70, 70, 80)",
          fontSize: "13px",
        }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "rgb(180, 180, 180)" }}>
              Attempts: <strong style={{ color: "rgb(255, 200, 100)" }}>{stats.totalAttempts}</strong>
            </span>
            {(["story", "challenge", "god"] as Difficulty[]).map((d) => {
              const best = stats.bestScores[d];
              return (
                <span key={d} style={{ color: "rgb(180, 180, 180)" }}>
                  {d === "story" ? "Grace" : d === "challenge" ? "Balance" : "No Mercy"}:{" "}
                  {best ? (
                    <strong style={{ color: "rgb(255, 200, 100)" }}>
                      {best.accuracy.toFixed(0)}% / {formatTime(best.time)}
                    </strong>
                  ) : (
                    <span style={{ color: "rgb(100, 100, 100)" }}>—</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Comparison */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "24px",
      }}>
        {/* Target Color */}
        <div>
          <div style={{ fontSize: "14px", color: "rgb(180, 180, 180)", marginBottom: "8px", fontWeight: 500, height: "32px", display: "flex", alignItems: "center" }}>
            Target Color
          </div>
          <div style={{
            width: "100%",
            height: "80px",
            borderRadius: "8px",
            background: target,
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
            <span style={{ fontSize: "13px", color: "rgb(150, 150, 150)" }}>
              {target.toUpperCase()}
            </span>
            <button
              onClick={(e) => {
                const btn = e.currentTarget;
                btn.style.transform = "scale(0.9)";
                setTimeout(() => {
                  btn.style.transform = "scale(1)";
                }, 150);
                randomizeTarget();
              }}
              style={{
                background: "rgb(50, 50, 55)",
                border: "1px solid rgb(80, 80, 90)",
                borderRadius: "8px",
                cursor: "pointer",
                padding: "8px",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgb(60, 60, 65)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgb(50, 50, 55)";
              }}
              title="Randomize target color (resets timer)"
            >
              <img
                src="/assets/visualizing-color-spaces-in-ar-glasses/icons/random_item_mk.png"
                alt="Randomize"
                style={{ width: "20px", height: "20px", objectFit: "contain" }}
              />
            </button>
          </div>
        </div>

        {/* Your Mix */}
        <div>
          <div style={{ fontSize: "14px", color: "rgb(180, 180, 180)", marginBottom: "8px", fontWeight: 500, height: "32px", display: "flex", alignItems: "center" }}>
            Your Mix
          </div>
          <div style={{
            width: "100%",
            height: "80px",
            borderRadius: "8px",
            background: mixedHex,
            border: `2px solid ${isPerfect ? "rgb(72, 187, 120)" : isClose ? "rgb(236, 201, 75)" : "rgba(255,255,255,0.2)"}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: "border-color 0.3s ease",
          }} />
          <div style={{ fontSize: "13px", color: "rgb(150, 150, 150)", marginTop: "8px", textAlign: "center" }}>
            {mixedHex.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Palette Slots */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "rgb(180, 180, 180)", marginBottom: "12px", fontWeight: 500 }}>
          Palette Slots
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          {palette.map((slot, index) => (
            <div key={index} style={{
              background: "rgb(45, 45, 50)",
              borderRadius: "8px",
              padding: "10px 12px",
              border: "1px solid rgb(70, 70, 80)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              {/* Color swatch */}
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: slot.pigment?.hex || "#f5f5f5",
                border: "1px solid rgba(0,0,0,0.1)",
                flexShrink: 0,
              }} />

              {/* Pigment select */}
              <select
                value={slot.pigment?.name || ""}
                onChange={(e) => handlePigmentChange(index, e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "8px 10px",
                  fontSize: "13px",
                  border: "1px solid rgb(70, 70, 80)",
                  borderRadius: "4px",
                  background: "rgb(55, 55, 60)",
                  color: slot.pigment ? "rgb(240, 240, 240)" : "rgb(120, 120, 120)",
                  cursor: "pointer",
                }}
              >
                <option value="">Select pigment...</option>
                {["White", "Yellow", "Orange", "Red", "Violet", "Blue", "Green", "Brown", "Black"]
                  .filter(category => availablePigments.some(p => p.category === category))
                  .map(category => (
                  <optgroup key={category} label={category}>
                    {availablePigments.filter(p => p.category === category).map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Concentration slider */}
              <div style={{ width: "90px", flexShrink: 0 }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slot.concentration}
                  onChange={(e) => handleConcentrationChange(index, parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    height: "5px",
                    borderRadius: "2px",
                    background: `linear-gradient(to right, rgb(255, 180, 50) ${slot.concentration}%, rgb(70, 70, 80) ${slot.concentration}%)`,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                />
                <div style={{
                  fontSize: "11px",
                  color: "rgb(150, 150, 150)",
                  textAlign: "center",
                  marginTop: "2px",
                }}>
                  {slot.concentration}%
                </div>
              </div>

              {/* Clear button */}
              <button
                onClick={() => resetSlot(index)}
                style={{
                  fontSize: "12px",
                  color: "rgb(180, 180, 180)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  lineHeight: 1,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "rgb(100, 100, 100)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgb(180, 180, 180)"}
                title="Clear slot"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Score */}
      <div style={{
        background: "rgb(45, 45, 50)",
        borderRadius: "8px",
        padding: "16px",
        border: "1px solid rgb(70, 70, 80)",
        textAlign: "center",
      }}>
        {lastSubmission ? (
          <>
            <div style={{
              fontSize: "15px",
              fontWeight: 600,
              color: lastSubmission.isNewBest ? "rgb(72, 187, 120)" : "rgb(255, 200, 100)",
              marginBottom: "8px",
            }}>
              {lastSubmission.isNewBest ? "New Personal Best!" : "Score Submitted!"}
            </div>
            <div style={{ fontSize: "14px", marginBottom: "12px" }}>
              <span style={{ color: "rgb(180, 180, 180)" }}>
                {lastSubmission.accuracy.toFixed(0)}% in {formatTime(lastSubmission.time)}
              </span>
            </div>
            <button
              onClick={startNewRound}
              style={{
                background: "rgb(255, 180, 50)",
                color: "rgb(30, 30, 30)",
                border: "2px solid transparent",
                borderRadius: "6px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: titleFont,
              }}
            >
              New Round
            </button>
          </>
        ) : (
          <>
            <div style={{
              fontSize: "15px",
              fontWeight: 600,
              color: isPerfect ? "rgb(72, 187, 120)" : isClose ? "rgb(255, 200, 100)" : "rgb(150, 150, 150)",
              marginBottom: "8px",
            }}>
              {isPerfect ? "Perfect Match!" : isClose ? "Very Close!" : "Keep Mixing..."}
            </div>
            <div style={{ fontSize: "14px", marginBottom: "12px" }}>
              <span style={{ color: "rgb(150, 150, 150)" }}>Accuracy: </span>
              <span style={{ color: "rgb(255, 200, 100)", fontWeight: 600 }}>{accuracy.toFixed(0)}%</span>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button
                onClick={submitScore}
                disabled={!hasStarted}
                style={{
                  background: hasStarted ? "rgb(255, 180, 50)" : "rgb(80, 80, 90)",
                  color: hasStarted ? "rgb(30, 30, 30)" : "rgb(120, 120, 120)",
                  border: "2px solid transparent",
                  borderRadius: "6px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: hasStarted ? "pointer" : "not-allowed",
                  fontFamily: titleFont,
                }}
              >
                Submit Score
              </button>
              <button
                onClick={startNewRound}
                style={{
                  background: "rgb(55, 55, 60)",
                  color: "rgb(200, 200, 200)",
                  border: "2px solid rgb(80, 80, 90)",
                  borderRadius: "6px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: titleFont,
                }}
                title="Start fresh with a new target color"
              >
                New Color
              </button>
            </div>
          </>
        )}
      </div>
      </>
      )}
    </div>
  );
}
