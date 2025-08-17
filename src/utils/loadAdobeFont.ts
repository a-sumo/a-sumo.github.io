import type { FontStyle, FontWeight } from "satori";

export type FontOptions = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight | undefined;
  style: FontStyle | undefined;
};

// Adobe Fonts need to be downloaded from their direct URLs
async function loadAdobeFont(
  url: string,
  name: string,
  weight: FontWeight,
  style: FontStyle
): Promise<FontOptions> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download Adobe font. Status: ${response.status}`);
  }
  
  const data = await response.arrayBuffer();
  return { name, data, weight, style };
}

async function loadAdobeFonts(): Promise<FontOptions[]> {
  // Adobe font URLs from your typekit (these are the WOFF2 URLs for better compression)
  const fontsConfig = [
    {
      name: "freight-text-pro",
      url: "https://use.typekit.net/af/ac6334/000000000000000000012059/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3",
      weight: 400 as FontWeight,
      style: "normal" as FontStyle,
    },
    {
      name: "freight-text-pro", 
      url: "https://use.typekit.net/af/4b422b/000000000000000077359fbd/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n5&v=3",
      weight: 500 as FontWeight,
      style: "normal" as FontStyle,
    },
    {
      name: "neue-haas-unica",
      url: "https://use.typekit.net/af/d7f1e9/00000000000000007735bb2a/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3",
      weight: 400 as FontWeight,
      style: "normal" as FontStyle,
    },
    {
      name: "neue-haas-unica",
      url: "https://use.typekit.net/af/92a736/00000000000000007735bb14/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3",
      weight: 700 as FontWeight,
      style: "normal" as FontStyle,
    },
  ];

  const fonts = await Promise.all(
    fontsConfig.map(async ({ name, url, weight, style }) => {
      return await loadAdobeFont(url, name, weight, style);
    })
  );

  return fonts;
}

export default loadAdobeFonts;