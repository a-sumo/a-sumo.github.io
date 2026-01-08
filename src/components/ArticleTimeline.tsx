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
  const lastScrollY = useState({ current: 0 })[0];

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
      setScrollVelocity(Math.min(velocity / 10, 1)); // Normalize to 0-1
      setIsScrolling(true);

      // Reset scrolling state after scroll stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
      }, 150);

      // Show timeline after scrolling past 150px
      setIsVisible(scrollTop > 150);

      // Find active section
      let currentSection: string | null = null;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
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
        @media (min-width: 1200px) {
          .article-timeline {
            display: block !important;
          }
        }
      `}</style>

      {/* Blob toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: "absolute",
          top: "-28px",
          left: "-2px",
          width: "20px",
          height: "20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        title={isCollapsed ? "Show timeline" : "Hide timeline"}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          style={{
            overflow: "visible",
            filter: isCollapsed ? "none" : "url(#goo)",
          }}
        >
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(140, 169, 255)" />
              <stop offset="50%" stopColor="rgb(180, 140, 255)" />
              <stop offset="100%" stopColor="rgb(255, 140, 200)" />
            </linearGradient>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                result="goo"
              />
            </filter>
          </defs>
          {isCollapsed ? (
            <circle
              cx="10"
              cy="10"
              r="6"
              fill="none"
              stroke="url(#blobGradient)"
              strokeWidth="1.5"
              style={{ transition: "all 0.3s ease" }}
            />
          ) : (
            <>
              <ellipse
                cx="10"
                cy="10"
                rx={6 + scrollVelocity * 2}
                ry={6 - scrollVelocity * 1.5}
                fill="url(#blobGradient)"
                style={{
                  transition: isScrolling ? "none" : "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transformOrigin: "center",
                  transform: `rotate(${scrollVelocity * 15}deg)`,
                }}
              />
              {isScrolling && (
                <>
                  <circle
                    cx={10 + scrollVelocity * 4}
                    cy={10 - scrollVelocity * 3}
                    r={2 + scrollVelocity}
                    fill="url(#blobGradient)"
                    style={{ opacity: scrollVelocity }}
                  />
                  <circle
                    cx={10 - scrollVelocity * 3}
                    cy={10 + scrollVelocity * 4}
                    r={1.5 + scrollVelocity * 0.5}
                    fill="url(#blobGradient)"
                    style={{ opacity: scrollVelocity * 0.7 }}
                  />
                </>
              )}
            </>
          )}
        </svg>
      </button>

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
                      {/* Curved arch from main line (0,0) to first node position */}
                      <path
                        d={`M 0 0 Q ${branchX} 0, ${branchX} ${firstNodeY}`}
                        fill="none"
                        stroke="rgba(180, 160, 140, 0.5)"
                        strokeWidth="2"
                      />
                      {/* Vertical line between nodes */}
                      {sidequests.length > 1 && (
                        <line
                          x1={branchX}
                          y1={firstNodeY}
                          x2={branchX}
                          y2={lastNodeY}
                          stroke="rgba(180, 160, 140, 0.5)"
                          strokeWidth="2"
                        />
                      )}
                    </svg>

                    {/* Sidequest nodes */}
                    {sidequests.map((sidequest, sidequestIndex) => {
                      const nodeTop = firstNodeY + sidequestIndex * sidequestSpacing;
                      const isSidequestActive = activeSection === sidequest.id;
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
                              background: isSidequestActive ? "rgb(140, 169, 255)" : "rgb(190, 170, 150)",
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
