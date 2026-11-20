import { onMounted, onBeforeUnmount, ref, watch } from "vue";
// A local clock advances only while its scene is visible. Mouse/keyboard readers
// can hold a scene still; touching a control never leaves an artificial hover.
export function useSceneClock(element, { pauseOnHover = true } = {}) {
  const time = ref(0),
    reduced = ref(false),
    held = ref(false),
    locked = ref(false),
    visible = ref(false);
  let observer,
    timer,
    media,
    hovered = false,
    focused = false,
    last = 0;
  const updateHold = () => (held.value = hovered || focused || locked.value);
  watch(locked, updateHold);
  const enter = (e) => {
    if (e.pointerType !== "touch") {
      hovered = true;
      updateHold();
    }
  };
  const leave = () => {
    hovered = false;
    if (!element.value?.querySelector(":focus-visible")) focused = false;
    updateHold();
  };
  const focus = (e) => {
    focused = e.target.matches(":focus-visible");
    updateHold();
  };
  const blur = (e) => {
    if (!element.value?.contains(e.relatedTarget)) {
      focused = false;
      updateHold();
    }
  };
  const motion = () => (reduced.value = media.matches);
  onMounted(() => {
    media = matchMedia("(prefers-reduced-motion: reduce)");
    motion();
    media.addEventListener("change", motion);
    observer = new IntersectionObserver(
      (entries) => (visible.value = entries[0].isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(element.value);
    if (pauseOnHover) {
      element.value.addEventListener("pointerenter", enter);
      element.value.addEventListener("pointerleave", leave);
      element.value.addEventListener("focusin", focus);
      element.value.addEventListener("focusout", blur);
    }
    last = performance.now();
    timer = setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - last, 180);
      last = now;
      if (visible.value && !reduced.value && !held.value && !document.hidden)
        time.value += delta;
    }, 100);
  });
  onBeforeUnmount(() => {
    clearInterval(timer);
    observer?.disconnect();
    media?.removeEventListener("change", motion);
    element.value?.removeEventListener("pointerenter", enter);
    element.value?.removeEventListener("pointerleave", leave);
    element.value?.removeEventListener("focusin", focus);
    element.value?.removeEventListener("focusout", blur);
  });
  return {
    time,
    reduced,
    held,
    locked,
    visible,
    seek: (value) => {
      time.value = value;
      last = performance.now();
    },
  };
}
