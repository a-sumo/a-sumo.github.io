export interface Blogger {
  name: string;
  handle?: string;
  url: string;
  description: string;
  avatar?: string;
  initials?: string;
}

export const blogroll: Blogger[] = [
  {
    name: "Joost van Schaik",
    handle: "LocalJoost",
    url: "https://localjoost.github.io/",
    description: "Mixed Reality and AR development with HoloLens, Magic Leap, Unity, and Spectacles.",
    avatar: "https://localjoost.github.io/assets/images/site-logo.png",
  },
  {
    name: "Dan Hollick",
    url: "https://www.makingsoftware.com/",
    description: "A reference manual for people who design and build software.",
    initials: "MS",
  },
];
