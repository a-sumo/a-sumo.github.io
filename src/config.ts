import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://a-sumo.github.io/", // replace this with your deployed domain
  author: "Armand Sumo",
  profile: "https://a-sumo.github.io",
  desc: "Armand Sumo's Blog about technology, design and social philosophy.",
  title: "Armand Sumo",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: false,
  postPerIndex: 5,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  editPost: {
    url: "https://github.com/a-sumo/a-sumo.github.io/edit/main/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: true,
  svg: false,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  // Row 1: Professional
  {
    name: "Github",
    href: "https://github.com/a-sumo",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/armand-sumo/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:sumovero@proton.me",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  // Row 2: Social/Content
  {
    name: "Instagram",
    href: "https://www.instagram.com/plasma_holographics/",
    linkTitle: `Plasma Holographics on Instagram`,
    active: false,
  },
  {
    name: "X",
    href: "https://x.com/bodhictt",
    linkTitle: `${SITE.title} on X`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@s-curvilinear",
    linkTitle: `${SITE.title} on YouTube`,
    active: true,
  },
  // Row 3: Support (Ko-fi moved to end)
  {
    name: "Facebook",
    href: "",
    linkTitle: `${SITE.title} on Facebook`,
    active: false,
  },
  {
    name: "Twitch",
    href: "r",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: false,
  },
  {
    name: "Snapchat",
    href: "",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false,
  },
  {
    name: "Pinterest",
    href: "",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false,
  },
  {
    name: "TikTok",
    href: "",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "CodePen",
    href: "",
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: "Discord",
    href: "",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: "Skype",
    href: "",
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: "Steam",
    href: "",
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: "Telegram",
    href: "",
    linkTitle: `${SITE.title} on Telegram`,
    active: false,
  },
  {
    name: "Mastodon",
    href: "",
    linkTitle: `${SITE.title} on Mastodon`,
    active: false,
  },
  {
    name: "SoundCloud",
    href: "https://soundcloud.com/scurvilinear",
    linkTitle: `${SITE.title} on SoundCloud`,
    active: false,
  },
  {
    name: "kofi-icon",
    href: "https://ko-fi.com/a_sumo",
    linkTitle: `Support ${SITE.title} on Ko-fi`,
    active: true,
  },
];
