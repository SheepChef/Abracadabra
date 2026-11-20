<script setup>
import { computed, ref } from "vue";
import { useSceneClock } from "./useSceneClock.js";

const props = defineProps({
  packets: { type: Array, default: () => [] },
  result: String,
});

const scene = ref(null);
const clock = useSceneClock(scene, { pauseOnHover: false });
const progress = computed(() => clock.time.value % 12600);

const phase = computed(() =>
  clock.reduced.value
    ? 3
    : progress.value < 1000
      ? 0
      : progress.value < 5400
        ? 1
        : progress.value < 7600
          ? 2
          : 3,
);

const received = computed(() =>
  phase.value === 0
    ? 0
    : phase.value > 1
      ? props.packets.length
      : Math.min(
          props.packets.length,
          Math.ceil(
            (progress.value - 1000) /
              (4400 / Math.max(1, props.packets.length)),
          ),
        ),
);

const cards = computed(() => {
  const selected = props.packets;
  return phase.value >= 2
    ? [...selected].sort((a, b) => a.number - b.number)
    : selected;
});

const isReceived = (index) => phase.value >= 2 || index < received.value;

const arrivedNumbers = computed(() => {
  const set = new Set();
  props.packets.forEach((packet, index) => {
    if (isReceived(index)) set.add(packet.number);
  });
  return set;
});

const phaseLabel = computed(() => {
  if (phase.value === 0) return "等待分段抵达";
  if (phase.value === 1)
    return `多路乱序接收 · ${received.value}/${props.packets.length}`;
  if (phase.value === 2) return "自动辨序重组";
  return "完整还原明文";
});

const visibleTokens = (tokens) =>
  tokens.filter((t) => !/\s/u.test(t.char)).slice(0, 36);
</script>

<template>
  <div ref="scene" class="transfer-demo">
    <div class="transfer-stage">
      <div class="transfer-bar">
        <span class="transfer-phase">
          <i :class="{ sorting: phase === 2, done: phase === 3 }"></i>
          {{ phaseLabel }}
        </span>
        <div class="slot-meter" aria-hidden="true">
          <span
            v-for="slot in props.packets.length || 4"
            :key="slot"
            class="slot-pip"
            :class="{
              active: arrivedNumbers.has(slot),
              sorted: phase >= 2,
            }"
            >{{ String(slot).padStart(2, "0") }}</span
          >
        </div>
      </div>

      <div
        class="letter-stage"
        :class="{ sorting: phase === 2, assembled: phase === 3 }"
      >
        <TransitionGroup name="letter" tag="div" class="letter-stack">
          <div
            v-for="(packet, index) in cards"
            :key="packet.number"
            class="letter-row"
          >
            <div
              class="letter-card"
              :class="[
                'dir-' + (index % 4),
                {
                  received: isReceived(index),
                  sorted: phase >= 2,
                },
              ]"
            >
              <span class="letter-number">{{
                String(packet.number).padStart(2, "0")
              }}</span>
              <div class="letter-fragment">
                <span
                  v-for="(token, i) in visibleTokens(packet.tokens)"
                  :key="i"
                  :class="token.payload ? 'payload tone-' + token.tone : ''"
                  >{{ token.char }}</span
                >
              </div>
              <span class="letter-status" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <path d="M3.5 8.5 6.5 11.5 12.5 5" />
                </svg>
              </span>
            </div>
          </div>
        </TransitionGroup>

        <Transition name="unseal">
          <div v-if="phase === 3" class="whole-letter">
            <div class="letter-header">
              <div class="letter-title">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.25" />
                  <path d="M5.25 8.25 7.1 10.1 10.9 6.2" />
                </svg>
                <span>已重组还原</span>
              </div>
              <span class="letter-seq" aria-hidden="true">01 — 04</span>
            </div>
            <p>{{ result || "正在生成真实密文片段…" }}</p>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transfer-demo {
  min-width: 0;
  padding: 5px;
  border: 1px solid #ffffff16;
  border-radius: 13px;
  background: #202026;
  overflow: hidden;
  box-shadow: 0 24px 64px #06050a4d;
}

.transfer-stage {
  min-width: 0;
  border: 1px solid #ffffff12;
  border-radius: 9px;
  background: #17171c;
  padding: 14px 16px 16px;
  overflow: hidden;
}

.transfer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #ffffff0c;
}

.transfer-phase {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #a99db8;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.transfer-phase i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c68cff;
  transition: background 0.4s;
}

.transfer-phase i.sorting,
.transfer-phase i.done {
  background: #98dbc5;
}

.slot-meter {
  display: flex;
  align-items: center;
  gap: 4px;
}

.slot-pip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 18px;
  padding: 0 4px;
  border-radius: 4px;
  background: #121217;
  border: 1px solid #ffffff0a;
  font: 10px/1 var(--vp-font-family-mono);
  font-variant-numeric: tabular-nums;
  color: #5c5468;
  transition:
    color 0.35s,
    background 0.35s,
    border-color 0.35s;
}

.slot-pip.active {
  background: #c68cff16;
  border-color: #c68cff42;
  color: #dfbfff;
}

.slot-pip.sorted {
  background: #98dbc514;
  border-color: #98dbc542;
  color: #98dbc5;
}

.letter-stage {
  position: relative;
  min-width: 0;
  width: 100%;
  min-height: 227px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
}

.letter-stack {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
  width: 100%;
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.letter-row {
  position: relative;
  min-width: 0;
  width: 100%;
  min-height: 50px;
  border-radius: 8px;
}

.letter-row::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 8px;
  background: #131318;
  border: 1px dashed #ffffff0d;
  box-sizing: border-box;
  pointer-events: none;
}

.letter-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  width: 100%;
  min-height: 50px;
  border: 1px solid #ffffff1a;
  border-radius: 8px;
  padding: 9px 12px;
  background: #1b1a23;
  box-sizing: border-box;
  box-shadow:
    inset 0 1px 0 #ffffff10,
    0 6px 18px #0000002e;
  opacity: 0;
  filter: blur(4px);
  pointer-events: none;
  transition:
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.5s;
}

.letter-card.dir-0 {
  transform: translate3d(-44px, -10px, 0) scale(0.97);
}

.letter-card.dir-1 {
  transform: translate3d(44px, -6px, 0) scale(0.97);
}

.letter-card.dir-2 {
  transform: translate3d(-40px, 12px, 0) scale(0.97);
}

.letter-card.dir-3 {
  transform: translate3d(40px, 12px, 0) scale(0.97);
}

.letter-card.received {
  opacity: 1;
  filter: blur(0);
  transform: translate3d(0, 0, 0) scale(1);
  pointer-events: auto;
}

.letter-card.sorted {
  border-color: #98dbc533;
}

.letter-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border-radius: 5px;
  background: #c68cff14;
  border: 1px solid #c68cff38;
  font: 11px/1 var(--vp-font-family-mono);
  font-variant-numeric: tabular-nums;
  color: #ddb8ff;
  flex-shrink: 0;
  transition:
    color 0.45s,
    background 0.45s,
    border-color 0.45s;
}

.letter-card.sorted .letter-number {
  background: #98dbc512;
  border-color: #98dbc538;
  color: #98dbc5;
}

.letter-fragment {
  flex: 1 1 0%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  color: #c5bcd0;
  font: 16px/1.8 var(--abra-font-serif);
  letter-spacing: 0.6px;
  -webkit-mask-image: linear-gradient(90deg, #000 84%, transparent 100%);
  mask-image: linear-gradient(90deg, #000 84%, transparent 100%);
}

.letter-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #98dbc514;
  flex-shrink: 0;
}

.letter-status svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: #98dbc5;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sorting .letter-move {
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.assembled .letter-stack {
  opacity: 0.14;
  filter: blur(5px);
  transform: scale(0.96);
}

.whole-letter {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  border: 1px solid #98dbc533;
  border-radius: 9px;
  background: linear-gradient(180deg, #1d1f26f5 0%, #17181ef5 100%);
  box-shadow:
    inset 0 1px 0 #ffffff14,
    0 18px 42px #00000059;
  backdrop-filter: blur(8px);
}

.letter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 13px;
  margin-bottom: 14px;
  border-bottom: 1px solid #ffffff0d;
}

.letter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #98dbc5;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.letter-title svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: #98dbc5;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.letter-seq {
  font: 11px/1 var(--vp-font-family-mono);
  color: #827890;
  letter-spacing: 0.06em;
}

.whole-letter p {
  overflow-wrap: anywhere;
  color: #e4dfec;
  font-size: 14px;
  line-height: 1.9;
  margin: 0;
}

.unseal-enter-active {
  transition:
    filter 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.unseal-leave-active {
  transition:
    filter 0.25s,
    opacity 0.25s,
    transform 0.25s;
}

.unseal-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(6px) scale(0.98);
}

.unseal-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(-4px);
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

@media (max-width: 640px) {
  .transfer-demo {
    padding: 4px;
  }

  .transfer-stage {
    padding: 12px;
  }

  .transfer-bar {
    gap: 8px;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  .transfer-phase {
    font-size: 10px;
  }

  .slot-pip {
    min-width: 20px;
    height: 16px;
    font-size: 9px;
  }

  .letter-stage {
    min-height: 211px;
  }

  .letter-row {
    min-height: 46px;
  }

  .letter-card {
    min-height: 46px;
    padding: 8px 10px;
    gap: 9px;
  }

  .letter-number {
    min-width: 25px;
    height: 22px;
    font-size: 10px;
  }

  .letter-fragment {
    font-size: 15px;
  }

  .whole-letter {
    padding: 18px 16px;
  }

  .whole-letter p {
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .transfer-demo * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
