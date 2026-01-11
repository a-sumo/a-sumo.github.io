---
layout: ../layouts/AboutLayout.astro
title: ""
---

<div style="text-align: center;">

## Armand Sumo

<img src="/assets/armand_pic.jpg" alt="Armand" width="270" style="border-radius: 8px;" loading="eager" fetchpriority="high" decoding="async" />

<hr style="border: none; border-top: 2px dotted rgb(140, 169, 255); margin: 24px auto; width: 60%;" />

</div>

Software Engineer working at the intersection of web, 3D graphics, and wearable AR. Building interfaces that feel natural and help people engage more fully with the world around them and within themselves.

Always happy to chat. Feel free to reach out on [LinkedIn](https://www.linkedin.com/in/armand-sumo/) or by email.

<div class="resume-section">
  <button class="resume-toggle" aria-expanded="false">
    <span class="resume-text">Resume</span> <span class="resume-arrow">+</span>
  </button>
  <div class="resume-options">
    <a href="https://docs.google.com/viewer?url=https://a-sumo.github.io/assets/Armand_Sumo_AR_Engineer_CV.pdf" target="_blank">View</a>
    <a href="/assets/Armand_Sumo_AR_Engineer_CV.pdf" download="Armand_Sumo_AR_Engineer_CV.pdf">Download</a>
  </div>
</div>

<style>
.resume-section {
  display: inline-block;
  margin-top: 16px;
}
.resume-toggle {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.resume-text {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.resume-toggle:hover {
  color: rgb(var(--color-accent));
}
.resume-arrow {
  font-size: 0.8em;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
}
.resume-options {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease, opacity 0.25s ease, margin 0.25s ease;
  opacity: 0;
  margin-top: 0;
}
.resume-section.open .resume-options {
  grid-template-rows: 1fr;
  opacity: 1;
  margin-top: 8px;
}
.resume-options > a {
  overflow: hidden;
  display: block;
  padding: 4px 0;
}
.resume-options a:hover {
  color: rgb(var(--color-accent));
}
.inspirations-section {
  margin-top: 8px;
  position: relative;
  max-height: 320px;
  overflow: hidden;
  transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: max-height;
}
.inspirations-section.revealed {
  max-height: 3000px;
}
.inspirations-heading {
  text-align: center;
  margin: 0 0 12px;
  font-size: 1.1em;
  font-weight: 500;
  position: relative;
  z-index: 3;
}
.inspirations-title {
  text-align: center;
  margin-bottom: 8px;
  font-size: 0.9em;
  font-style: normal;
  opacity: 0.8;
}
.inspirations-disclaimer {
  text-align: center;
  font-size: 0.8em;
  opacity: 0.6;
  margin-bottom: 24px;
  font-style: normal;
}
.inspirations-blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--color-fill), 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  cursor: pointer;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity;
  mask-image: linear-gradient(to bottom, transparent 0%, transparent 8%, black 25%, black 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, transparent 8%, black 25%, black 100%);
}
.inspirations-section.revealed .inspirations-blur-overlay {
  opacity: 0;
  pointer-events: none;
}
.inspirations-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  z-index: 4;
  background: none;
  border: 1px solid currentColor;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.inspirations-toggle:hover {
  opacity: 1;
}
.inspirations-toggle::before,
.inspirations-toggle::after {
  content: '';
  position: absolute;
  background: currentColor;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.inspirations-toggle::before {
  width: 12px;
  height: 1.5px;
}
.inspirations-toggle::after {
  width: 1.5px;
  height: 12px;
}
.inspirations-section.revealed .inspirations-toggle::after {
  transform: rotate(90deg);
  opacity: 0;
}
.inspirations-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.inspirations-grid .inspiration-card:last-child:nth-child(3n + 1) {
  grid-column: 2;
}
.inspiration-card {
  text-align: center;
  min-width: 0;
}
.inspiration-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}
.inspiration-card h4 {
  margin: 12px 0 4px;
  font-size: 1em;
}
.inspiration-card p {
  font-size: 0.85em;
  opacity: 0.8;
  margin: 0;
}
@media (max-width: 600px) {
  .inspirations-section {
    max-height: 280px;
  }
  .inspirations-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .inspirations-grid .inspiration-card:last-child:nth-child(2n + 1) {
    grid-column: 1 / -1;
    max-width: 50%;
    margin: 0 auto;
  }
}
</style>

<script is:inline>
(function() {
  function initResume() {
    const section = document.querySelector('.resume-section');
    const toggle = document.querySelector('.resume-toggle');

    if (!toggle || toggle.dataset.initialized) return;
    toggle.dataset.initialized = 'true';

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      section.classList.toggle('open');
      const isOpen = section.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
      const arrow = toggle.querySelector('.resume-arrow');
      if (arrow) arrow.textContent = isOpen ? '-' : '+';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResume);
  } else {
    initResume();
  }

  document.addEventListener('astro:page-load', initResume);
})();
</script>

<hr style="border: none; border-top: 2px dotted rgb(140, 169, 255); margin: 32px 0;" />

<div class="inspirations-section" id="inspirations-section">
  <h3 class="inspirations-heading">Inspirations</h3>
  <button class="inspirations-toggle" id="inspirations-toggle" aria-label="Toggle inspirations"></button>
  <p class="inspirations-title">People whose example pushes me to attempt the impossible and persevere, and who showed me that clear mindedness is the foundation of purposeful creation.</p>
  <p class="inspirations-disclaimer">This is one path among many, and everyone must find their own beacons.</p>
  <div class="inspirations-grid" id="inspirations-grid"></div>
  <div class="inspirations-blur-overlay" id="inspirations-overlay"></div>
</div>

<script is:inline>
const inspirations = [
  {
    name: "Nikola Tesla",
    image: "/assets/Individuals/Nikola-Tesla.jpeg",
    description: "Showed me that it is possible to bring the far future into the present. He also taught me to harness the power of mental pictures, a way of thinking I had but didn't understand until I discovered his method of visualizing inventions as real in the mind."
  },
  {
    name: "Daniel Schmachtenberger",
    image: "/assets/Individuals/Daniel-Schmachtenberger.jpg",
    description: "One of the clearest and most holistic thinkers of our time. He sharpened my thinking about complex systems and made me realize the utility of sensemaking."
  },
  {
    name: "R. Buckminster Fuller",
    image: "/assets/Individuals/R-Buckminster-Fuller.jpg",
    description: "Expanded my identity from citizen to Earthling. He introduced me to the grand picture of technology and its relationship to mankind, and continues to help me sharpen the geometry of my thinking."
  },
  {
    name: "Jetsunma Tenzin Palmo",
    image: "/assets/Individuals/Tenzin-Palmo.jpg",
    description: "Made me realize there were genuine super heroes walking on this Earth."
  },
  {
    name: "Walter Russell",
    image: "/assets/Individuals/Walter-Russell.jpg",
    description: "A renaissance man who convinced me that mastery across disciplines is possible in one lifetime. He made me understand the nature of Ideas and the path towards expressing them in their clearest form."
  },
  {
    name: "David Bohm",
    image: "/assets/Individuals/David-Bohm.jpg",
    description: "Helped me steer away from reductive thinking during my teenage years, without losing scientific rigor. He made me conceive individuals as light sources, aligned collective endeavor as a laser, and dialogue as essential to a well functioning group."
  },
  {
    name: "Ajahn Chah",
    image: "/assets/Individuals/Ajahn-Chah.webp",
    description: "'A diamond of the first water.' He showed me that profundity could be light-hearted, and boundlessness approachable."
  }
];

function renderInspirations() {
  const grid = document.getElementById('inspirations-grid');
  if (!grid) return;

  grid.innerHTML = inspirations.map(person => `
    <div class="inspiration-card">
      <img src="${person.image}" alt="${person.name}" loading="lazy" />
      <h4>${person.name}</h4>
      <p>${person.description}</p>
    </div>
  `).join('');
}

function initInspirationsReveal() {
  const section = document.getElementById('inspirations-section');
  const overlay = document.getElementById('inspirations-overlay');
  const toggle = document.getElementById('inspirations-toggle');
  if (!toggle || toggle.dataset.initialized) return;
  toggle.dataset.initialized = 'true';

  function toggleSection() {
    section.classList.toggle('revealed');
  }

  overlay.addEventListener('click', toggleSection);
  toggle.addEventListener('click', toggleSection);
}

renderInspirations();
initInspirationsReveal();
document.addEventListener('astro:page-load', () => {
  renderInspirations();
  initInspirationsReveal();
});
</script>

<hr style="border: none; border-top: 2px dotted rgb(140, 169, 255); margin: 32px 0;" />

<p style="font-size: 0.85em; opacity: 0.8;"><a href="https://ko-fi.com/asumo" class="kofi-link-about">Here's a link<img src="/assets/icons/kofi-icon.png" alt="Ko-fi" class="kofi-icon-about" /></a> if you'd like to support my work.</p>

<style>
.kofi-link-about {
  position: relative;
}
.kofi-icon-about {
  position: absolute;
  top: -1.6em;
  right: -1.4em;
  width: 1.6em;
  height: 1.6em;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.kofi-link-about:hover .kofi-icon-about {
  opacity: 1;
  animation: shake-about 0.5s ease-in-out infinite;
}
@keyframes shake-about {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-10deg); }
  40% { transform: rotate(10deg); }
  60% { transform: rotate(-10deg); }
  80% { transform: rotate(10deg); }
}
</style>