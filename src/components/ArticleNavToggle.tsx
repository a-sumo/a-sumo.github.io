import { useState, useEffect } from "react";
import ArticleTimeline from "./ArticleTimeline";

interface ChapterData {
  id: string;
  label: string;
  title?: string;
  type: "chapter" | "subsection" | "sidequest";
  parent?: string;
  preview?: string;
  summary?: string[];
}

interface ArticleNavToggleProps {
  chapters: ChapterData[];
  defaultView?: "timeline" | "outline";
  useAdvancedTimeline?: boolean;
}

export default function ArticleNavToggle({ chapters, defaultView = "outline", useAdvancedTimeline = false }: ArticleNavToggleProps) {
  const [view, setView] = useState<"timeline" | "outline">(defaultView);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map(c => c.id))
  );
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isInlineCollapsed, setIsInlineCollapsed] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isBottomSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isBottomSheetOpen]);

  // Scroll tracking for both views
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
      setIsSidebarVisible(scrollTop > 150);

      let currentSection: string | null = null;
      for (const section of chapters) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.15) {
            currentSection = section.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapters]);

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsBottomSheetOpen(false);
  };

  const mainChapters = chapters.filter(c => c.type === "chapter");

  // Group sidequests by parent
  const sidequestsByParent = new Map<string, ChapterData[]>();
  chapters.filter(c => c.type === "sidequest" || c.type === "subsection").forEach(sq => {
    if (sq.parent) {
      const existing = sidequestsByParent.get(sq.parent) || [];
      sidequestsByParent.set(sq.parent, [...existing, sq]);
    }
  });

  // Get active chapter - if a sidequest is active, return its parent
  const getActiveChapter = () => {
    if (!activeSection) return null;
    const activeItem = chapters.find(c => c.id === activeSection);
    if (activeItem?.type === "sidequest" || activeItem?.type === "subsection") {
      return activeItem.parent || null;
    }
    return activeSection;
  };
  const activeChapter = getActiveChapter();

  return (
    <>
      {/* Inline Outline - always visible, foldable */}
      <div className="ant-inline-wrap">
        <button
          className="ant-inline-header"
          onClick={() => setIsInlineCollapsed(!isInlineCollapsed)}
        >
          <span>Contents</span>
          <span className="ant-inline-toggle">{isInlineCollapsed ? "+" : "−"}</span>
        </button>

        <div
          className="ant-outline"
          style={{
            maxHeight: isInlineCollapsed ? "0px" : `${mainChapters.length * 150}px`,
            opacity: isInlineCollapsed ? 0 : 1,
            marginTop: isInlineCollapsed ? "0px" : "12px",
          }}
        >
          {mainChapters.map((chapter, idx) => {
            const title = chapter.title || chapter.label;
            const summary = chapter.summary || [];

            return (
              <div key={chapter.id} className="ant-chapter">
                <div
                  className="ant-chapter-header"
                  onClick={() => scrollToSection(chapter.id)}
                >
                  <span className="ant-chapter-num">{idx + 1}.</span>
                  <span className="ant-chapter-title">{title}</span>
                </div>

                {/* Only show summary in inline outline, sidequests only in sidebar */}
                {summary.length > 0 && (
                  <div className="ant-inline-sidequests">
                    {summary.map((item, i) => (
                      <div
                        key={i}
                        className="ant-inline-sidequest"
                        onClick={() => scrollToSection(chapter.id)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Sidebar with toggle at top */}
      <div
        className="ant-sidebar"
        style={{
          opacity: isSidebarVisible ? 1 : 0,
          pointerEvents: isSidebarVisible ? "auto" : "none",
        }}
      >
        {/* Toggle buttons */}
        <div className="ant-sidebar-toggle">
          <button
            className={view === "outline" ? "active" : ""}
            onClick={() => setView("outline")}
            title="Outline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <button
            className={view === "timeline" ? "active" : ""}
            onClick={() => setView("timeline")}
            title="Timeline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
              <line x1="12" y1="7" x2="12" y2="10" />
              <line x1="12" y1="14" x2="12" y2="17" />
            </svg>
          </button>
        </div>

        {/* Sidebar content */}
        {view === "outline" ? (
          /* Outline Sidebar */
          <div className="ant-sidebar-outline">
            {mainChapters.map((chapter, idx) => {
              const isActive = activeChapter === chapter.id;
              const activeIdx = mainChapters.findIndex(c => c.id === activeChapter);
              const isPast = activeIdx >= 0 && idx <= activeIdx;
              const isHovered = hoveredChapter === chapter.id;
              const title = chapter.title || chapter.label;
              const sidequests = sidequestsByParent.get(chapter.id) || [];

              return (
                <div key={chapter.id} className="ant-sidebar-chapter-group">
                  <div
                    className={`ant-sidebar-item ${isActive ? "active" : ""} ${isPast ? "past" : ""} ${isHovered ? "hovered" : ""}`}
                    onClick={() => scrollToSection(chapter.id)}
                    onMouseEnter={() => setHoveredChapter(chapter.id)}
                    onMouseLeave={() => setHoveredChapter(null)}
                  >
                    <span className="ant-sidebar-num">{idx + 1}.</span>
                    <span className="ant-sidebar-label">{title}</span>
                    {chapter.preview && (
                      <img
                        src={chapter.preview}
                        alt={title}
                        className={`ant-item-preview ${isHovered ? "visible" : ""}`}
                      />
                    )}
                  </div>
                  {/* Sidequests under this chapter */}
                  {sidequests.length > 0 && (
                    <div className="ant-sidebar-sidequests">
                      {sidequests.map(sq => {
                        const isSqActive = activeSection === sq.id;
                        const isSqHovered = hoveredChapter === sq.id;
                        return (
                          <div
                            key={sq.id}
                            className={`ant-sidebar-sidequest ${isSqActive ? "active" : ""} ${isSqHovered ? "hovered" : ""}`}
                            onClick={() => scrollToSection(sq.id)}
                            onMouseEnter={() => setHoveredChapter(sq.id)}
                            onMouseLeave={() => setHoveredChapter(null)}
                          >
                            <span className="ant-sidebar-sq-label">{sq.label}</span>
                            {sq.preview && (
                              <img
                                src={sq.preview}
                                alt={sq.label}
                                className={`ant-item-preview ${isSqHovered ? "visible" : ""}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : useAdvancedTimeline ? (
          /* Advanced Timeline with branches */
          <ArticleTimeline sections={chapters} embedded={true} />
        ) : (
          /* Default Timeline Sidebar */
          <div className="ant-timeline-inner">
            <div className="ant-timeline-bg-line" />
            <div
              className="ant-timeline-progress-line"
              style={{ height: `${scrollProgress * 100}%` }}
            />

            {mainChapters.map((chapter, idx) => {
              const isActive = activeSection === chapter.id;
              const activeIdx = mainChapters.findIndex(c => c.id === activeSection);
              const isPast = activeIdx >= 0 && idx <= activeIdx;
              const isHovered = hoveredChapter === chapter.id;
              const nodeY = (idx / (mainChapters.length - 1)) * 240;

              return (
                <div
                  key={chapter.id}
                  className="ant-timeline-node-wrap"
                  style={{ top: `${nodeY}px` }}
                >
                  <button
                    className={`ant-timeline-node ${isActive ? "active" : ""} ${isPast ? "past" : ""} ${isHovered ? "hovered" : ""}`}
                    onClick={() => scrollToSection(chapter.id)}
                    onMouseEnter={() => setHoveredChapter(chapter.id)}
                    onMouseLeave={() => setHoveredChapter(null)}
                  />

                  <div className={`ant-timeline-tooltip ${isHovered ? "visible" : ""}`}>
                    {chapter.preview && (
                      <img src={chapter.preview} alt={chapter.label} />
                    )}
                    <span>{chapter.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Mobile Bottom Sheet FAB - transforms between capsule and circle */}
      <div
        className={`ant-mobile-fab ${isSidebarVisible ? "visible" : ""} ${isBottomSheetOpen ? "open" : ""}`}
        onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
        role="button"
        tabIndex={0}
      >
        <svg className="ant-fab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span className="ant-fab-label">Contents</span>
      </div>

      {/* Bottom Sheet Backdrop */}
      <div
        className={`ant-sheet-backdrop ${isBottomSheetOpen ? "visible" : ""}`}
        onClick={() => setIsBottomSheetOpen(false)}
      />

      {/* Bottom Sheet */}
      <div className={`ant-bottom-sheet ${isBottomSheetOpen ? "open" : ""}`}>
        <div className="ant-sheet-header">
          <div className="ant-sheet-toggle">
            <button
              className={view === "outline" ? "active" : ""}
              onClick={() => setView("outline")}
            >
              Outline
            </button>
            <button
              className={view === "timeline" ? "active" : ""}
              onClick={() => setView("timeline")}
            >
              Timeline
            </button>
          </div>
        </div>

        <div className="ant-sheet-content">
          {view === "outline" ? (
            <div className="ant-sheet-outline">
              {mainChapters.map((chapter, idx) => {
                const isActive = activeChapter === chapter.id;
                const title = chapter.title || chapter.label;
                const sidequests = sidequestsByParent.get(chapter.id) || [];

                return (
                  <div key={chapter.id} className="ant-sheet-chapter-group">
                    <div
                      className={`ant-sheet-item ${isActive ? "active" : ""}`}
                      onClick={() => scrollToSection(chapter.id)}
                    >
                      <span className="ant-sheet-num">{idx + 1}.</span>
                      <span className="ant-sheet-label">{title}</span>
                    </div>
                    {sidequests.length > 0 && (
                      <div className="ant-sheet-sidequests">
                        {sidequests.map(sq => {
                          const isSqActive = activeSection === sq.id;
                          return (
                            <div
                              key={sq.id}
                              className={`ant-sheet-sidequest ${isSqActive ? "active" : ""}`}
                              onClick={() => scrollToSection(sq.id)}
                            >
                              {sq.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Horizontal timeline for mobile - always use simple version */
            <div className="ant-sheet-timeline-wrap">
              <div className="ant-sheet-timeline">
                {mainChapters.map((chapter, idx) => {
                  const isActive = activeChapter === chapter.id;
                  const activeIdx = mainChapters.findIndex(c => c.id === activeChapter);
                  const isPast = activeIdx >= 0 && idx <= activeIdx;

                  return (
                    <div
                      key={chapter.id}
                      className={`ant-sheet-timeline-item ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
                      onClick={() => scrollToSection(chapter.id)}
                    >
                      <div className="ant-sheet-timeline-node-wrap">
                        <div className="ant-sheet-timeline-node" />
                        <div className="ant-sheet-timeline-line" />
                      </div>
                      <span>{chapter.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Inline section */
        .ant-inline-wrap {
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ant-inline-header {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: "Roboto Mono", monospace;
          font-size: 11px;
          font-weight: 500;
          color: rgb(140, 140, 140);
          padding: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .ant-inline-header:hover {
          color: rgb(100, 100, 100);
        }

        .ant-inline-toggle {
          font-size: 12px;
          font-weight: 400;
          width: 14px;
          text-align: center;
        }

        /* Outline */
        .ant-outline {
          font-family: "Roboto Mono", monospace;
          font-size: 12px;
          line-height: 1.6;
          overflow: hidden;
        }

        .ant-chapter {
          margin-bottom: 12px;
          position: relative;
        }

        .ant-chapter-header {
          display: flex;
          align-items: baseline;
          gap: 6px;
          cursor: pointer;
          position: relative;
        }

        .ant-chapter-num {
          min-width: 20px;
        }

        .ant-chapter-title {
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
          transition: color 0.15s ease;
        }

        .ant-chapter-header:hover .ant-chapter-title {
          color: rgb(140, 169, 255);
        }

        /* Inline sidequests (tree structure) */
        .ant-inline-sidequests {
          margin-left: 20px;
          padding-left: 10px;
          border-left: 1px solid rgba(140, 140, 140, 0.3);
          margin-top: 4px;
          margin-bottom: 8px;
        }

        .ant-inline-sidequest {
          padding: 2px 0;
          cursor: pointer;
          color: rgb(160, 160, 160);
          font-size: 11px;
          transition: color 0.15s ease;
        }

        .ant-inline-sidequest:hover {
          color: rgb(140, 169, 255);
        }

        /* Fixed Sidebar */
        .ant-sidebar {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 40;
          transition: opacity 0.3s ease;
          display: none;
          overflow: visible;
        }

        /* Sidebar Toggle */
        .ant-sidebar-toggle {
          display: flex;
          gap: 2px;
          margin-bottom: 12px;
          padding: 2px;
          background: rgba(40, 39, 40, 0.06);
          border-radius: 6px;
          width: fit-content;
        }

        .ant-sidebar-toggle button {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: rgb(160, 160, 160);
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .ant-sidebar-toggle button:hover:not(.active) {
          background: rgba(40, 39, 40, 0.08);
          color: rgb(100, 100, 100);
        }

        .ant-sidebar-toggle button.active {
          background: rgb(100, 130, 220);
          color: white;
          box-shadow: 0 1px 3px rgba(100, 130, 220, 0.3);
        }

        .ant-sidebar-toggle button svg {
          width: 14px;
          height: 14px;
        }

        /* Outline Sidebar */
        .ant-sidebar-outline {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-family: "Roboto Mono", monospace;
          font-size: 11px;
          max-width: 180px;
          overflow: visible;
          min-height: 240px;
        }

        .ant-sidebar-item {
          display: flex;
          align-items: baseline;
          gap: 6px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
          position: relative;
          color: rgb(140, 140, 140);
          overflow: visible;
        }

        .ant-sidebar-item.past {
          color: rgb(100, 100, 100);
        }

        .ant-sidebar-item.active {
          color: rgb(140, 169, 255);
          background: rgba(140, 169, 255, 0.1);
        }

        .ant-sidebar-item.hovered:not(.active) {
          color: rgb(40, 39, 40);
          background: rgba(40, 39, 40, 0.05);
        }

        .ant-sidebar-num {
          min-width: 16px;
          font-weight: 500;
        }

        .ant-sidebar-label {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          line-height: 1.3;
        }

        .ant-sidebar-chapter-group {
          margin-bottom: 4px;
        }

        /* Sidequests list */
        .ant-sidebar-sidequests {
          margin-left: 22px;
          padding-left: 8px;
          border-left: 1px solid rgba(var(--color-border), 0.3);
          margin-top: 2px;
          margin-bottom: 6px;
        }

        .ant-sidebar-sidequest {
          display: flex;
          align-items: baseline;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 3px;
          transition: all 0.2s ease;
          position: relative;
          color: rgb(160, 160, 160);
          font-size: 10px;
          overflow: visible;
        }

        .ant-sidebar-sidequest.active {
          color: rgb(var(--color-accent));
          background: rgba(var(--color-accent), 0.1);
        }

        .ant-sidebar-sidequest.hovered:not(.active) {
          color: rgb(var(--color-text-base));
          background: rgba(var(--color-text-base), 0.05);
        }

        .ant-sidebar-sq-label {
          font-weight: 500;
          line-height: 1.4;
        }

        /* Item preview image */
        img.ant-item-preview {
          position: absolute;
          left: calc(100% + 16px);
          top: 50%;
          transform: translateY(-50%);
          width: 180px;
          height: auto;
          border-radius: 8px;
          padding: 8px;
          background: rgba(var(--color-card), 0.97);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(var(--color-border), 0.3);
          z-index: 100;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.15s ease, visibility 0.15s ease;
        }

        img.ant-item-preview.visible {
          opacity: 1;
          visibility: visible;
        }

        /* Timeline Sidebar */
        .ant-timeline-inner {
          position: relative;
          height: 240px;
          width: 60px;
        }

        .ant-timeline-bg-line {
          position: absolute;
          left: 7px;
          top: 0;
          width: 2px;
          height: 100%;
          background: rgba(180, 160, 140, 0.4);
          border-radius: 1px;
        }

        .ant-timeline-progress-line {
          position: absolute;
          left: 7px;
          top: 0;
          width: 2px;
          background: rgb(140, 169, 255);
          border-radius: 1px;
          transition: height 0.15s ease-out;
        }

        .ant-timeline-node-wrap {
          position: absolute;
          left: 0;
        }

        .ant-timeline-node {
          position: absolute;
          left: 1px;
          top: -7px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgb(200, 180, 160);
          border: 3px solid rgb(255, 250, 240);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          z-index: 2;
        }

        .ant-timeline-node.past,
        .ant-timeline-node.active {
          background: rgb(140, 169, 255);
        }

        .ant-timeline-node.active {
          box-shadow: 0 0 0 3px rgba(140, 169, 255, 0.3);
        }

        .ant-timeline-node.hovered:not(.active) {
          transform: scale(1.2);
        }

        .ant-timeline-tooltip {
          position: absolute;
          left: 28px;
          top: -7px;
          transform: translateY(-30%);
          background: rgba(var(--color-card), 0.97);
          color: rgb(var(--color-text-base));
          padding: 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(var(--color-border), 0.3);
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.15s ease, visibility 0.15s ease;
          min-width: 180px;
        }

        .ant-timeline-tooltip.visible {
          opacity: 1;
          visibility: visible;
        }

        .ant-timeline-tooltip img {
          width: 180px;
          height: auto;
          border-radius: 6px;
          margin-bottom: 10px;
          display: block;
        }

        @media (min-width: 900px) {
          .ant-sidebar {
            display: block;
          }
        }

        @media (min-width: 900px) and (max-width: 1199px) {
          .ant-sidebar {
            transform: translateY(-50%) scale(0.85);
            left: 10px;
          }
          .ant-sidebar-outline {
            max-width: 140px;
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .ant-outline {
            font-size: 11px;
          }

          .ant-chapter {
            margin-bottom: 8px;
          }

          .ant-inline-sidequests {
            margin-left: 16px;
            padding-left: 8px;
          }

          .ant-inline-sidequest {
            font-size: 10px;
          }
        }

        /* Mobile FAB (Floating Action Button) - transforms capsule <-> circle */
        .ant-mobile-fab {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 20px;
          -webkit-backdrop-filter: blur(1px);
          backdrop-filter: blur(1px);
          color: rgb(var(--color-text-base));
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 12px 18px;
          font-family: "Roboto Mono", monospace;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          z-index: 1000;
          align-items: center;
          justify-content: center;
          gap: 10px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s ease, transform 0.3s ease,
                      border-radius 0.25s ease, padding 0.25s ease,
                      width 0.25s ease, height 0.25s ease;
          pointer-events: none;
        }

        .ant-mobile-fab.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .ant-mobile-fab:active {
          transform: scale(0.95);
        }

        /* Open state - circle */
        .ant-mobile-fab.open {
          border-radius: 50%;
          padding: 0;
          width: 44px;
          height: 44px;
          gap: 0;
        }

        .ant-mobile-fab.open:active {
          transform: scale(0.9);
        }

        .ant-fab-icon {
          flex-shrink: 0;
          display: block;
          transition: transform 0.25s ease, opacity 0.2s ease;
        }

        .ant-mobile-fab.open .ant-fab-icon {
          transform: rotate(90deg);
          opacity: 0.7;
        }

        .ant-fab-label {
          transition: opacity 0.2s ease, width 0.25s ease;
          white-space: nowrap;
          overflow: hidden;
          line-height: 1;
        }

        .ant-mobile-fab.open .ant-fab-label {
          opacity: 0;
          width: 0;
        }

        /* Bottom Sheet Backdrop */
        .ant-sheet-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 998;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .ant-sheet-backdrop.visible {
          opacity: 1;
          pointer-events: auto;
        }

        /* Bottom Sheet */
        .ant-bottom-sheet {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgb(var(--color-fill));
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.15);
          z-index: 999;
          max-height: 50vh;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }

        .ant-bottom-sheet.open {
          transform: translateY(0);
        }

        .ant-sheet-header {
          padding: 12px 16px 8px;
          border-bottom: 1px solid rgba(var(--color-border), 0.2);
        }

        .ant-sheet-toggle {
          display: flex;
          gap: 4px;
          background: rgba(var(--color-text-base), 0.06);
          padding: 2px;
          border-radius: 6px;
        }

        .ant-sheet-toggle button {
          flex: 1;
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: rgb(var(--color-text-base));
          font-family: "Roboto Mono", monospace;
          font-size: 11px;
          font-weight: 500;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ant-sheet-toggle button.active {
          background: rgb(var(--color-accent));
          color: white;
        }

        .ant-sheet-content {
          padding: 12px 16px 24px;
          overflow-y: auto;
          max-height: calc(50vh - 60px);
        }

        /* Sheet Outline */
        .ant-sheet-outline {
          font-family: "Roboto Mono", monospace;
        }

        .ant-sheet-chapter-group {
          margin-bottom: 2px;
        }

        .ant-sheet-item {
          display: flex;
          align-items: baseline;
          gap: 6px;
          padding: 8px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .ant-sheet-item:active {
          background: rgba(var(--color-text-base), 0.05);
        }

        .ant-sheet-item.active {
          background: rgba(var(--color-accent), 0.1);
        }

        .ant-sheet-item.active .ant-sheet-label {
          color: rgb(var(--color-accent));
        }

        .ant-sheet-num {
          font-size: 12px;
          font-weight: 500;
          min-width: 20px;
          color: rgb(var(--color-text-base));
          opacity: 0.5;
        }

        .ant-sheet-label {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: rgb(var(--color-text-base));
        }

        .ant-sheet-sidequests {
          margin-left: 26px;
          padding-left: 8px;
          border-left: 1px solid rgba(var(--color-border), 0.3);
          margin-bottom: 4px;
        }

        .ant-sheet-sidequest {
          padding: 5px 8px;
          font-size: 11px;
          color: rgb(var(--color-text-base));
          opacity: 0.7;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
        }

        .ant-sheet-sidequest:active {
          background: rgba(var(--color-text-base), 0.05);
        }

        .ant-sheet-sidequest.active {
          opacity: 1;
          color: rgb(var(--color-accent));
          background: rgba(var(--color-accent), 0.1);
        }

        /* Sheet Timeline - Horizontal */
        .ant-sheet-timeline-wrap {
          padding: 16px 0 8px;
          overflow-x: auto;
        }

        .ant-sheet-timeline {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          min-width: max-content;
          padding: 0 12px;
          position: relative;
        }

        .ant-sheet-timeline-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 8px 4px;
          border-radius: 6px;
          cursor: pointer;
          font-family: "Roboto Mono", monospace;
          font-size: 10px;
          color: rgb(var(--color-text-base));
          opacity: 0.5;
          transition: all 0.15s ease;
          width: 70px;
          text-align: center;
          position: relative;
        }

        .ant-sheet-timeline-item:active {
          background: rgba(var(--color-text-base), 0.05);
        }

        .ant-sheet-timeline-item.past {
          opacity: 0.7;
        }

        .ant-sheet-timeline-item.active {
          opacity: 1;
        }

        .ant-sheet-timeline-item.active span {
          color: rgb(var(--color-accent));
          font-weight: 600;
        }

        .ant-sheet-timeline-node-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 12px;
        }

        .ant-sheet-timeline-node {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(var(--color-text-base), 0.25);
          flex-shrink: 0;
          transition: background 0.15s ease;
          z-index: 2;
          position: relative;
        }

        .ant-sheet-timeline-item.past .ant-sheet-timeline-node,
        .ant-sheet-timeline-item.active .ant-sheet-timeline-node {
          background: rgb(var(--color-accent));
        }

        .ant-sheet-timeline-line {
          position: absolute;
          top: 50%;
          left: calc(50% + 6px);
          width: calc(100% - 4px);
          height: 2px;
          background: rgba(var(--color-text-base), 0.15);
          transform: translateY(-50%);
        }

        .ant-sheet-timeline-item:last-child .ant-sheet-timeline-line {
          display: none;
        }

        .ant-sheet-timeline-item.past .ant-sheet-timeline-line {
          background: rgb(var(--color-accent));
        }

        @media (max-width: 899px) {
          .ant-mobile-fab {
            display: flex;
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
            background: rgba(var(--color-fill), 0.95);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          }

          .ant-sheet-backdrop {
            display: block;
          }

          .ant-bottom-sheet {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
