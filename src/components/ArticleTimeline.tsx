import { useState, useEffect } from "react";

interface Section {
  id: string;
  label: string;
  type: "chapter" | "subsection" | "sidequest";
  parent?: string;
  preview?: string; // Optional preview image path
}

interface ArticleTimelineProps {
  sections: Section[];
}

export default function ArticleTimeline({ sections }: ArticleTimelineProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [smoothVelocity, setSmoothVelocity] = useState(0);
  const [blobPhase, setBlobPhase] = useState(0);
  const [frozenBlobPos, setFrozenBlobPos] = useState<{x: number, y: number} | null>(null);
  const lastScrollY = useState({ current: 0 })[0];

  // Smooth velocity interpolation - only animate phase when scrolling
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setSmoothVelocity(prev => prev + (scrollVelocity - prev) * 0.08);
      // Only increment phase when there's velocity (scrolling) - slower rate
      if (scrollVelocity > 0.01 || smoothVelocity > 0.01) {
        setBlobPhase(prev => prev + 0.015);
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [scrollVelocity, smoothVelocity]);

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);

      // Track scroll velocity
      const velocity = Math.abs(scrollTop - lastScrollY.current);
      lastScrollY.current = scrollTop;
      setScrollVelocity(Math.min(velocity / 15, 1)); // Normalize to 0-1
      setIsScrolling(true);

      // Reset scrolling state after scroll stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
      }, 200);

      // Show timeline after scrolling past 150px
      setIsVisible(scrollTop > 150);

      // Find active section - use tighter threshold to avoid anticipation
      let currentSection: string | null = null;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Section becomes active when it reaches top 15% of viewport
          if (rect.top <= window.innerHeight * 0.15) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Dispatch event to expand any collapsible Note with this ID
      window.dispatchEvent(new CustomEvent("expandNote", { detail: { noteId: id } }));
    }
  };

  // Separate main sections from sidequests (branches)
  const mainSections = sections.filter(s => s.type !== "sidequest");
  const sidequestSections = sections.filter(s => s.type === "sidequest");

  // Map parent IDs to their sidequest sections
  const sidequestsByParent = new Map<string, Section[]>();
  sidequestSections.forEach(sidequest => {
    if (sidequest.parent) {
      const existing = sidequestsByParent.get(sidequest.parent) || [];
      sidequestsByParent.set(sidequest.parent, [...existing, sidequest]);
    }
  });

  // Calculate max sidequests for any parent to determine spacing
  const maxSidequests = Math.max(0, ...Array.from(sidequestsByParent.values()).map(s => s.length));
  const sidequestSpacing = 24;
  const sidequestBranchPadding = maxSidequests > 0 ? maxSidequests * sidequestSpacing + 16 : 0;

  const getNodePosition = (index: number, sectionId: string) => {
    const baseHeight = 240;
    // Add extra spacing after sections that have sidequests
    let extraSpacing = 0;
    for (let i = 0; i < index; i++) {
      const section = mainSections[i];
      const sidequests = sidequestsByParent.get(section.id) || [];
      if (sidequests.length > 0) {
        extraSpacing += sidequests.length * sidequestSpacing + 20;
      }
    }
    return (index / (mainSections.length - 1)) * baseHeight + extraSpacing;
  };

  // Calculate total height based on all sidequests
  const totalHeight = 240 + Array.from(sidequestsByParent.values()).reduce(
    (acc, sidequests) => acc + (sidequests.length > 0 ? sidequests.length * sidequestSpacing + 20 : 0),
    0
  );

  return (
    <div
      style={{
        position: "fixed",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 40,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: isVisible ? "auto" : "none",
        display: "none", // Hidden by default (mobile)
      }}
      className="article-timeline"
    >
      <style>{`
        @media (min-width: 900px) {
          .article-timeline {
            display: block !important;
          }
        }
        @media (min-width: 900px) and (max-width: 1199px) {
          .article-timeline {
            transform: translateY(-50%) scale(0.8);
            left: 10px !important;
          }
        }
      `}</style>

      {/* Blob that follows the timeline path */}
      {(() => {
        const v = smoothVelocity;
        const p = blobPhase;
        // Subtle deformation - keep it blobby
        const deform1 = Math.sin(p * 0.4) * v * 0.8;
        const deform2 = Math.sin(p * 0.6 + 1) * v * 0.6;
        const deform3 = Math.cos(p * 0.3 + 2) * v * 0.5;
        const baseRadius = 9;

        // If collapsed, use frozen position
        if (isCollapsed && frozenBlobPos) {
          const floatY = 0;
          const floatX = 0;
          return (
            <button
              onClick={() => {
                setIsCollapsed(false);
                setFrozenBlobPos(null);
              }}
              style={{
                position: "absolute",
                top: `${frozenBlobPos.y - 14}px`,
                left: `${frozenBlobPos.x - 14}px`,
                width: "28px",
                height: "28px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                zIndex: 10,
              }}
              title="Show timeline"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" style={{ overflow: "visible" }}>
                <defs>
                  <radialGradient id="blobGradientStrokeStatic" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255, 120, 200, 0.8)" />
                    <stop offset="50%" stopColor="rgba(140, 100, 240, 0.6)" />
                    <stop offset="100%" stopColor="rgba(100, 180, 255, 0.4)" />
                  </radialGradient>
                </defs>
                <circle
                  cx="14"
                  cy="14"
                  r="8"
                  fill="none"
                  stroke="url(#blobGradientStrokeStatic)"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          );
        }

        // Blob follows scroll progress along the timeline path
        let blobX = 8; // Default: centered on main line
        let blobY = scrollProgress * totalHeight;

        // Check if we're in a sidequest section to potentially move to branch
        const activeSidequest = sidequestSections.find(s => s.id === activeSection);

        if (activeSidequest?.parent) {
          // Find where we are on the branch
          const parentIndex = mainSections.findIndex(s => s.id === activeSidequest.parent);
          if (parentIndex !== -1) {
            const parentY = getNodePosition(parentIndex, activeSidequest.parent);
            const sidequests = sidequestsByParent.get(activeSidequest.parent) || [];
            const sidequestIndex = sidequests.findIndex(s => s.id === activeSection);
            const branchX = 24;
            const firstNodeY = 18;
            const nodeTop = firstNodeY + sidequestIndex * sidequestSpacing;

            // Smoothly interpolate onto the branch based on how far into the sidequest we are
            // Use scroll position relative to this section
            const element = document.getElementById(activeSection);
            if (element) {
              const rect = element.getBoundingClientRect();
              const sectionProgress = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));

              // Interpolate position along curved path
              const targetNodeY = nodeTop;
              const curveLength = firstNodeY;

              if (targetNodeY <= curveLength) {
                // On curve portion - use quadratic bezier
                const curveT = Math.min(1, targetNodeY / curveLength);
                const bezX = 2 * (1 - curveT) * curveT * branchX + curveT * curveT * branchX;
                const bezY = curveT * curveT * curveLength;
                blobX = 8 + bezX;
                blobY = parentY + bezY;
              } else {
                // On straight portion
                blobX = 8 + branchX;
                blobY = parentY + targetNodeY;
              }
            }
          }
        }

        // Floating animation only when scrolling
        const floatY = v > 0.01 ? Math.sin(p * 0.5) * 2 * v : 0;
        const floatX = v > 0.01 ? Math.cos(p * 0.3) * 1.5 * v : 0;

        return (
          <button
            onClick={() => {
              if (!isCollapsed) {
                // Freeze position when collapsing
                setFrozenBlobPos({ x: blobX, y: blobY });
              }
              setIsCollapsed(!isCollapsed);
            }}
            style={{
              position: "absolute",
              top: `${blobY - 14}px`,
              left: `${blobX - 14}px`,
              width: "28px",
              height: "28px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              perspective: "100px",
              transition: "top 0.3s ease-out, left 0.3s ease-out",
              zIndex: 10,
            }}
            title="Hide timeline"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              style={{
                overflow: "visible",
                filter: isCollapsed ? "none" : "drop-shadow(0 3px 8px rgba(140, 100, 240, 0.4))",
                transform: isCollapsed
                  ? "translateZ(0) rotateX(0) rotateY(0)"
                  : `translateZ(8px) translateX(${floatX}px) translateY(${floatY}px) rotateX(${deform1 * 5}deg) rotateY(${deform2 * 8}deg)`,
                transformStyle: "preserve-3d",
                transition: isCollapsed ? "all 0.4s ease" : "none",
              }}
            >
              <defs>
                {/* Animated gradient - aurora green colors */}
                <radialGradient
                  id="blobGradient"
                  cx={`${50 + deform1 * 8}%`}
                  cy={`${50 + deform2 * 8}%`}
                  r="55%"
                >
                  <stop offset="0%" stopColor="rgba(150, 255, 200, 1)" />
                  <stop offset="25%" stopColor="rgba(100, 230, 180, 0.95)" />
                  <stop offset="50%" stopColor="rgba(80, 200, 220, 0.7)" />
                  <stop offset="75%" stopColor="rgba(100, 220, 200, 0.35)" />
                  <stop offset="100%" stopColor="rgba(120, 230, 210, 0)" />
                </radialGradient>
                <radialGradient id="blobGradientStroke" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(150, 255, 200, 0.8)" />
                  <stop offset="50%" stopColor="rgba(100, 230, 180, 0.6)" />
                  <stop offset="100%" stopColor="rgba(80, 200, 220, 0.4)" />
                </radialGradient>
                <filter id="goo">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 12 -5"
                    result="goo"
                  />
                </filter>
                <filter id="softGlow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {isCollapsed ? (
                <circle
                  cx="14"
                  cy="14"
                  r="8"
                  fill="none"
                  stroke="url(#blobGradientStroke)"
                  strokeWidth="1.5"
                  style={{ transition: "all 0.3s ease", filter: "url(#softGlow)" }}
                />
              ) : (
                <>
                  {/* Dark border ring for clickability hint */}
                  <circle
                    cx="14"
                    cy="14"
                    r={baseRadius + 2}
                    fill="none"
                    stroke="rgba(30, 30, 40, 0.3)"
                    strokeWidth="1"
                    style={{ transition: "all 0.2s ease" }}
                  />
                  {/* Main blob with subtle deformation and animated gradient */}
                  <ellipse
                    cx={14 + deform3 * 0.3}
                    cy={14 + deform1 * 0.2}
                    rx={baseRadius + deform1 * 0.5}
                    ry={baseRadius + deform2 * 0.4}
                    fill="url(#blobGradient)"
                    style={{
                      transformOrigin: "center",
                      transform: `rotate(${deform2 * 5}deg)`,
                    }}
                  />
                </>
              )}
            </svg>
          </button>
        );
      })()}

      <div
        style={{
          position: "relative",
          height: `${totalHeight}px`,
          width: "60px",
          opacity: isCollapsed ? 0 : 1,
          transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: isCollapsed ? "none" : "auto",
        }}
      >
        {/* Background line - centered at x=7 */}
        <div
          style={{
            position: "absolute",
            left: "7px",
            top: 0,
            width: "2px",
            height: "100%",
            background: "rgba(180, 160, 140, 0.4)",
            borderRadius: "1px",
          }}
        />

        {/* Progress line */}
        <div
          style={{
            position: "absolute",
            left: "7px",
            top: 0,
            width: "2px",
            height: `${scrollProgress * 100}%`,
            background: "rgb(140, 169, 255)",
            borderRadius: "1px",
            transition: "height 0.15s ease-out",
          }}
        />

        {/* Section nodes */}
        {mainSections.map((section, index) => {
          const isActive = activeSection === section.id;
          const isPast = sections.findIndex(s => s.id === activeSection) >= sections.findIndex(s => s.id === section.id);
          const isHovered = hoveredSection === section.id;
          const sidequests = sidequestsByParent.get(section.id) || [];
          const nodeY = getNodePosition(index, section.id);
          const nodeSize = section.type === "chapter" ? 14 : 10;

          return (
            <div
              key={section.id}
              style={{
                position: "absolute",
                top: nodeY,
                left: 0,
              }}
            >
              {/* Main node - centered on line (line is at x=8, so node left = 8 - nodeSize/2) */}
              <button
                onClick={() => scrollToSection(section.id)}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                style={{
                  position: "absolute",
                  left: `${8 - nodeSize / 2}px`,
                  top: `${-nodeSize / 2}px`,
                  width: `${nodeSize}px`,
                  height: `${nodeSize}px`,
                  borderRadius: "50%",
                  background: isActive ? "rgb(140, 169, 255)" : isPast ? "rgb(140, 169, 255)" : "rgb(200, 180, 160)",
                  border: "3px solid rgb(255, 250, 240)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 0 0 3px rgba(140, 169, 255, 0.3)" : "none",
                  transform: isHovered && !isActive ? "scale(1.2)" : "scale(1)",
                  padding: 0,
                  zIndex: 2,
                }}
                title={section.label}
              />

              {/* Tooltip on hover */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    left: "28px",
                    top: `${-nodeSize / 2}px`,
                    transform: section.preview ? "translateY(-30%)" : "translateY(0)",
                    background: "rgb(40, 39, 40)",
                    color: "rgb(255, 248, 222)",
                    padding: section.preview ? "8px" : "6px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    zIndex: 50,
                  }}
                >
                  {section.preview && (
                    <img
                      src={section.preview}
                      alt={section.label}
                      style={{
                        width: "140px",
                        height: "auto",
                        borderRadius: "4px",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    />
                  )}
                  {section.label}
                </div>
              )}

              {/* Sidequest branch - renders as a single connected branch with multiple nodes */}
              {sidequests.length > 0 && (() => {
                const branchX = 24; // x position of branch line
                const sqNodeSize = 8;
                const firstNodeY = 18; // Where first node appears
                const lastNodeY = firstNodeY + (sidequests.length - 1) * sidequestSpacing;

                // Calculate branch progress based on active sidequest
                const activeSidequestIndex = sidequests.findIndex(s => s.id === activeSection);
                const branchProgress = activeSidequestIndex >= 0
                  ? (activeSidequestIndex + 1) / sidequests.length
                  : 0;
                const progressY = firstNodeY + (activeSidequestIndex >= 0 ? activeSidequestIndex * sidequestSpacing : -firstNodeY);

                return (
                  <div
                    style={{
                      position: "absolute",
                      left: "8px",
                      top: "0px",
                    }}
                  >
                    {/* SVG for curve and vertical line */}
                    <svg
                      width="40"
                      height={lastNodeY + 10}
                      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
                    >
                      {/* Background curved arch */}
                      <path
                        d={`M 0 0 Q ${branchX} 0, ${branchX} ${firstNodeY}`}
                        fill="none"
                        stroke="rgba(180, 160, 140, 0.4)"
                        strokeWidth="2"
                      />
                      {/* Progress curved arch */}
                      {activeSidequestIndex >= 0 && (
                        <path
                          d={`M 0 0 Q ${branchX} 0, ${branchX} ${firstNodeY}`}
                          fill="none"
                          stroke="rgb(140, 169, 255)"
                          strokeWidth="2"
                        />
                      )}
                      {/* Background vertical line between nodes */}
                      {sidequests.length > 1 && (
                        <line
                          x1={branchX}
                          y1={firstNodeY}
                          x2={branchX}
                          y2={lastNodeY}
                          stroke="rgba(180, 160, 140, 0.4)"
                          strokeWidth="2"
                        />
                      )}
                      {/* Progress vertical line */}
                      {activeSidequestIndex >= 0 && sidequests.length > 1 && (
                        <line
                          x1={branchX}
                          y1={firstNodeY}
                          x2={branchX}
                          y2={Math.min(progressY, lastNodeY)}
                          stroke="rgb(140, 169, 255)"
                          strokeWidth="2"
                          style={{ transition: "all 0.15s ease-out" }}
                        />
                      )}
                    </svg>

                    {/* Sidequest nodes */}
                    {sidequests.map((sidequest, sidequestIndex) => {
                      const nodeTop = firstNodeY + sidequestIndex * sidequestSpacing;
                      const isSidequestActive = activeSection === sidequest.id;
                      const isSidequestPast = activeSidequestIndex >= 0 && sidequestIndex <= activeSidequestIndex;
                      const isSidequestHovered = hoveredSection === sidequest.id;
                      return (
                        <div key={sidequest.id}>
                          <button
                            onClick={() => scrollToSection(sidequest.id)}
                            onMouseEnter={() => setHoveredSection(sidequest.id)}
                            onMouseLeave={() => setHoveredSection(null)}
                            style={{
                              position: "absolute",
                              left: `${branchX - sqNodeSize / 2}px`,
                              top: `${nodeTop - sqNodeSize / 2}px`,
                              width: `${sqNodeSize}px`,
                              height: `${sqNodeSize}px`,
                              borderRadius: "2px",
                              background: isSidequestActive || isSidequestPast ? "rgb(140, 169, 255)" : "rgb(190, 170, 150)",
                              border: "2px solid rgb(255, 250, 240)",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              boxShadow: isSidequestActive ? "0 0 0 2px rgba(140, 169, 255, 0.4)" : "none",
                              transform: isSidequestHovered ? "scale(1.3)" : "scale(1)",
                              padding: 0,
                              zIndex: 2,
                            }}
                            title={sidequest.label}
                          />

                          {/* Sidequest tooltip */}
                          {isSidequestHovered && (
                            <div
                              style={{
                                position: "absolute",
                                left: `${branchX + sqNodeSize / 2 + 10}px`,
                                top: `${nodeTop - sqNodeSize / 2}px`,
                                transform: sidequest.preview ? "translateY(-30%)" : "translateY(0)",
                                background: "rgb(40, 39, 40)",
                                color: "rgb(200, 200, 200)",
                                padding: sidequest.preview ? "8px" : "5px 9px",
                                borderRadius: "5px",
                                fontSize: "10px",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                                zIndex: 50,
                              }}
                            >
                              {sidequest.preview && (
                                <img
                                  src={sidequest.preview}
                                  alt={sidequest.label}
                                  style={{
                                    width: "120px",
                                    height: "auto",
                                    borderRadius: "3px",
                                    marginBottom: "5px",
                                    display: "block",
                                  }}
                                />
                              )}
                              {sidequest.label}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
