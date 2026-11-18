<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import HomeBanner from "./HomeBanner.vue";
import HomeFeatures from "./HomeFeatures.vue";
import { markPayload } from "./homeCipher.js";
import {
  DEMO_KEY,
  PAYLOAD_ALPHABET,
  HERO_PRESET,
  BANNER_PRESET,
} from "./homePresets.js";

const modes = [
  { name: "散文", kind: "prose" },
  { name: "骈文", kind: "parallel" },
  { name: "论说", kind: "logic" },
];
const samples = [
  "今晚七点，老地方见。",
  "Hello, world. 你好，世界。",
  "山高水长，来日方长。",
];
const mode = ref(0);
const message = ref(samples[0]);
const cipher = ref(HERO_PRESET.cipher);
const original = ref(HERO_PRESET.input);
const revealed = ref(false);
const busy = ref(false);
const error = ref("");
const revision = ref(0);
const paused = ref(false);
const reducedMotion = ref(false);
const inView = ref(false);
const stage = ref(null);
const progress = ref(0);
const copied = ref(false);
const payloadAlphabet = ref(PAYLOAD_ALPHABET);
const bannerCipher = ref(BANNER_PRESET.cipher);
const output = computed(() => (revealed.value ? original.value : cipher.value));
const letters = computed(() =>
  markPayload(output.value, revealed.value ? "" : payloadAlphabet.value),
);
const bannerTokens = computed(() =>
  markPayload(bannerCipher.value, payloadAlphabet.value),
);
const running = computed(
  () => !paused.value && !reducedMotion.value && !revealed.value,
);
let engine, observer, timer, warmTimer, mediaQuery, copyTimer;
let disposed = false;
let sampleIndex = 0;

async function getEngine() {
  if (!engine)
    engine = Promise.all([
      import("../../../src/javascript/main.js"),
      import("../../../src/javascript/CoreHandler.js"),
      import("../../../src/javascript/ChineseMappingHelper.js"),
    ]).catch((e) => {
      engine = null;
      throw e;
    });
  return engine;
}

function warmOfflineModules() {
  // Load remaining client-side modules quietly after initial paint so going
  // offline before scrolling down never hits an uncached dynamic chunk.
  Promise.all([
    import("../../../src/javascript/CompressionHelper.js"),
    import("../../../src/javascript/Misc.js"),
    import("../../../src/javascript/EncryptHelper.js"),
    import("js-base64"),
  ]).catch(() => { });
}

async function generate(manual = false) {
  if (busy.value || !message.value.trim() || disposed) return;
  if (manual) paused.value = true;
  busy.value = true;
  error.value = "";
  copied.value = false;
  progress.value = 0;
  try {
    const [
      { Abracadabra },
      { WenyanConfig, AdvancedEncConfig },
      { WenyanSimulator },
    ] = await getEngine();
    if (disposed) return;
    const abra = new Abracadabra();
    const input = message.value;
    if (!payloadAlphabet.value)
      payloadAlphabet.value = new WenyanSimulator(DEMO_KEY).PayloadLetter;
    abra.WenyanInput(
      input,
      Abracadabra.ENCRYPT,
      DEMO_KEY,
      Object.assign(new WenyanConfig(), {
        PunctuationMark: true,
        RandomIndex: 50,
        RandomParagraphing: [20, 80],
        PianwenMode: mode.value === 1,
        LogicMode: mode.value === 2,
      }),
      new AdvancedEncConfig(),
    );
    const encrypted = abra.Output();
    abra.WenyanInput(encrypted, Abracadabra.DECRYPT, DEMO_KEY);
    const decrypted = abra.Output();
    if (decrypted !== input) throw new Error("Round-trip failed");
    cipher.value = encrypted;
    original.value = decrypted;
    revealed.value = false;
    revision.value++;
  } catch {
    error.value = "这次没能生成，请重试。你也可以打开完整 Demo。";
  } finally {
    busy.value = false;
  }
}
function selectMode(index) {
  if (busy.value) return;
  mode.value = index;
  generate(true);
}
function nextSample() {
  sampleIndex = (sampleIndex + 1) % samples.length;
  message.value = samples[sampleIndex];
  generate(true);
}
function toggleReveal() {
  paused.value = true;
  revealed.value = !revealed.value;
  revision.value++;
  progress.value = 0;
  copied.value = false;
}
function toggleAuto() {
  paused.value = !paused.value;
  if (!paused.value && revealed.value) {
    revealed.value = false;
    revision.value++;
  }
  progress.value = 0;
}
async function copyCipher() {
  try {
    await navigator.clipboard.writeText(cipher.value);
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 2200);
  } catch {
    error.value = "复制未成功，请选中文本手动复制。";
  }
}
function onMotionChange(event) {
  reducedMotion.value = event.matches;
}
onMounted(() => {
  mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.value = mediaQuery.matches;
  mediaQuery.addEventListener("change", onMotionChange);
  observer = new IntersectionObserver(
    (entries) => {
      inView.value = entries[0].isIntersecting;
    },
    { threshold: 0.15 },
  );
  observer.observe(stage.value);
  warmTimer = setTimeout(() => {
    if (!disposed) {
      getEngine().catch(() => { });
      warmOfflineModules();
    }
  }, 400);
  timer = setInterval(() => {
    if (
      !running.value ||
      !inView.value ||
      document.hidden ||
      busy.value ||
      error.value
    )
      return;
    progress.value += 1;
    if (progress.value >= 80) generate();
  }, 100);
});
onBeforeUnmount(() => {
  disposed = true;
  clearInterval(timer);
  clearTimeout(warmTimer);
  clearTimeout(copyTimer);
  observer?.disconnect();
  mediaQuery?.removeEventListener("change", onMotionChange);
});
</script>

<template>
  <div class="abra-home" :data-mode="modes[mode].kind" :class="{ 'reduce-motion': reducedMotion }">
    <HomeBanner :tokens="bannerTokens" :reduced-motion="reducedMotion" />
    <div class="landing-inner">
      <div class="landing-rail">
        <div class="demo-band">
          <div class="demo-intro">
            <h2>寻常一语，别有乾坤</h2>
            <p>加密与还原，皆在眼前</p>
          </div>
          <section ref="stage" class="live-stage" aria-label="魔曰真实加密演示" :aria-busy="busy">
            <div class="stage-toolbar">
              <div class="mode-options" role="group" aria-label="密文风格" :style="{ '--n': modes.length, '--i': mode }">
                <span class="mode-pill" aria-hidden="true"></span>
                <button v-for="(item, index) in modes" :key="item.kind" type="button" :aria-pressed="mode === index"
                  :disabled="busy" @click="selectMode(index)">
                  {{ item.name }}
                </button>
              </div>
              <button class="auto-control" :aria-pressed="!paused" type="button" @click="toggleAuto">
                <span class="status-dot" :class="{ active: running }" aria-hidden="true"></span>{{
                  paused ? "已暂停" : reducedMotion ? "静态展示" : "自动换一篇"
                }}<svg v-if="!paused" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M4 3v6M8 3v6" />
                </svg><svg v-else viewBox="0 0 12 12" aria-hidden="true">
                  <path d="m4 2 5 4-5 4z" />
                </svg>
              </button>
            </div>
            <div class="stage-core">
              <form class="message-line" @submit.prevent="generate(true)">
                <label for="home-message">原文</label><input id="home-message" v-model="message" maxlength="80"
                  autocomplete="off" spellcheck="false" @focus="paused = true" aria-describedby="demo-privacy" /><button
                  class="sample-button" type="button" :disabled="busy" @click="nextSample" aria-label="换一句示例原文">
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M3 5h2c4 0 6 10 10 10h2m-3-3 3 3-3 3M3 15h2c1.6 0 2.8-1.6 4-4M11 8c1.2-2 2.4-3 4-3h2m-3-3 3 3-3 3" />
                  </svg></button><button class="generate" :disabled="busy || !message.trim()" type="submit">
                  <svg :class="{ spinning: busy }" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M16 7a6.5 6.5 0 1 0 0 6M16 3v4h-4" />
                  </svg>{{ busy ? "落笔中" : "换一篇" }}
                </button>
              </form>
              <div class="writing" :class="{ 'is-revealed': revealed }">
                <div class="writing-margin">
                  <span>{{ revealed ? "明文" : "魔曰" }}</span><span class="margin-line"></span>
                </div>
                <div class="cipher-wrap">
                  <div :key="revision" class="cipher-text" :class="{ loading: !cipher }"
                    :aria-label="output || '正在加载魔曰引擎'" tabindex="0">
                    <template v-if="cipher"><span v-for="(letter, index) in letters" :key="index" class="glyph" :class="letter.payload ? 'payload tone-' + letter.tone : ''
                      " :style="{ '--arrival': Math.min(index * 5, 850) + 'ms' }" aria-hidden="true">{{ letter.char
                        }}</span></template><span v-else class="loading-text">正在载入魔曰引擎<span
                        class="loading-dots">…</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div class="stage-footer">
              <div class="cipher-meta">
                <template v-if="revealed">
                  <span class="verify-dot" aria-hidden="true">✓</span>
                  <span>已还原原文</span>
                </template>
                <span class="char-count" v-else-if="cipher">{{ Array.from(cipher).length }} 字</span>
              </div>
              <div class="result-actions">
                <button v-if="cipher" class="copy-button" type="button" @click="copyCipher">
                  {{ copied ? "已复制 ✓" : "复制密文" }}</button><button class="reveal-button" type="button"
                  :disabled="!cipher || busy" :aria-pressed="revealed" @click="toggleReveal">
                  {{ revealed ? "再观密文" : "还原原文" }}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
            <div class="refresh-track" aria-hidden="true">
              <span :style="{ transform: `scaleX(${progress / 80})` }"></span>
            </div>
          </section>
          <div class="under-stage">
            <p id="demo-privacy">公开演示密钥，仅供体验，切勿输入隐私信息。</p>
            <a class="dilution-jump" href="#dilution-showcase">查看密文稀释 ↓</a>
          </div>
          <p class="demo-error" v-if="error" role="alert">{{ error }}</p>
        </div>

        <HomeFeatures :load-engine="getEngine" :alphabet="payloadAlphabet" :cipher="cipher" :original="original" />
      </div>
    </div>
  </div>
</template>

<!-- These variables belong only to the homepage Layout, never :root or docs. -->
<style>
@font-face {
  font-family: "Abra Serif Fallback";
  src: url("/fonts/NotoSerifSC-Simplified.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: block;
}

.abra-landing {
  --vp-c-bg: #1b1b1f;
  --vp-c-bg-alt: #202025;
  --vp-c-bg-elv: #27272d;
  --vp-c-bg-soft: #27272d;
  --vp-nav-bg-color: #1b1b1f;
  --vp-c-text-1: #eae9ef;
  --vp-c-text-2: #aaa9b4;
  --vp-c-text-3: #8a8997;
  --vp-c-divider: #ffffff12;
  --vp-c-gutter: #ffffff12;
  --vp-input-switch-bg-color: #27272d;
  background: #1b1b1f;
  color: #eae9ef;
  color-scheme: dark;
}

.abra-landing .VPLocalNav {
  display: none;
}
</style>

<style scoped>
.abra-home {
  --purple: #c68cff;
  --mint: #98dbc5;
  --peach: #edb597;
  --accent: var(--purple);
  --surface: #202025;
  --line: #ffffff12;
  --abra-font-serif:
    "Noto Serif SC", "Noto Serif CJK SC", "Source Han Serif SC",
    "Source Han Serif CN", "Songti SC", STSong, SimSun, Georgia,
    "Abra Serif Fallback", serif;
  background: #1b1b1f;
  color: #eae9ef;
  overflow: hidden;
}

.abra-home[data-mode="parallel"] {
  --accent: var(--mint);
}

.abra-home[data-mode="logic"] {
  --accent: var(--peach);
}

.abra-home * {
  box-sizing: border-box;
}

.abra-home button,
.abra-home input {
  font: inherit;
}

.abra-home button {
  cursor: pointer;
}

.abra-home button:disabled {
  cursor: default;
  opacity: 0.45;
}

.abra-home button:focus-visible,
.abra-home input:focus-visible,
.cipher-text:focus-visible {
  outline: 2px solid var(--purple);
  outline-offset: 5px;
}

.landing-inner {
  max-width: 1120px;
  margin: auto;
  padding: 0 44px;
}

.landing-rail {
  position: relative;
}

.demo-band {
  padding: 54px 0 64px;
  border-bottom: 1px solid var(--line);
}

.demo-intro {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  padding: 0 0 22px;
  max-width: 880px;
  margin: auto;
}

.demo-intro h2 {
  font-family: var(--abra-font-serif);
  font-size: 34px;
  line-height: 1.35;
  font-weight: 400;
  letter-spacing: -0.02em;
  color: #efeaf5;
}

.demo-intro>p {
  font-size: 14px;
  color: #9e93a8;
  padding-bottom: 4px;
}

.live-stage {
  position: relative;
  max-width: 880px;
  margin: auto;
  padding: 4px 4px 0;
  border-radius: 13px;
  background: #202026;
  box-shadow:
    inset 0 0 0 1px #ffffff16,
    0 12px 32px #0000002e;
  overflow: hidden;
}

.stage-toolbar {
  padding: 8px 13px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.mode-options {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--n, 3), minmax(0, 1fr));
  padding: 2px;
  background: #16161b;
  box-shadow: inset 0 0 0 1px #ffffff0d;
  border-radius: 7px;
}

.mode-pill {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc((100% - 4px) / var(--n, 3));
  border-radius: 5px;
  background: color-mix(in srgb, var(--accent) 16%, #ffffff08);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent),
    0 1px 2px #0006;
  transform: translateX(calc(var(--i, 0) * 100%));
  transition:
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s,
    box-shadow 0.3s;
  pointer-events: none;
}

.mode-options button {
  position: relative;
  z-index: 1;
  padding: 5px 15px;
  border-radius: 5px;
  color: #9593a3;
  font-size: 12px;
  white-space: nowrap;
  background: transparent;
  transition: color 0.25s;
}

.mode-options button[aria-pressed="true"] {
  color: var(--accent);
}

.mode-options button:hover {
  color: #eee9f5;
}

.stage-core {
  border-radius: 9px;
  background: #17171c;
  box-shadow:
    inset 0 0 0 1px #ffffff0e,
    0 1px 2px #0003;
}

.auto-control {
  display: flex;
  gap: 7px;
  align-items: center;
  font-size: 11px !important;
  color: #9b98a8;
  background: none;
  padding: 8px 0;
  white-space: nowrap;
}

.status-dot {
  height: 4px;
  width: 4px;
  border-radius: 50%;
  background: #76727d;
}

.status-dot.active {
  background: var(--accent);
  animation: breathe 2.8s ease-in-out infinite;
}

.auto-control svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
  stroke-width: 1.3;
  fill: none;
  margin-left: 4px;
}

.message-line {
  padding: 12px 17px 10px;
  display: flex;
  align-items: center;
  gap: 13px;
  border-bottom: 1px solid var(--line);
}

.message-line label {
  color: #8e8b9c;
  font-size: 12px;
  white-space: nowrap;
}

.message-line input {
  flex: 1;
  min-width: 0;
  border: 0;
  border-radius: 3px;
  background: none;
  color: #d2cfe0;
  font-size: 13px;
  padding: 5px 0;
}

.message-line input:focus {
  color: #f2eef8;
}

.sample-button {
  padding: 5px;
  color: #84818e;
  background: none;
  display: flex;
  align-items: center;
}

.sample-button:hover {
  color: var(--purple);
}

.sample-button svg,
.generate svg {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.generate {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 11px;
  background: #ffffff07;
  border: 1px solid #ffffff12;
  border-radius: 5px;
  white-space: nowrap;
  color: #c5c2d3;
  font-size: 11px !important;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.generate:hover {
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}

.generate:hover svg {
  transform: rotate(45deg);
}

.generate svg {
  transition: transform 0.35s;
}

.generate svg.spinning {
  animation: spin 1s linear infinite;
}

.writing {
  display: flex;
  gap: 17px;
  padding: 18px 20px 8px;
  min-height: 181px;
}

.writing-margin {
  width: 15px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 15px;
  padding-top: 5px;
}

.writing-margin>span:first-child {
  writing-mode: vertical-rl;
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 6px;
  white-space: nowrap;
  transition: color 0.5s;
}

.margin-line {
  width: 1px;
  flex: 1;
  max-height: 95px;
  background: #ffffff0d;
}

.cipher-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.cipher-text {
  font-family: var(--abra-font-serif);
  font-size: 19px;
  line-height: 1.95;
  letter-spacing: 1.2px;
  color: #b4afbf;
  overflow-wrap: anywhere;
  max-height: 155px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #47424f transparent;
  width: 100%;
  padding-right: 8px;
  padding-bottom: 6px;
  transition: color 0.4s;
}

.glyph {
  animation: ink-in 0.65s both;
  animation-delay: var(--arrival);
}

.payload.tone-0 {
  color: #c68cff;
}

.payload.tone-1 {
  color: #98dbc5;
}

.payload.tone-2 {
  color: #edb597;
}

.is-revealed .cipher-text {
  font-family: var(--vp-font-family-base);
  font-size: 24px;
  letter-spacing: 0;
  color: #eeeaf3;
}

.is-revealed .glyph {
  color: inherit;
  animation: read-in 0.5s both;
  animation-delay: calc(var(--arrival) * 0.5);
}

.is-revealed .writing-margin>span:first-child {
  color: var(--mint);
}

.loading-text {
  font-family: var(--vp-font-family-base);
  font-size: 13px;
  color: #817d8d;
  letter-spacing: 0;
}

.loading-dots {
  animation: breathe 1.4s infinite;
}

.stage-footer {
  padding: 12px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 15px;
}

.cipher-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #938e9e;
  font-size: 11px;
}

.verify-dot {
  color: var(--mint);
  font-size: 11px;
}

.char-count {
  color: #827e8e;
  font-variant-numeric: tabular-nums;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.result-actions button {
  font-size: 11px;
  background: none;
  padding: 4px 0;
}

.copy-button {
  color: #9c97aa;
}

.copy-button:hover {
  color: #dcd5eb;
}

.reveal-button {
  color: var(--accent);
  transition: color 0.3s;
}

.reveal-button>span {
  margin-left: 5px;
  display: inline-block;
  transition: transform 0.2s;
}

.reveal-button:hover>span {
  transform: translate(2px, -2px);
}

.refresh-track {
  height: 2px;
  background: transparent;
}

.refresh-track>span {
  display: block;
  height: 100%;
  width: 100%;
  transform-origin: left;
  background: var(--accent);
  opacity: 0.45;
  transition:
    transform 0.1s linear,
    background 0.4s;
}

.under-stage {
  line-height: 1.75;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 20px;
  margin: 14px auto 0;
  max-width: 880px;
  font-size: 12px;
  color: #9e93a9;
}

.dilution-jump {
  color: #c9a6ea;
  text-decoration: none;
  font-size: 12px;
  transition: color 0.2s;
}

.dilution-jump:hover {
  color: #e3c9ff;
}

.demo-error {
  font-size: 12px;
  color: #f4afbc;
  margin: 10px auto 0;
  max-width: 880px;
}

@keyframes ink-in {
  from {
    opacity: 0;
    filter: blur(4px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes read-in {
  from {
    opacity: 0;
    filter: blur(3px);
  }

  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes breathe {

  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (min-width: 961px) {
  .abra-home {
    zoom: 1.1;
  }
}

@media (min-width: 1500px) {
  .landing-inner {
    max-width: 1180px;
  }
}

@media (max-width: 960px) {
  .landing-inner {
    padding: 0 30px;
  }

  .cipher-text {
    font-size: 18px;
  }

  .demo-intro h2 {
    font-size: 29px;
  }
}

@media (max-width: 640px) {
  .landing-inner {
    padding: 0 20px;
  }

  .demo-band {
    padding: 36px 0 46px;
  }

  .demo-intro {
    padding: 0 0 16px;
    gap: 10px;
  }

  .demo-intro h2 {
    font-size: 26px;
  }

  .demo-intro>p {
    display: none;
  }

  .stage-toolbar {
    padding: 8px 9px 9px;
    gap: 8px;
  }

  .mode-options button {
    padding: 5px 11px;
    font-size: 11px;
  }

  .auto-control {
    font-size: 10px !important;
    gap: 5px;
  }

  .auto-control svg {
    margin-left: 0;
  }

  .message-line {
    padding: 11px 13px 10px;
    gap: 9px;
  }

  .message-line label {
    font-size: 11px;
  }

  .message-line input {
    font-size: 12px;
  }

  .sample-button {
    padding: 3px;
  }

  .sample-button svg {
    width: 14px;
  }

  .generate {
    font-size: 0 !important;
    padding: 6px;
  }

  .generate svg {
    width: 15px;
    height: 15px;
  }

  .writing {
    padding: 15px 14px 7px;
    gap: 12px;
    min-height: 206px;
  }

  .writing-margin {
    width: 12px;
  }

  .writing-margin>span:first-child {
    font-size: 10px;
    letter-spacing: 5px;
  }

  .cipher-text {
    font-size: 17px;
    line-height: 1.95;
    letter-spacing: 0.7px;
    max-height: 180px;
    padding-right: 3px;
  }

  .is-revealed .cipher-text {
    font-size: 21px;
  }

  .stage-footer {
    padding: 10px 13px;
    gap: 6px 10px;
  }

  .cipher-meta {
    font-size: 10px;
    gap: 5px;
  }

  .result-actions {
    gap: 12px;
  }

  .result-actions button {
    font-size: 11px;
  }

  .under-stage {
    align-items: flex-start;
    font-size: 11px;
    line-height: 1.7;
    gap: 4px 12px;
  }

  .under-stage>p {
    margin: 0;
  }
}

@media (max-width: 360px) {
  .landing-inner {
    padding: 0 15px;
  }

  .mode-options button {
    padding: 5px 9px;
  }

  .auto-control {
    font-size: 10px !important;
  }

  .result-actions {
    gap: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .abra-home *,
  .abra-home *::before,
  .abra-home *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }

  .glyph {
    opacity: 1 !important;
    filter: none !important;
  }
}
</style>
