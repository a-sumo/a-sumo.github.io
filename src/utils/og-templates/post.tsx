import satori from "satori";
import type { CollectionEntry } from "astro:content";
import { SITE } from "@config";
import loadAdobeFonts, { type FontOptions } from "../loadAdobeFont";

export default async (post: CollectionEntry<"blog">) => {
  return satori(
    <div
      style={{
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-1px",
          right: "-1px",
          border: "4px solid #000",
          background: "#ecebeb",
          opacity: "0.9",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2.5rem",
          width: "88%",
          height: "80%",
        }}
      />
      <div
        style={{
          border: "4px solid #000",
          background: "#fefbfb",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px",
            width: "90%",
            height: "90%",
          }}
        >
          <p
            style={{
              fontSize: 72,
              fontWeight: "500",
              maxHeight: "84%",
              overflow: "hidden",
              fontFamily: "freight-text-pro", // Using Adobe serif font for titles
            }}
          >
            {post.data.title}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "8px",
              fontSize: 28,
              fontFamily: "neue-haas-unica", // Using Adobe sans-serif for metadata
            }}
          >
            <span>
              by{" "}
              <span
                style={{
                  color: "transparent",
                }}
              >
                "
              </span>
              <span style={{ overflow: "hidden", fontWeight: "700" }}>
                {post.data.author}
              </span>
            </span>
            <span style={{ overflow: "hidden", fontWeight: "700" }}>
              {SITE.title}
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: (await loadAdobeFonts()) as FontOptions[],
    }
  );
};