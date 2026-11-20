<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { withBase } from "vitepress";
import { getDilutionCorpus, markPayload } from "./homeCipher.js";
import { DEMO_KEY, PAYLOAD_ALPHABET, DILUTION_PRESET } from "./homePresets.js";
import { useSceneClock } from "./useSceneClock.js";
import { useTouchScrollLock } from "./useTouchScrollLock.js";
const props = defineProps({ loadEngine: Function });
const scene = ref(null);
const dilutionBox = ref(null);
const clock = useSceneClock(scene);
const styles = [
  { name: "古文", filter: "ESSAY", poem: "ALL" },
  { name: "五言", filter: "POEM", poem: "FIVE" },
  { name: "七言", filter: "POEM", poem: "SEVEN" },
  { name: "词", filter: "LYRIC", poem: "ALL" },
];
const initialTokens = markPayload(DILUTION_PRESET.text, PAYLOAD_ALPHABET);
const initialVisible = initialTokens.filter((t) => !/\s/u.test(t.char));
const initialSample = {
  text: DILUTION_PRESET.text,
  tokens: initialTokens,
  length: initialVisible.length,
  payload: initialVisible.filter((t) => t.payload).length,
  plain: DILUTION_PRESET.input,
  style: DILUTION_PRESET.style,
  verse: false,
};
const style = ref(0),
  target = ref(0.18),
  distribution = ref("UNIFORM"),
  showPayload = ref(true),
  busy = ref(false),
  error = ref(""),
  result = ref(initialSample),
  baseline = ref({ length: DILUTION_PRESET.baselineLength });
const input = DILUTION_PRESET.input,
  key = DEMO_KEY;
let api,
  corpus,
  encoded,
  alphabet,
  initialized = false,
  disposed = false,
  ticket = 0;
const cache = new Map([["0-0.18-UNIFORM", initialSample]]);
const {
  unlocked: paperUnlocked,
  clipped: paperClipped,
  onTap: onPaperTap,
} = useTouchScrollLock(dilutionBox, () => result.value?.text);
const bins = computed(() => {
  const tokens = result.value?.tokens.filter((t) => !/\s/u.test(t.char)) || [];
  return Array.from({ length: 40 }, (_, index) => {
    const slice = tokens.slice(
      Math.floor((index * tokens.length) / 40),
      Math.floor(((index + 1) * tokens.length) / 40)
    );
    return slice.length
      ? slice.filter((t) => t.payload).length / slice.length
      : 0;
  });
});
const density = computed(() =>
  result.value
    ? ((result.value.payload / result.value.length) * 100).toFixed(1)
    : "—"
);
const expansion = computed(() => {
  if (!result.value || !baseline.value?.length) return null;
  return (result.value.length / baseline.value.length).toFixed(1);
});
async function generate(refresh = false) {
  if (refresh) initialized = true;
  if (!initialized || disposed) return;
  const selected = styles[style.value];
  const cacheKey = style.value + "-" + target.value + "-" + distribution.value;
  const cached = !refresh && cache.get(cacheKey);
  if (cached) {
    ticket++;
    error.value = "";
    busy.value = false;
    result.value = cached;
    return;
  }
  const job = ++ticket;
  busy.value = true;
  error.value = "";
  // Let the control state paint before the synchronous engine runs.
  await new Promise((resolve) => setTimeout(resolve, 24));
  try {
    api ||= await props.loadEngine();
    if (disposed || job !== ticket) return;
    const [
      { Abracadabra },
      { WenyanConfig, AdvancedEncConfig, DilutionConfig },
      { WenyanSimulator },
    ] = api;
    if (!corpus) {
      corpus = getDilutionCorpus(Abracadabra);
      alphabet = new WenyanSimulator(key).PayloadLetter;
      const original = new Abracadabra();
      original.WenyanInput(
        input,
        "ENCRYPT",
        key,
        new WenyanConfig(),
        new AdvancedEncConfig()
      );
      const text = original.Output();
      encoded = new WenyanSimulator(key).deMap(text, key);
      baseline.value = {
        length: Array.from(text).filter((c) => !/\s/u.test(c)).length,
      };
    }
    const config = new DilutionConfig(
      true,
      target.value,
      selected.filter,
      selected.poem,
      "SMART",
      distribution.value,
      corpus,
      true,
      50
    );
    const text = new WenyanSimulator(key).enMap(
      encoded,
      true,
      25,
      [20, 80],
      false,
      false,
      false,
      config
    );
    // Confirm both the exact encrypted payload and the normal public decoder.
    if (new WenyanSimulator(key).deMap(text, key) !== encoded)
      throw Error("Dilution changed encrypted payload");
    const check = new Abracadabra();
    check.WenyanInput(text, "DECRYPT", key);
    if (check.Output() !== input) throw Error("Dilution round-trip failed");
    const tokens = markPayload(text, alphabet),
      visible = tokens.filter((t) => !/\s/u.test(t.char));
    const sample = {
      text,
      tokens,
      length: visible.length,
      payload: visible.filter((t) => t.payload).length,
      plain: check.Output(),
      style: selected.name,
      verse: selected.poem !== "ALL",
    };
    cache.set(cacheKey, sample);
    if (job === ticket) result.value = sample;
  } catch {
    error.value = "暂时无法生成稀释样例，请重试。";
  } finally {
    if (job === ticket) busy.value = false;
  }
}
const AUTO_PLAY_MS = 4000;
function selectStyle(index) {
  if (busy.value) return;
  style.value = index;
  clock.seek(index * AUTO_PLAY_MS);
}
watch(
  () => Math.floor(clock.time.value / AUTO_PLAY_MS) % styles.length,
  (index) => {
    if (!busy.value) style.value = index;
  }
);
watch([style, target, distribution], () => {
  initialized = true;
  generate();
});
watch(clock.visible, (visible) => {
  if (visible && !initialized) {
    initialized = true;
  }
});
onBeforeUnmount(() => {
  disposed = true;
  ticket++;
});
</script>

<template>
  <section
    id="dilution-showcase"
    class="feature-section dilution-section"
    aria-labelledby="dilution-title"
  >
    <div class="dilution-copy">
      <span class="section-label">新功能 · 密文稀释</span>
      <h2 id="dilution-title">一纸密语<br /><span>散入诗词曲赋</span></h2>
      <p>
        以海量真实古文和诗词为底本，将加密汉字直接稀释到真实古文之间，增强密文风貌，字面意境亦与密文无关。
      </p>
      <p>
        目标载荷率愈低，结果愈长，实际载荷占比亦因随机选句略有浮动。稀释不改变加密强度，接收方解密无需预设任何参数。
      </p>
      <a :href="withBase('/document/dilution.html')"
        >了解密文稀释 <span aria-hidden="true">↗</span></a
      >
    </div>
    <div ref="scene" class="dilution-demo" :aria-busy="busy">
      <div
        class="dilution-styles"
        role="group"
        aria-label="稀释文体"
        :style="{ '--n': styles.length, '--i': style }"
      >
        <span class="style-pill" aria-hidden="true"></span>
        <button
          v-for="(item, index) in styles"
          :key="item.name"
          type="button"
          :disabled="busy"
          :aria-pressed="style === index"
          @click="selectStyle(index)"
        >
          {{ item.name }}
        </button>
      </div>
      <div class="dilution-stage">
        <div class="dilution-controls">
          <div class="density-control">
            <span>目标载荷率</span>
            <div class="seg-group" role="group" aria-label="稀释目标载荷率">
              <button
                v-for="rate in [0.18, 0.1]"
                :key="rate"
                type="button"
                :disabled="busy"
                :aria-pressed="target === rate"
                @click="target = rate"
              >
                {{ (rate * 100).toFixed(0) }}%
              </button>
            </div>
          </div>
          <div
            class="distribution-control seg-group"
            role="group"
            aria-label="载荷分布"
          >
            <button
              type="button"
              :disabled="busy"
              :aria-pressed="distribution === 'UNIFORM'"
              @click="distribution = 'UNIFORM'"
            >
              均匀</button
            ><button
              type="button"
              :disabled="busy"
              :aria-pressed="distribution === 'CONCENTRATE'"
              @click="distribution = 'CONCENTRATE'"
            >
              集中
            </button>
          </div>
        </div>
        <div class="sample-caption">
          <span
            >原文<b>「{{ input }}」</b></span
          >
          <div class="sample-actions">
            <button
              type="button"
              class="tint-toggle"
              :aria-pressed="showPayload"
              @click="showPayload = !showPayload"
            >
              {{ showPayload ? "显露载荷" : "纯文面貌" }}
            </button>
            <button type="button" :disabled="busy" @click="generate(true)">
              {{ busy ? "落笔中…" : "再写一篇" }}
              <span aria-hidden="true">↻</span>
            </button>
          </div>
        </div>
        <div class="dilution-paper" :class="{ 'is-unlocked': paperUnlocked }">
          <Transition name="poem-ink" mode="out-in">
            <div
              v-if="result"
              :key="result.text"
              ref="dilutionBox"
              class="dilution-text"
              :class="{
                verse: result.verse,
                'plain-ink': !showPayload,
                'is-clipped': paperClipped,
                'is-unlocked': paperUnlocked,
              }"
              tabindex="0"
              :aria-label="result.text"
              @click="onPaperTap"
            >
              <span
                v-for="(token, index) in result.tokens"
                :key="index"
                :class="
                  showPayload && token.payload
                    ? 'payload tone-' + token.tone
                    : ''
                "
                >{{ token.char }}</span
              >
            </div>
            <div v-else class="dilution-loading">正在整理语料，稍候落笔…</div>
          </Transition>
        </div>
        <div class="payload-distribution" aria-label="当前全文载荷密度分布">
          <div class="dist-head">
            <span>载荷分布</span>
          </div>
          <div class="payload-bars">
            <i
              v-for="(value, index) in bins"
              :key="index"
              :title="`第 ${index + 1} 段：约 ${Math.round(
                value * 100
              )}% 载荷字`"
              :style="{
                height: 2 + Math.min(1, value / 0.45) * 29 + 'px',
                opacity: 0.25 + Math.min(1, value / 0.45) * 0.75,
              }"
            ></i>
          </div>
        </div>
        <div class="dilution-stats">
          <div>
            <span>稀释篇幅</span>
            <p>
              {{ baseline?.length ?? "—" }} <span aria-hidden="true">→</span>
              <strong>{{ result?.length ?? "—" }}</strong
              ><small>字{{ expansion ? `（${expansion}×）` : "" }}</small>
            </p>
          </div>
          <div>
            <span>实际占比</span>
            <p class="density-number">{{ density }}<small>%</small></p>
          </div>
        </div>
      </div>
      <p v-if="error" class="dilution-error" role="alert">{{ error }}</p>
    </div>
  </section>
</template>

<style scoped>
.dilution-section {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: 56px;
  padding: 76px 0;
  border-bottom: 1px solid #ffffff12;
  background: radial-gradient(
    ellipse 62% 60% at 76% 48%,
    #c68cff0d 0%,
    transparent 72%
  );
}

.section-label {
  margin-left: 2px;
  display: block;
  font-size: 11px;
  color: #c68cff;
  letter-spacing: 1.2px;
  margin-bottom: 14px;
}

.dilution-copy h2 {
  font-family: var(--abra-font-serif);
  font-size: 34px;
  font-weight: 400;
  line-height: 1.38;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
  color: #efeaf5;
  text-wrap: balance;
}

.dilution-copy h2 > span {
  color: #b7a8c7;
}

.dilution-copy > p {
  font-size: 14px;
  line-height: 1.95;
  color: #a69fae;
  margin-top: 12px;
  text-wrap: pretty;
}

.dilution-copy > a {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #cba5e9;
  margin-top: 24px;
  text-decoration: none;
}

.dilution-copy > a:hover {
  color: #e0bdff;
}

.dilution-demo {
  min-width: 0;
  background: #202026;
  border-radius: 13px;
  padding: 4px;
  box-shadow: inset 0 0 0 1px #c68cff26, 0 14px 36px #00000036;
  overflow: hidden;
}

.dilution-styles {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr));
  border-radius: 7px;
  background: #16161b;
  box-shadow: inset 0 0 0 1px #ffffff0d;
  padding: 2px;
  margin: 4px 10px 8px;
}

.style-pill {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc((100% - 4px) / var(--n, 4));
  border-radius: 5px;
  background: #c68cff1f;
  box-shadow: inset 0 0 0 1px #c68cff38, 0 1px 2px #0005;
  transform: translateX(calc(var(--i, 0) * 100%));
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.dilution-styles button {
  position: relative;
  z-index: 1;
  background: none;
  padding: 7px 5px;
  color: #9687a3;
  font: 12px var(--vp-font-family-base);
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.25s;
}

.dilution-styles button[aria-pressed="true"] {
  color: #e2c6fa;
}

.dilution-stage {
  background: #17171c;
  border-radius: 9px;
  padding: 2px 15px 15px;
  box-shadow: inset 0 0 0 1px #ffffff0e, 0 1px 2px #0003;
}

.dilution-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 11px 0;
  border-bottom: 1px solid #ffffff0d;
  font-size: 11px;
  color: #9886a5;
}

.density-control {
  display: flex;
  align-items: center;
  gap: 9px;
}

.seg-group {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 5px;
  background: #121217;
  box-shadow: inset 0 0 0 1px #ffffff0a;
}

.dilution-controls button {
  background: none;
  padding: 4px 8px;
  border-radius: 3px;
  color: #9481a1;
  font: 11px var(--vp-font-family-mono);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, background 0.2s;
}

.dilution-controls button[aria-pressed="true"] {
  background: #c68cff1c;
  color: #dcbaf7;
}

.sample-caption {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 10px;
  margin-top: 12px;
  font-size: 11px;
  color: #8f829d;
}

.sample-caption b {
  font-weight: 400;
  color: #c2b2d0;
}

.sample-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sample-caption button {
  font: 11px var(--vp-font-family-base);
  padding: 3px 0;
  background: none;
  color: #a990bc;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}

.sample-caption button:hover {
  color: #d6b6f0;
}

.tint-toggle {
  color: #8b7b98 !important;
  border-bottom: 1px dashed #ffffff1f;
}

.tint-toggle[aria-pressed="true"] {
  color: #c68cff !important;
  border-bottom-color: #c68cff55;
}

.dilution-paper {
  margin-top: 11px;
  padding: 16px 14px;
  height: 224px;
  background: #131318;
  border: 1px solid #ffffff0b;
  border-radius: 6px;
  overflow: hidden;
}

.dilution-text {
  height: 190px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #66516f transparent;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: 16px/1.95 var(--abra-font-serif);
  letter-spacing: 0.7px;
  color: #a69baa;
  padding-right: 5px;
  transition: color 0.3s;
}

.dilution-text.plain-ink {
  color: #c8bfd0;
}

.dilution-text.verse {
  line-height: 1.85;
  letter-spacing: 1px;
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

.dilution-loading {
  color: #82748e;
  font-size: 12px;
  line-height: 1.9;
  padding-top: 28px;
}

.payload-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  font-size: 11px;
  color: #9683a3;
}

.dist-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.payload-bars {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 35px;
  padding: 2px 4px;
  border-radius: 4px;
  background: #131318;
  box-shadow: inset 0 0 0 1px #ffffff08;
  min-width: 0;
}

.payload-bars i {
  display: block;
  flex: 1;
  min-width: 1px;
  background: #b287cd;
  border-radius: 1px;
  transition: height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s;
}

.dilution-stats {
  display: flex;
  justify-content: space-between;
  gap: 17px;
  border-top: 1px solid #ffffff0c;
  margin-top: 15px;
  padding-top: 16px;
}

.dilution-stats > div:last-child {
  text-align: right;
}

.dilution-stats > div > span {
  font-size: 11px;
  color: #9681a5;
}

.dilution-stats p {
  font: 24px/1.5 var(--vp-font-family-mono);
  font-variant-numeric: tabular-nums;
  color: #8c769d;
  margin-top: 5px;
}

.dilution-stats p > span {
  font-size: 0.85em;
  vertical-align: 0.06em;
  color: #6a5978;
  margin: 0 5px;
}

.dilution-stats strong {
  font-weight: 400;
  color: #cfa4ee;
}

.dilution-stats small {
  font: 11px var(--vp-font-family-base);
  color: #927d9f;
  margin-left: 5px;
}

.dilution-stats .density-number {
  color: #98dbc5;
}

.dilution-error {
  font-size: 11px;
  color: #e5a2b4;
  padding: 9px 12px 6px;
}

.poem-ink-enter-active {
  transition: opacity 0.35s, filter 0.45s,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.poem-ink-leave-active {
  transition: opacity 0.15s, filter 0.15s;
}

.poem-ink-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(4px);
}

.poem-ink-leave-to {
  opacity: 0;
  filter: blur(3px);
}

.dilution-demo button:disabled {
  cursor: default;
}

.sample-actions button:disabled {
  opacity: 0.6;
}

.dilution-demo button:focus-visible,
.dilution-text:focus-visible,
.dilution-copy > a:focus-visible {
  outline: 2px solid #c68cff;
  outline-offset: 4px;
}

@media (max-width: 960px) {
  .dilution-section {
    gap: 35px;
    padding: 58px 0;
  }

  .dilution-copy h2 {
    font-size: 29px;
  }

  .dilution-demo {
    padding: 4px;
  }

  .dilution-stage {
    padding: 2px 12px 13px;
  }

  .dilution-controls {
    gap: 6px;
  }

  .density-control {
    gap: 6px;
  }

  .dilution-controls button {
    padding: 4px 6px;
  }

  .payload-bars {
    gap: 2px;
  }
}

@media (max-width: 640px) {
  .dilution-section {
    grid-template-columns: minmax(0, 1fr);
    gap: 25px;
    padding: 43px 0;
  }

  .section-label {
    margin-left: 2px;
    font-size: 11px;
  }

  .dilution-copy h2 {
    font-size: 26px;
    margin-bottom: 14px;
  }

  .dilution-copy > p {
    font-size: 13px;
  }

  .dilution-copy > a {
    font-size: 12px;
    margin-top: 18px;
  }

  .dilution-styles button {
    font-size: 11px;
  }

  .dilution-controls {
    font-size: 10px;
  }

  .dilution-paper {
    height: 232px;
    padding: 15px 12px;
  }

  .dilution-text {
    font-size: 15px;
    height: 200px;
  }

  .payload-distribution {
    gap: 9px;
    font-size: 10px;
  }

  .dilution-stats p {
    font-size: 20px;
  }

  .dilution-stats > div > span {
    font-size: 10px;
  }

  .dilution-proof {
    font-size: 10px;
  }

  .sample-caption {
    font-size: 10px;
  }
}

@media (hover: none), (pointer: coarse) {
  .dilution-text {
    overflow: hidden;
    touch-action: pan-y;
    -webkit-tap-highlight-color: transparent;
  }

  .dilution-text.is-clipped {
    -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent 100%);
    mask-image: linear-gradient(180deg, #000 72%, transparent 100%);
  }

  .dilution-text.is-unlocked {
    overflow: auto;
  }

  .dilution-paper.is-unlocked {
    border-color: #c68cff4d;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dilution-section * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
