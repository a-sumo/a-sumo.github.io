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

  const getNodePosition = (index: number) => {
    const totalHeight = 200; // Total height of timeline in px
    return (index / (mainSections.length - 1)) * totalHeight;
  };

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

      <div style={{ position: "relative", height: "200px", width: "60px" }}>
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
          const nodeY = getNodePosition(index);
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
              {sidequests.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "-4px",
                  }}
                >
                  {/* Curved connector from main line to branch */}
                  <svg
                    width="30"
                    height={20 + sidequests.length * 16}
                    style={{ position: "absolute", left: 0, top: 0 }}
                  >
                    {/* Initial curve */}
                    <path
                      d="M 0 4 Q 14 4, 14 18"
                      fill="none"
                      stroke="rgba(140, 140, 140, 0.4)"
                      strokeWidth="2"
                    />
                    {/* Vertical line for branch */}
                    <line
                      x1="14"
                      y1="18"
                      x2="14"
                      y2={18 + (sidequests.length - 1) * 16}
                      stroke="rgba(140, 140, 140, 0.4)"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Sidequest nodes along the branch */}
                  {sidequests.map((sidequest, sidequestIndex) => (
                    <div key={sidequest.id}>
                      <button
                        onClick={() => scrollToSection(sidequest.id)}
                        onMouseEnter={() => setHoveredSection(sidequest.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        style={{
                          position: "absolute",
                          left: "8px",
                          top: `${14 + sidequestIndex * 16}px`,
                          width: "10px",
                          height: "10px",
                          borderRadius: "3px",
                          background: activeSection === sidequest.id ? "rgb(255, 180, 50)" : "rgb(180, 180, 180)",
                          border: activeSection === sidequest.id ? "2px solid rgb(255, 220, 100)" : "2px solid white",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: activeSection === sidequest.id ? "0 0 0 3px rgba(255, 180, 50, 0.3)" : "none",
                          transform: hoveredSection === sidequest.id ? "scale(1.2)" : "scale(1)",
                          padding: 0,
                        }}
                        title={sidequest.label}
                      />

                      {/* Sidequest tooltip */}
                      {hoveredSection === sidequest.id && (
                        <div
                          style={{
                            position: "absolute",
                            left: "28px",
                            top: `${14 + sidequestIndex * 16}px`,
                            background: "rgb(40, 39, 40)",
                            color: "rgb(255, 200, 100)",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
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
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
