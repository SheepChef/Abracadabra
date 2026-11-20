<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
const props = defineProps({
  tokens: { type: Array, default: () => [] },
  paused: Boolean,
});
const canvas = ref(null);
let context, base, baseContext, resizeObserver, intersectionObserver, banner;
let frame = 0,
  width = 0,
  height = 0,
  dpr = 1,
  visible = false,
  disposed = false;
let elapsed = 0,
  previous = 0,
  lastPaint = 0,
  glyphs = [],
  copyBounds;
const pointer = { inside: false, x: 0, y: 0 };
const light = { x: 0, y: 0, initialized: false };
const palette = ["#c68cff", "#98dbc5", "#edb597"];
const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function idlePosition() {
  const t = elapsed / 1000;
  return {
    x: width * (0.5 + 0.34 * Math.sin(t * 0.18 - 1)),
    y: height * (0.5 + 0.31 * Math.sin(t * 0.23 + 0.7)),
  };
}
function copyAttenuation(x, y) {
  if (!copyBounds) return 1;
  const dx = Math.max(copyBounds.left - x, 0, x - copyBounds.right);
  const dy = Math.max(copyBounds.top - y, 0, y - copyBounds.bottom);
  const floor = width < 700 ? 0.24 : 0.13;
  return (
    floor +
    (1 - floor) * smoothstep(0, width < 700 ? 40 : 76, Math.hypot(dx, dy))
  );
}
function typeset() {
  if (!baseContext || !width || !height) return;
  base.width = Math.round(width * dpr);
  base.height = Math.round(height * dpr);
  baseContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  const compact = width < 700,
    size = compact ? 18 : 21,
    advance = compact ? 21 : 25,
    line = compact ? 28 : 32;
  const font = `${size}px "Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC", "Source Han Serif CN", "Songti SC", STSong, SimSun, "Abra Serif Fallback", serif`;
  baseContext.font = font;
  baseContext.textBaseline = "middle";
  baseContext.textAlign = "left";
  const field = canvas.value.getBoundingClientRect(),
    copy = banner.querySelector(".banner-copy")?.getBoundingClientRect();
  copyBounds = copy
    ? {
      left: copy.left - field.left - 14,
      right: copy.right - field.left + 14,
      top: copy.top - field.top - 4,
      bottom: copy.bottom - field.top + 4,
    }
    : null;
  glyphs = [];
  if (!props.tokens.length) {
    draw();
    return;
  }
  // Continuous wallpaper: whitespace from source paragraphs never creates gaps.
  const content = props.tokens.filter((token) => !/\s/u.test(token.char));
  if (!content.length) {
    draw();
    return;
  }
  const rows = Math.ceil(height / line) + 1;
  const fullColumns = Math.ceil(width / advance) + 1;
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < fullColumns; column++) {
      const token = content[(row * fullColumns + column) % content.length];
      const x = column * advance - 2,
        y = size / 2 + row * line;
      const attenuation = copyAttenuation(x, y);
      baseContext.globalAlpha = 0.16 * attenuation;
      baseContext.fillStyle = "#b2a6bd";
      baseContext.fillText(token.char, x, y);
      glyphs.push({
        x,
        y,
        char: token.char,
        payload: token.payload,
        tone: token.tone,
        attenuation,
      });
    }
  baseContext.globalAlpha = 1;
  context.font = font;
  context.textBaseline = "middle";
  context.textAlign = "left";
  draw();
}
function draw() {
  if (!context || !width || !height) return;
  context.clearRect(0, 0, width, height);
  context.globalAlpha = 1;
  context.drawImage(base, 0, 0, width, height);
  if (!light.initialized) {
    Object.assign(light, idlePosition(), { initialized: true });
  }
  const compact = width < 700,
    rx = compact ? 150 : 265,
    ry = compact ? 112 : 158;
  const phase = elapsed / 1000;
  const rotation = 0.16 * Math.sin(phase * 0.19);
  const cos = Math.cos(rotation),
    sin = Math.sin(rotation);
  // A slowly changing, multi-lobed light field. The feathered contour is
  // evaluated at glyph positions; there is no circular gradient or halo.
  for (const glyph of glyphs) {
    const dx = glyph.x - light.x,
      dy = glyph.y - light.y;
    if (Math.abs(dx) > rx * 1.6 || Math.abs(dy) > ry * 1.6) continue;
    const nx = (dx * cos + dy * sin) / rx,
      ny = (-dx * sin + dy * cos) / ry;
    const angle = Math.atan2(ny, nx);
    const radius =
      1 +
      0.23 * Math.sin(angle * 3 + phase * 0.23) +
      0.14 * Math.cos(angle * 5 - phase * 0.17) +
      0.08 * Math.sin(angle * 2 + phase * 0.11);
    const distance = Math.hypot(nx, ny) / radius;
    const intensity = 1 - smoothstep(0.42, 1.08, distance);
    if (intensity < 0.008) continue;
    if (glyph.payload) {
      context.globalAlpha = intensity * 0.91 * glyph.attenuation;
      context.fillStyle = palette[glyph.tone];
      context.fillText(glyph.char, glyph.x, glyph.y);
    } else {
      context.globalAlpha = intensity * 0.1 * glyph.attenuation;
      context.fillStyle = "#cfc5db";
      context.fillText(glyph.char, glyph.x, glyph.y);
    }
  }
  context.globalAlpha = 1;
}
function tick(now) {
  frame = 0;
  if (!visible || props.paused || document.hidden) {
    previous = 0;
    return;
  }
  const delta = previous ? Math.min(now - previous, 80) : 0;
  previous = now;
  elapsed += delta;
  const target = pointer.inside ? pointer : idlePosition();
  const ease = 1 - Math.exp(-delta / (pointer.inside ? 85 : 650));
  light.x += (target.x - light.x) * ease;
  light.y += (target.y - light.y) * ease;
  if (now - lastPaint > 32) {
    draw();
    lastPaint = now;
  }
  frame = requestAnimationFrame(tick);
}
function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  previous = 0;
  draw();
  if (visible && !props.paused && !document.hidden)
    frame = requestAnimationFrame(tick);
}
function resize() {
  const bounds = canvas.value.getBoundingClientRect();
  pointer.inside = false;
  width = bounds.width;
  height = bounds.height;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.value.width = Math.round(width * dpr);
  canvas.value.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (light.initialized) {
    light.x = Math.max(0, Math.min(width, light.x));
    light.y = Math.max(0, Math.min(height, light.y));
  }
  typeset();
}
function move(event) {
  if (event.pointerType === "touch" || props.paused) return;
  const bounds = canvas.value.getBoundingClientRect();
  pointer.x = event.clientX - bounds.left;
  pointer.y = event.clientY - bounds.top;
  pointer.inside =
    pointer.x >= 0 &&
    pointer.x <= width &&
    pointer.y >= 0 &&
    pointer.y <= height;
}
function leave() {
  pointer.inside = false;
}
function onVisibility() {
  if (document.hidden) pointer.inside = false;
  sync();
}
onMounted(() => {
  context = canvas.value.getContext("2d");
  if (!context) return;
  base = document.createElement("canvas");
  baseContext = base.getContext("2d");
  banner = canvas.value.closest(".home-banner");
  banner.addEventListener("pointermove", move, { passive: true });
  banner.addEventListener("pointerleave", leave, { passive: true });
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.value);
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) pointer.inside = false;
      sync();
    },
    { threshold: 0.05 },
  );
  intersectionObserver.observe(canvas.value);
  document.addEventListener("visibilitychange", onVisibility);
  document.fonts?.ready?.then(() => {
    if (!disposed && baseContext && props.tokens.length) typeset();
  });
});
watch(
  () => props.tokens,
  () => {
    if (baseContext) typeset();
  },
);
watch(() => props.paused, sync);
onBeforeUnmount(() => {
  disposed = true;
  cancelAnimationFrame(frame);
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  banner?.removeEventListener("pointermove", move);
  banner?.removeEventListener("pointerleave", leave);
  document.removeEventListener("visibilitychange", onVisibility);
});
</script>

<template>
  <canvas ref="canvas" class="banner-field" aria-hidden="true"></canvas>
</template>
<style scoped>
.banner-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
