---
layout: ../layouts/AboutLayout.astro
title: ""
---

<div style="text-align: center;">

## Armand Sumo

<div class="about-images">
<img src="/assets/armand_pic.jpg" alt="Armand" width="270" loading="eager" fetchpriority="high" decoding="async" />
<img src="/assets/armand-sumo-waterfall-cropped.jpg" alt="Armand at waterfall" width="270" loading="eager" decoding="async" />
</div>

<hr style="border: none; border-top: 2px dotted rgb(140, 169, 255); margin: 24px auto; width: 60%;" />

</div>

Software Engineer working at the intersection of web, 3D graphics, and wearable AR. I build tools and experiences that help people engage more fully with the world around them and within themselves.

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
.about-images {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}
.about-images img {
  border-radius: 8px;
}
@media (max-width: 600px) {
  .about-images img {
    width: 140px;
  }
}
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

<p style="font-size: 0.85em; opacity: 0.8;">If you'd like to support my work, you can <a href="https://ko-fi.com/asumo" class="kofi-link-about">buy me a coffee<img src="/assets/icons/kofi-icon.png" alt="Ko-fi" class="kofi-icon-about" /></a>.</p>

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