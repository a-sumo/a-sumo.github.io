// gitprofile.config.ts

const CONFIG = {
  github: {
    username: 'a-sumo', // Your GitHub org/user name. (This is the only required config)
  },
  /**
   * If you are deploying to https://<USERNAME>.github.io/, for example your repository is at https://github.com/arifszn/arifszn.github.io, set base to '/'.
   * If you are deploying to https://<USERNAME>.github.io/<REPO_NAME>/,
   * for example your repository is at https://github.com/arifszn/portfolio, then set base to '/portfolio/'.
   */
  base: '/',
  projects: {
    github: {
      display: true, // Display GitHub projects?
      header: 'Github Projects',
      mode: 'manual', // Mode can be: 'automatic' or 'manual'
      automatic: {
        sortBy: 'stars', // Sort projects by 'stars' or 'updated'
        limit: 5, // How many projects to display.
        exclude: {
          forks: false, // Forked projects will not be displayed if set to true.
          projects: [], // These projects will not be displayed. example: ['arifszn/my-project1', 'arifszn/my-project2']
        },
      },
      manual: {
        // Properties for manually specifying projects
        projects: ['a-sumo/hyperstep'], // List of repository names to display. example: ['arifszn/my-project1', 'arifszn/my-project2']
      },
    },
    external: {
      header: 'Other Projects',
      // To hide the `External Projects` section, keep it empty.
      projects: [
        {
          title: 'Volumetric Audio Visualizer ( Three.js',
          description: '',
          imageUrl: 'https://a-sumo.github.io/data/vol_synth.png',
          link: 'https://a-sumo.github.io/hyperstep/volume/',
        },
        {
          title: 'MRI Scan Visualizer (TypeScript and Angular)',
          description: '',
          imageUrl: 'https://a-sumo.github.io/data/mri_scan.png',
          link: 'https://github.com/a-sumo/webgl-imaging',
        },
        {
          title: 'VR MIDI Controller (Unity)',
          description: '',
          imageUrl: '',
          link: 'https://www.youtube.com/watch?v=o-pGeCnhm_M',
        },
      ],
    },
  },
  seo: {
    title: 'Portfolio of Armand Sumo',
    description:
      'Portfolio of Armand Sumo, Full-Stack Web Developer interested in spatial computing.',
    imageURL: '',
  },
  social: {
    linkedin: 'armand-sumo',
    twitter: '',
    mastodon: '',
    researchGate: '',
    facebook: '',
    instagram: '',
    reddit: '',
    threads: '',
    youtube: '', // example: 'pewdiepie'
    udemy: '',
    dribbble: '',
    behance: '',
    medium: '',
    dev: '',
    stackoverflow: '', // example: '1/jeff-atwood'
    skype: '',
    telegram: '',
    website: 'https://www.a-sumo@github.io',
    phone: '',
    email: 'armandsumo@gmail.com',
  },
  resume: {
    fileUrl: 'https://a-sumo.github.io/data/resume.pdf', // Empty fileUrl will hide the `Download Resume` button.
  },
  skills: [
    'Python',
    'JavaScript / TypeScript',
    'C#',
    'C++',
    'OpenXR',
    'React.js',
    'Vue.js',
    'Three.js',
    'Unity',
    'WebGL',
    'OpenGL',
  ],
  experiences: [
    {
      company: 'Hyperstep',
      position: 'XR Consultant',
      from: 'October 2024',
      to: 'Present',
      companyLink: '',
    },
    {
      company: 'Wanadev',
      position: '3D Front-end developer ',
      from: 'February 2024',
      to: 'August 2024',
      companyLink: 'www.wanadevdigital.fr/',
    },
    {
      company: 'DigitalProductSchool by UnternehmerTUM',
      position: 'Full-stack software developer',
      from: 'January 2023',
      to: 'July 2023',
      companyLink: 'www.digitalproductschool.io/',
    },
    {
      company: 'ArcelorMittal France',
      position: 'AR/VR Developer',
      from: 'March 2022',
      to: 'September 2022',
      companyLink: 'https://france.arcelormittal.com',
    },
  ],
  certifications: [],
  educations: [
    {
      institution: 'Institut Mines Télécom Nord Europe, Lille',
      degree: "Master's Degree in Engineering (Computer Science)",
      from: '2019',
      to: '2023',
    },
    {
      institution: 'Lycée Franklin Roosevelt',
      degree:
        "Bachelor Degree in Engineering (Classes Préparatoires Aux Grandes Ecoles d'ingénieur)",
      from: '2017',
      to: '2019',
    },
  ],
  publications: [],
  // Display articles from your medium or dev account. (Optional)
  blog: {
    source: '', // medium | dev
    username: '', // to hide blog section, keep it empty
    limit: 1, // How many articles to display. Max is 10.
  },
  googleAnalytics: {
    id: '', // GA3 tracking id/GA4 tag id UA-XXXXXXXXX-X | G-XXXXXXXXXX
  },
  // Track visitor interaction and behavior. https://www.hotjar.com
  hotjar: {
    id: '',
    snippetVersion: 6,
  },
  themeConfig: {
    defaultTheme: 'winter',

    // Hides the switch in the navbar
    // Useful if you want to support a single color mode
    disableSwitch: true,

    // Should use the prefers-color-scheme media-query,
    // using user system preferences, instead of the hardcoded defaultTheme
    respectPrefersColorScheme: false,

    // Display the ring in Profile picture
    displayAvatarRing: false,

    // Available themes. To remove any theme, exclude from here.
    themes: [
      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter',
      'dim',
      'nord',
      'sunset',
      'procyon',
    ],

    // Custom theme, applied to `procyon` theme
    customTheme: {
      primary: '#fc055b',
      secondary: '#219aaf',
      accent: '#e8d03a',
      neutral: '#2A2730',
      'base-100': '#E3E3ED',
      '--rounded-box': '3rem',
      '--rounded-btn': '3rem',
    },
  },

  // Optional Footer. Supports plain text or HTML.
  footer: `Copyright © Armand Sumo 2024`,

  enablePWA: true,
};

export default CONFIG;
