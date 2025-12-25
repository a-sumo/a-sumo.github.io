---
layout: ../layouts/AboutLayout.astro
title: ""
---

<div style="text-align: center;">

## Armand Sumo

<img src="/assets/armand_pic.jpg" alt="Armand" width="200" height="200" loading="eager" fetchpriority="high" decoding="async" style="border-radius: 8px;" />

<hr style="border: none; border-top: 2px dotted rgb(140, 169, 255); margin: 24px auto; width: 60%;" />

</div>

Software Engineer exploring the intersection of web technologies, 3D graphics, and wearable AR. I'm interested in building interfaces that feel natural and help people engage more fully with the world around them and within themselves.

Outside of work, you'll find me running, dancing (popping and hip-hop), or lost in electronic music.

Always happy to chat. Feel free to reach out on [LinkedIn](https://www.linkedin.com/in/armand-sumo/) or by email.

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