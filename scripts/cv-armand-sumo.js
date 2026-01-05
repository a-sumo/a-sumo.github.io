const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType, LevelFormat } = require('docx');
const fs = require('fs');

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } }, // 11pt default
    paragraphStyles: [
      { id: "Name", name: "Name", basedOn: "Normal",
        run: { size: 36, bold: true, font: "Arial" },
        paragraph: { spacing: { after: 60 }, alignment: AlignmentType.CENTER } },
      { id: "SectionHeader", name: "Section Header", basedOn: "Normal",
        run: { size: 24, bold: true, font: "Arial", allCaps: true },
        paragraph: { spacing: { before: 240, after: 120 }, border: { bottom: { color: "000000", size: 6, style: "single" } } } },
      { id: "JobTitle", name: "Job Title", basedOn: "Normal",
        run: { size: 22, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 120, after: 40 } } },
      { id: "Normal", name: "Normal",
        run: { size: 22, font: "Arial" },
        paragraph: { spacing: { after: 40 } } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-imaios", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] },
      { reference: "bullet-wanadev", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] },
      { reference: "bullet-dps", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] },
      { reference: "bullet-arcelor", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] },
      { reference: "bullet-projects", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] }
    ]
  },
  sections: [{
    properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
    children: [
      // Name
      new Paragraph({ style: "Name", children: [new TextRun("Armand Sumo")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "AR Engineer", size: 24 })] }),
      
      // Contact info
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
        new TextRun("Lyon, France | "),
        new ExternalHyperlink({ children: [new TextRun({ text: "a-sumo.github.io", style: "Hyperlink" })], link: "https://a-sumo.github.io/" })
      ]}),

      // SKILLS
      new Paragraph({ style: "SectionHeader", children: [new TextRun("Skills")] }),
      new Paragraph({ children: [new TextRun({ text: "Programming Languages: ", bold: true }), new TextRun("TypeScript, Python, C#")] }),
      new Paragraph({ children: [new TextRun({ text: "Real-Time 3D Engines & Frameworks: ", bold: true }), new TextRun("Unity, WebGL, OpenGL, Three.js, React-Three-Fiber")] }),
      new Paragraph({ children: [new TextRun({ text: "AR/VR Development: ", bold: true }), new TextRun("Lens Studio, Mixed Reality Toolkit (MRTK), WebXR, Spectacles wearable development, interactive AR experiences")] }),
      new Paragraph({ children: [new TextRun({ text: "3D & Content Creation Tools: ", bold: true }), new TextRun("SideFX Houdini, Blender, Cinema4D, Manim, 2D/3D asset pipelines")] }),
      new Paragraph({ children: [new TextRun({ text: "Technical Foundations: ", bold: true }), new TextRun("Linear algebra, computational geometry, shader programming, real-time rendering, performance optimization")] }),

      // PROFESSIONAL EXPERIENCE
      new Paragraph({ style: "SectionHeader", children: [new TextRun("Professional Experience")] }),
      
      // IMAIOS
      new Paragraph({ style: "JobTitle", children: [new TextRun("IMAIOS , Front-End Developer (2D & 3D)")] }),
      new Paragraph({ children: [new TextRun({ text: "March 2025 – September 2025 | Lyon, France", italics: true })] }),
      new Paragraph({ numbering: { reference: "bullet-imaios", level: 0 }, children: [new TextRun("Implemented interactive annotation tools for the IMAIOS DICOM Viewer with optimized SVG rendering and Cornerstone.js, improving user interactions and responsiveness")] }),
      new Paragraph({ numbering: { reference: "bullet-imaios", level: 0 }, children: [new TextRun("Deployed a 3D anatomical model viewer on the web platform, enabling browser access to high-quality 3D medical educational content")] }),
      new Paragraph({ numbering: { reference: "bullet-imaios", level: 0 }, children: [new TextRun("Developed enhanced features for the e-anatomy web application using Vue 3, TypeScript, Godot, and AWS")] }),

      // Wanadev
      new Paragraph({ style: "JobTitle", children: [new TextRun("Wanadev , 3D Front-End Developer")] }),
      new Paragraph({ children: [new TextRun({ text: "February 2024 – August 2024 | Lyon, France", italics: true })] }),
      new Paragraph({ numbering: { reference: "bullet-wanadev", level: 0 }, children: [new TextRun("Developed a custom 2D industrial drawing tool using Paper.js for high-precision milling machines")] }),
      new Paragraph({ numbering: { reference: "bullet-wanadev", level: 0 }, children: [new TextRun("Implemented 2D and 3D product configurators for home furniture using Three.js/Vue.js front-end and PHP Symfony back-end")] }),

      // Digital Product School
      new Paragraph({ style: "JobTitle", children: [new TextRun("Digital Product School by UnternehmerTUM , Front-End Developer Intern")] }),
      new Paragraph({ children: [new TextRun({ text: "January 2023 – June 2023 | Munich, Germany", italics: true })] }),
      new Paragraph({ numbering: { reference: "bullet-dps", level: 0 }, children: [new TextRun("Developed a web application for SAP to facilitate task planning for production engineers")] }),
      new Paragraph({ numbering: { reference: "bullet-dps", level: 0 }, children: [new TextRun("Built a location-based web application using React, Google Places API, Leaflet, and Spring; created mobile version with React Native and Expo")] }),

      // Arcelor Mittal
      new Paragraph({ style: "JobTitle", children: [new TextRun("ArcelorMittal Digital Lab , AR/VR Developer Intern")] }),
      new Paragraph({ children: [new TextRun({ text: "January 2022 – June 2022 | Maizières-lès-Metz, France", italics: true })] }),
      new Paragraph({ numbering: { reference: "bullet-arcelor", level: 0 }, children: [new TextRun("Developed a cross-platform video live-streaming application for HoloLens 2 using Unity, MRTK, .NET, and Azure, solving visual information access limitations for steel plant operators")] }),

      // PROJECTS
      new Paragraph({ style: "SectionHeader", children: [new TextRun("Projects")] }),
      new Paragraph({ style: "JobTitle", children: [
        new TextRun("Specs Samples, Sample Projects in Lens Studio with Deployed Lenses for Spectacles  "),
        new ExternalHyperlink({ children: [new TextRun({ text: "github.com/a-sumo/specs-samples", style: "Hyperlink" })], link: "https://github.com/a-sumo/specs-samples" })
      ]}),
      new Paragraph({ numbering: { reference: "bullet-projects", level: 0 }, children: [new TextRun("Built real-time color sampling tool integrating camera feed processing, custom shaders, and Gemini API for Spectacles AR glasses")] }),
      new Paragraph({ numbering: { reference: "bullet-projects", level: 0 }, children: [new TextRun("Developed interactive 3D color space visualizations using procedural mesh generation, optimizing performance by replacing VFX particles with GPU-accelerated vertex processing")] }),
      new Paragraph({ numbering: { reference: "bullet-projects", level: 0 }, children: [new TextRun("Implemented vector field visualizer with procedural 3D geometry and real-time GPU vertex manipulation")] }),

      // EDUCATION
      new Paragraph({ style: "SectionHeader", children: [new TextRun("Education")] }),
      new Paragraph({ style: "JobTitle", children: [new TextRun("IMT Nord Europe , Engineering Degree (Grande École)")] }),
      new Paragraph({ children: [new TextRun({ text: "Equivalent to Master's in Computer Science | Graduated May 2023", italics: true })] }),
      new Paragraph({ style: "JobTitle", children: [new TextRun("Lycée Franklin Roosevelt , Classes Préparatoires")] }),
      new Paragraph({ children: [new TextRun({ text: "Mathematics & Physics | Completed May 2019", italics: true })] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const path = require('path');
  const outputDir = path.join(__dirname, '../public/assets');
  fs.writeFileSync(path.join(outputDir, 'Armand_Sumo_AR_Engineer_CV.docx'), buffer);
  console.log("CV created successfully");
});
