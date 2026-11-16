<script setup>
import { computed, ref } from "vue";
import { useSceneClock } from "./useSceneClock.js";
import { markPayload } from "./homeCipher.js";
const props = defineProps({
  trace: { type: Array, default: () => [] },
  alphabet: String,
});
const scene = ref(null);
const clock = useSceneClock(scene);
const durations = [1700, 2000, 2300, 2900, 3800];
const completedHold = 3000;
const cycleDuration = durations.reduce((a, b) => a + b, 0) + completedHold;
const position = computed(() => {
  let value = clock.time.value % cycleDuration;
  for (let i = 0; i < durations.length; i++) {
    if (value < durations[i])
      return { index: i, progress: value / durations[i] };
    value -= durations[i];
  }
  return { index: durations.length - 1, progress: 1 };
});
const selected = computed(() => props.trace[position.value.index]);
const frameIndex = computed(() =>
  Math.min(
    (selected.value?.frames.length || 1) - 1,
    Math.floor(position.value.progress * (selected.value?.frames.length || 1)),
  ),
);
const text = computed(
  () => selected.value?.frames[frameIndex.value] || "正在读取魔曰引擎…",
);
const chunks = computed(() => {
  const frames = selected.value?.frames || [];
  const tokens = markPayload(frames.at(-1) || "", props.alphabet || "");
  let start = 0;
  return frames.slice(0, frameIndex.value + 1).map((frame, index) => {
    const end = Array.from(frame).length;
    const chunk = { id: index, tokens: tokens.slice(start, end) };
    start = end;
    return chunk;
  });
});
const select = (i) => {
  clock.seek(
    durations.slice(0, i).reduce((a, b) => a + b, 0) + durations[i] * 0.95,
  );
};
</script>
<template>
  <div ref="scene" class="pipeline-demo">
    <div class="pipeline-stage">
      <div class="trace-tabs" role="group" aria-label="加密过程">
        <button
          v-for="(step, index) in trace"
          :key="step.title"
          :aria-pressed="position.index === index"
          type="button"
          @click="select(index)"
        >
          <span>{{ String(index + 1).padStart(2, "0") }}</span>{{ step.title
          }}<i
            :style="{
              transform: `scaleX(${position.index === index ? position.progress : 0})`,
            }"
          ></i>
        </button>
      </div>
      <div class="trace-window">
        <div class="trace-window-bar">
          <span>{{ selected?.format || "TEXT" }}</span
          ><span>{{ selected?.meta || "本地执行" }}</span>
        </div>
        <Transition name="materialize" mode="out-in"
          ><div
            :key="position.index"
            class="trace-text"
            :class="{ wenyan: position.index === 4 }"
          >
            <template v-if="position.index === 4"
              ><span v-for="chunk in chunks" :key="chunk.id" class="wenyan-chunk"
                ><span
                  v-for="(token, index) in chunk.tokens"
                  :key="index"
                  :class="token.payload ? 'payload tone-' + token.tone : ''"
                  >{{ token.char }}</span
                ></span
              ></template
            ><template v-else>{{ text }}</template>
          </div></Transition
        >
      </div>
    </div>
  </div>
</template>
<style scoped>
.pipeline-demo {
  min-width: 0;
  padding: 5px;
  border: 1px solid #ffffff16;
  border-radius: 13px;
  background: #202026;
  overflow: hidden;
  box-shadow: 0 24px 64px #06050a4d;
}
.pipeline-stage {
  border: 1px solid #ffffff12;
  border-radius: 9px;
  background: #17171c;
  padding-top: 8px;
}
.trace-tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 0 12px;
  gap: 5px;
}
.trace-tabs button {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  padding: 10px 0 12px;
  background: none;
  color: #8f7e99;
  font: 11px var(--vp-font-family-base);
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.3s,
    color 0.3s;
  border-radius: 5px 5px 0 0;
}
.trace-tabs button > span {
  font: 10px var(--vp-font-family-mono);
  color: #7c6b88;
}
.trace-tabs button[aria-pressed="true"] {
  background: #c68cff0e;
  color: #e0bdfc;
}
.trace-tabs button[aria-pressed="true"] > span {
  color: #c68cff;
}
.trace-tabs i {
  position: absolute;
  bottom: 0;
  height: 1px;
  background: #c68cff;
  width: 100%;
  transform-origin: left;
  transition: transform 0.1s linear;
}
.trace-window {
  margin: 0 14px 14px;
  border: 1px solid #ffffff10;
  border-radius: 7px;
  background: #131318;
  height: 227px;
  overflow: hidden;
}
.trace-window-bar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #ffffff0b;
  color: #8c789c;
  font: 11px var(--vp-font-family-mono);
}
.trace-text {
  padding: 17px 14px;
  color: #b5a3c4;
  font: 15px/1.85 var(--vp-font-family-mono);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  height: 182px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #65506f transparent;
}
.trace-text.wenyan {
  font:
    16px/1.9 STSong,
    SimSun,
    serif;
  color: #9f92ad;
  letter-spacing: 0.5px;
}
.wenyan-chunk {
  animation: reveal-chunk 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes reveal-chunk {
  from {
    opacity: 0;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
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
.materialize-enter-active {
  transition:
    opacity 0.28s,
    filter 0.38s,
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}
.materialize-leave-active {
  transition:
    opacity 0.12s,
    filter 0.12s;
}
.materialize-enter-from {
  opacity: 0;
  filter: blur(7px);
  transform: translateY(5px);
}
.materialize-leave-to {
  opacity: 0;
  filter: blur(4px);
}
.trace-tabs button:focus-visible {
  outline: 2px solid #c68cff;
  outline-offset: 3px;
}
@media (max-width: 640px) {
  .pipeline-demo {
    padding: 4px;
  }
  .trace-tabs {
    padding-inline: 10px;
    gap: 3px;
  }
  .trace-tabs button {
    font-size: 10px;
  }
  .trace-window {
    margin: 0 11px 11px;
    height: 223px;
  }
  .trace-window-bar {
    font-size: 10px;
  }
  .trace-text {
    font-size: 13px;
  }
  .trace-text.wenyan {
    font-size: 15px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pipeline-demo * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
