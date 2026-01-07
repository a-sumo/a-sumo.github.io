import { useState, useEffect } from "react";

interface Section {
  id: string;
  label: string;
  type: "chapter" | "subsection" | "sidequest";
  parent?: string;
}

interface ArticleTimelineProps {
  sections: Section[];
}

export default function ArticleTimeline({ sections }: ArticleTimelineProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);

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
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
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

      <div style={{ position: "relative", height: `${totalHeight}px`, width: "60px" }}>
        {/* Background line - centered at x=7 */}
        <div
          style={{
            position: "absolute",
            left: "7px",
            top: 0,
            width: "2px",
            height: "100%",
            background: "rgba(140, 140, 140, 0.3)",
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
                  background: isActive ? "rgb(140, 169, 255)" : isPast ? "rgb(140, 169, 255)" : "rgb(180, 180, 180)",
                  border: isActive ? "2px solid rgb(255, 248, 222)" : "2px solid white",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isActive ? "0 0 0 3px rgba(140, 169, 255, 0.3)" : "none",
                  transform: isHovered && !isActive ? "scale(1.2)" : "scale(1)",
                  padding: 0,
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
                    transform: "translateY(0)",
                    background: "rgb(40, 39, 40)",
                    color: "rgb(255, 248, 222)",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    zIndex: 50,
                  }}
                >
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
                        stroke="rgba(140, 140, 140, 0.4)"
                        strokeWidth="2"
                      />
                      {/* Vertical line between nodes */}
                      {sidequests.length > 1 && (
                        <line
                          x1={branchX}
                          y1={firstNodeY}
                          x2={branchX}
                          y2={lastNodeY}
                          stroke="rgba(140, 140, 140, 0.4)"
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
                              background: isSidequestActive ? "rgb(140, 169, 255)" : "rgb(160, 160, 160)",
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              boxShadow: isSidequestActive ? "0 0 0 2px rgba(140, 169, 255, 0.4)" : "none",
                              transform: isSidequestHovered ? "scale(1.3)" : "scale(1)",
                              padding: 0,
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
                                background: "rgb(40, 39, 40)",
                                color: "rgb(200, 200, 200)",
                                padding: "5px 9px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                zIndex: 50,
                              }}
                            >
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
