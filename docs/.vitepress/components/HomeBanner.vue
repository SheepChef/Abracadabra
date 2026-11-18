<script setup>
import { withBase } from "vitepress";
import BannerField from "./BannerField.vue";
defineProps({
  tokens: { type: Array, default: () => [] },
  reducedMotion: Boolean,
});
</script>

<template>
  <section class="home-banner" aria-labelledby="home-title">
    <div class="banner-art" aria-hidden="true">
      <BannerField :tokens="tokens" :paused="reducedMotion" />
    </div>
    <div class="banner-copy">
      <p class="banner-kicker">
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 2v16M2 10h16M4.5 4.5l11 11m0-11-11 11" />
        </svg>
        <span>ABRACADABRA</span>
        <span class="kicker-divider">·</span>
        <span>魔曰</span>
      </p>
      <h1 id="home-title">
        <span>把消息加密成<span class="banner-ink">古文</span></span><span>熔古铸今，韵入密语</span>
      </h1>
      <p class="banner-description">
        将现代密码与古典文学相融合的加密方案<br />让密文呈现古文和诗词的模样，加解密在本地完成
      </p>
      <div class="banner-actions">
        <a class="banner-primary" :href="withBase('/document/quick-start.html')">快速开始
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
          </svg></a><a class="banner-secondary" href="https://github.com/SheepChef/Abracadabra" target="_blank"
          rel="noopener noreferrer">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path fill="currentColor" stroke="none"
              d="M8 1.5a6.5 6.5 0 0 0-2.05 12.67c.32.06.44-.14.44-.31v-1.21c-1.8.39-2.18-.76-2.18-.76-.29-.75-.72-.95-.72-.95-.59-.4.04-.39.04-.39.65.05.99.67.99.67.58.99 1.52.7 1.89.54.06-.42.23-.7.41-.86-1.44-.16-2.95-.72-2.95-3.2 0-.71.25-1.29.67-1.74-.07-.16-.29-.82.06-1.72 0 0 .55-.18 1.79.66a6.2 6.2 0 0 1 3.26 0c1.24-.84 1.79-.66 1.79-.66.35.9.13 1.56.06 1.72.42.45.67 1.03.67 1.74 0 2.49-1.52 3.04-2.96 3.2.23.2.44.6.44 1.21v1.79c0 .17.12.38.45.31A6.5 6.5 0 0 0 8 1.5Z" />
          </svg>GitHub 仓库</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-banner {
  position: relative;
  min-height: 540px;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  padding: 78px 30px 70px;
  background: #1b1b1f;
  border-bottom: 1px solid #ffffff12;
}

.banner-art {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  user-select: none;
}

.banner-copy {
  text-align: center;
  position: relative;
  padding: 24px 28px;
  background: radial-gradient(ellipse 82% 74% at 50% 50%,
      #1b1b1fd9 0%,
      #1b1b1fa6 56%,
      transparent 100%);
}

.banner-kicker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font: 11px/1.5 var(--vp-font-family-mono);
  letter-spacing: 1px;
  color: #b8aec7;
}

.banner-kicker svg {
  stroke: #c68cff;
  fill: none;
  stroke-width: 1.3;
  width: 14px;
  height: 14px;
  margin-right: 1px;
}

.kicker-divider {
  color: #6f607f;
  margin: 0 1px;
}

.banner-copy h1 {
  font-family:
    "Recife Text", "Iowan Old Style", Georgia, var(--abra-font-serif);
  font-size: clamp(1.625rem, 1.15rem + 1.8vw, 2.75rem);
  line-height: 1.18;
  letter-spacing: -0.03em;
  font-weight: 300;
  margin: 24px 0 0;
  color: #eee8f2;
  text-wrap: balance;
}

.banner-copy h1>span {
  display: block;
  width: fit-content;
  margin-inline: auto;
}

.banner-copy h1>span+span {
  margin-top: 0.22em;
}

.banner-ink {
  color: #c68cff;
}

.banner-description {
  font-size: 14px;
  color: #b0a6b9;
  line-height: 1.85;
  margin-top: 22px;
}

.banner-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  font-size: 14px;
}

.banner-actions a {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 18px;
  border-radius: 8px;
  font-weight: 500;
  line-height: 1;
  transition:
    background 0.22s,
    border-color 0.22s,
    color 0.22s,
    transform 0.22s,
    box-shadow 0.22s;
}

.banner-primary {
  background: linear-gradient(180deg, #c68cff38 0%, #9b5ae024 100%);
  color: #f3ecff !important;
  border: 1px solid #c68cff61;
  box-shadow:
    inset 0 1px 0 #ffffff24,
    0 6px 20px #9f5ae61c;
}

.banner-primary svg,
.banner-secondary svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.banner-primary svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.banner-primary:hover {
  background: linear-gradient(180deg, #c68cff4d 0%, #9b5ae033 100%);
  border-color: #c68cff8c;
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 #ffffff2e,
    0 8px 24px #c68cff26;
}

.banner-primary:hover svg {
  transform: translateX(3px);
}

.banner-secondary {
  background: #ffffff06;
  color: #cbc2d8 !important;
  border: 1px solid #ffffff16;
  box-shadow: inset 0 1px 0 #ffffff0c;
}

.banner-secondary svg {
  opacity: 0.78;
  transition: opacity 0.22s;
}

.banner-secondary:hover {
  background: #ffffff0d;
  border-color: #ffffff2a;
  color: #efeaf6 !important;
  transform: translateY(-1px);
}

.banner-secondary:hover svg {
  opacity: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .banner-kicker {
    animation: banner-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.04s both;
  }

  .banner-copy h1 {
    animation: banner-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
  }

  .banner-description {
    animation: banner-rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both;
  }

  .banner-actions {
    animation: banner-rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
  }

  .banner-footnote {
    animation: banner-rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.38s both;
  }
}

@keyframes banner-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
    filter: blur(4px);
  }

  to {
    opacity: 1;
    transform: none;
    filter: blur(0);
  }
}

.home-banner a:focus-visible {
  outline: 2px solid #c68cff;
  outline-offset: 5px;
}

@media (max-width: 960px) {
  .home-banner {
    min-height: 500px;
    padding-top: 56px;
  }
}

@media (max-width: 640px) {
  .home-banner {
    min-height: 460px;
    padding: 40px 16px 58px;
  }

  .banner-copy {
    padding: 16px 12px;
  }

  .banner-description {
    font-size: 13px;
    line-height: 1.85;
    margin-top: 17px;
  }

  .banner-kicker {
    font-size: 11px;
    gap: 4px;
    letter-spacing: 0.8px;
  }

  .banner-kicker svg {
    width: 13px;
    height: 13px;
  }

  .banner-actions {
    font-size: 13px;
    gap: 10px;
    margin-top: 24px;
  }

  .banner-actions a {
    min-height: 36px;
    padding: 0 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-banner * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
