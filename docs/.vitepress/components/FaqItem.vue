<script setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { withBase } from "vitepress";
const props = defineProps({ item: Object, index: Number, open: Boolean });
defineEmits(["toggle"]);
const body = ref(null);
let animation;
watch(
  () => props.open,
  (open) => {
    const el = body.value;
    if (!el) return;
    const inner = el.firstElementChild;
    const fromHeight = parseFloat(getComputedStyle(el).height) || 0,
      fromOpacity = getComputedStyle(el).opacity;
    animation?.cancel();
    const height = open ? parseFloat(getComputedStyle(inner).height) || 0 : 0;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.height = open ? "auto" : "0px";
      el.style.opacity = open ? "1" : "0";
      return;
    }
    el.style.height = fromHeight + "px";
    el.style.opacity = fromOpacity;
    const current = el.animate(
      [
        { height: fromHeight + "px", opacity: fromOpacity },
        { height: height + "px", opacity: open ? 1 : 0 },
      ],
      { duration: 360, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
    );
    animation = current;
    current.onfinish = () => {
      if (animation !== current) return;
      el.style.height = open ? "auto" : "0px";
      el.style.opacity = open ? "1" : "0";
      current.cancel();
      animation = null;
    };
  },
  { flush: "post" }
);
onBeforeUnmount(() => animation?.cancel());
</script>
<template>
  <div class="faq-item" :class="{ open }">
    <button
      class="question"
      type="button"
      :aria-expanded="open"
      :aria-controls="'home-answer-' + index"
      @click="$emit('toggle')"
    >
      <span>{{ item.q }}</span>
      <svg class="faq-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 3v10M3 8h10" />
      </svg>
    </button>
    <div
      ref="body"
      class="answer-body"
      :id="'home-answer-' + index"
      :inert="!open"
      :aria-hidden="!open"
      style="height: 0; opacity: 0"
    >
      <div class="answer-inner">
        <p>{{ item.a }}</p>
        <a :href="withBase('/document/' + item.link + '.html')"
          >{{ item.label }} <span aria-hidden="true">↗</span></a
        >
      </div>
    </div>
  </div>
</template>
<style scoped>
.faq-item {
  border-bottom: 1px solid #ffffff12;
}
.question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  padding: 18px 4px 18px 0;
  text-align: left;
  background: none;
  color: #cfc5d6;
  font: 14px/1.65 var(--vp-font-family-base);
  cursor: pointer;
}
.question > span {
  min-width: 0;
}
.faq-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: none;
  stroke: #9b88a8;
  stroke-width: 1.5;
  stroke-linecap: round;
  transition: transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.2s;
}
.open .question {
  color: #dab4f6;
}
.open .faq-icon {
  transform: rotate(45deg);
  stroke: #c68cff;
}
.answer-body {
  overflow: hidden;
}
.answer-inner {
  padding: 0 22px 22px 0;
}
.answer-inner p {
  font-size: 13px;
  line-height: 1.9;
  color: #aca0b7;
  margin: 0;
}
.answer-inner a {
  display: inline-block;
  text-decoration: none;
  font-size: 12px;
  color: #c99be9;
  margin-top: 12px;
}
.question:focus-visible,
.answer-inner a:focus-visible {
  outline: 2px solid #c68cff;
  outline-offset: 4px;
}
@media (max-width: 640px) {
  .question {
    font-size: 13px;
    padding: 16px 4px 16px 0;
  }
  .answer-inner p {
    font-size: 13px;
  }
  .answer-inner a {
    font-size: 11px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .faq-icon {
    transition: none;
  }
}
</style>
