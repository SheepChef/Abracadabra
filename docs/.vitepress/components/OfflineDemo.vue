<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const scene = ref(null);
const inView = ref(true);
let observer;

onMounted(() => {
  if (typeof IntersectionObserver === "undefined" || !scene.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      inView.value = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.1 },
  );
  observer.observe(scene.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <div ref="scene" class="offline-demo" :class="{ active: inView }" aria-hidden="true">
    <div class="offline-stage">
      <svg class="offline-visual" viewBox="0 0 480 280" fill="none">
        <defs>
          <radialGradient id="enclave-glow" cx="36%" cy="50%" r="42%">
            <stop offset="0%" stop-color="#98dbc5" stop-opacity="0.11" />
            <stop offset="55%" stop-color="#c68cff" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#17171c" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="grid-vignette" cx="38%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
          <pattern id="precision-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="0.8" fill="#ffffff" fill-opacity="0.065" />
          </pattern>
          <mask id="precision-mask">
            <rect width="480" height="280" fill="url(#grid-vignette)" />
          </mask>
          <linearGradient id="tile-fill" x1="174" y1="106" x2="174" y2="174" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#22202b" />
            <stop offset="100%" stop-color="#15151a" />
          </linearGradient>
          <linearGradient id="tile-rim" x1="174" y1="106" x2="174" y2="174" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#98dbc5" stop-opacity="0.48" />
            <stop offset="48%" stop-color="#c68cff" stop-opacity="0.22" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.06" />
          </linearGradient>
          <linearGradient id="seam-grad" x1="0" y1="52" x2="0" y2="228" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0.13" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
        </defs>

        <rect width="480" height="280" fill="url(#precision-dots)" mask="url(#precision-mask)" />
        <rect width="480" height="280" fill="url(#enclave-glow)" />

        <!-- Subtle precision crosshairs framing the local enclave -->
        <g stroke="#ffffff" stroke-opacity="0.14" stroke-width="1">
          <path d="M80 49 v6 M77 52 h6" />
          <path d="M268 49 v6 M265 52 h6" />
          <path d="M80 225 v6 M77 228 h6" />
          <path d="M268 225 v6 M265 228 h6" />
        </g>

        <!-- Local enclave concentric rings -->
        <circle cx="174" cy="140" r="94" stroke="#ffffff" stroke-opacity="0.07" stroke-width="1" />
        <circle cx="174" cy="140" r="68" stroke="#ffffff" stroke-opacity="0.09" stroke-width="1" />

        <!-- Contained local pulse & orbital trace -->
        <circle class="enclave-ripple" cx="174" cy="140" r="38" stroke="#98dbc5" stroke-width="1" vector-effect="non-scaling-stroke" />
        <circle class="enclave-orbit" cx="174" cy="140" r="68" stroke="#98dbc5" stroke-width="1.5" stroke-linecap="round" />

        <!-- Specular hardware/enclave glass tile -->
        <rect
          x="140"
          y="106"
          width="68"
          height="68"
          rx="16"
          fill="url(#tile-fill)"
          stroke="url(#tile-rim)"
          stroke-width="1.1"
        />
        <rect
          x="141.5"
          y="107.5"
          width="65"
          height="65"
          rx="14.5"
          stroke="#ffffff"
          stroke-opacity="0.04"
          stroke-width="1"
        />

        <!-- Canonical Lucide Lock centered at (174, 140) -->
        <g
          transform="translate(162 128)"
          stroke="#ece7f2"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" fill="#c68cff" fill-opacity="0.08" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16.5" r="1.2" fill="#98dbc5" stroke="none" />
        </g>

        <!-- Air-gap hairline divider -->
        <line x1="306" y1="52" x2="306" y2="228" stroke="url(#seam-grad)" stroke-width="1" />

        <!-- Dormant canonical Lucide Cloud-Off centered at (384, 140) -->
        <g transform="translate(384 140) scale(1.65) translate(-12 -12)">
          <path
            d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
            fill="#17171c"
            stroke="#5a5368"
            stroke-width="1.35"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <line
            x1="4.5"
            y1="4.5"
            x2="19.5"
            y2="19.5"
            stroke="#17171c"
            stroke-width="3.2"
            stroke-linecap="round"
          />
          <line
            x1="4.5"
            y1="4.5"
            x2="19.5"
            y2="19.5"
            stroke="#6a617a"
            stroke-width="1.35"
            stroke-linecap="round"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.offline-demo {
  min-width: 0;
  padding: 5px;
  border: 1px solid #ffffff16;
  border-radius: 13px;
  overflow: hidden;
  background: #202026;
  box-shadow: 0 24px 64px #06050a4d;
}

.offline-stage {
  border: 1px solid #ffffff12;
  border-radius: 9px;
  background: #17171c;
  overflow: hidden;
}

.offline-visual {
  display: block;
  width: 100%;
  height: auto;
}

.enclave-orbit {
  transform-origin: 174px 140px;
  stroke-dasharray: 68 359.26;
  stroke-opacity: 0.72;
  animation: enclave-spin 6.4s linear infinite;
  animation-play-state: paused;
}

.enclave-ripple {
  transform-origin: 174px 140px;
  opacity: 0;
  animation: enclave-pulse 3.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  animation-play-state: paused;
}

.active .enclave-orbit,
.active .enclave-ripple {
  animation-play-state: running;
}

@keyframes enclave-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes enclave-pulse {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  18% {
    opacity: 0.36;
  }
  100% {
    transform: scale(2.42);
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .offline-demo {
    padding: 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .offline-demo * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
