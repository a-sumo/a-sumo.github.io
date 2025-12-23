interface SeriesPart {
  title: string;
  href: string;
  draft?: boolean;
}

interface SeriesNavProps {
  seriesName: string;
  currentPart: number;
  parts: SeriesPart[];
}

export default function SeriesNav({ seriesName, currentPart, parts }: SeriesNavProps) {

  return (
    <div
      style={{
        background: "rgb(245, 245, 245)",
        borderLeft: "4px solid rgb(140, 169, 255)",
        padding: "12px 16px",
        marginBottom: "24px",
        fontSize: "14px",
        fontFamily: '"Roboto Mono", monospace',
      }}
    >
      <div style={{ marginBottom: "8px" }}>
        <strong>Part {currentPart}</strong> of the <em>{seriesName}</em> series.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {parts.map((part, index) => {
          const partNum = index + 1;
          const isCurrent = partNum === currentPart;
          const isDraft = part.draft === true;

          if (isCurrent) {
            return (
              <span key={partNum} style={{ color: "rgb(40, 39, 40)", fontWeight: 500 }}>
                Part {partNum}: {part.title} (current)
              </span>
            );
          }

          if (isDraft) {
            return (
              <span key={partNum} style={{ color: "rgb(120, 120, 120)" }}>
                Part {partNum}: {part.title} (coming soon)
              </span>
            );
          }

          return (
            <a
              key={partNum}
              href={part.href}
              style={{ color: "rgb(140, 169, 255)", textDecoration: "underline" }}
            >
              Part {partNum}: {part.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}
