interface ChapterProps {
  id?: string;
  number: number;
  title: string;
}

export default function Chapter({ id, number, title }: ChapterProps) {
  return (
    <section id={id} style={{ margin: "40px 0", scrollMarginTop: "80px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          width: "100%",
          padding: "0 0 16px 0",
          borderBottom: "2px solid rgb(40, 39, 40)",
        }}
      >
        <span style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          background: "rgb(40, 39, 40)",
          color: "rgb(255, 248, 222)",
          fontFamily: "Libertinus Sans, sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          borderRadius: "4px",
          flexShrink: 0,
        }}>
          {number}
        </span>
        <span style={{
          fontFamily: "Libertinus Sans, sans-serif",
          fontSize: "24px",
          fontWeight: 700,
          color: "rgb(40, 39, 40)",
        }}>
          {title}
        </span>
      </div>
    </section>
  );
}
