import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

export function useTouchScrollLock(boxRef, resetKey, contentKey) {
  const unlocked = ref(false);
  const clipped = ref(false);
  let touchQuery;

  function refresh() {
    const el = boxRef.value;
    if (!el || !touchQuery?.matches) {
      clipped.value = false;
      unlocked.value = false;
      return;
    }
    clipped.value = !unlocked.value && el.scrollHeight > el.clientHeight + 2;
  }

  function onTap() {
    const el = boxRef.value;
    if (!el || !touchQuery?.matches || unlocked.value) return;
    if (el.scrollHeight <= el.clientHeight + 2) return;
    if (window.getSelection?.()?.toString()) return;
    unlocked.value = true;
    clipped.value = false;
  }

  function onOutsidePointer(event) {
    if (!unlocked.value) return;
    if (boxRef.value && !boxRef.value.contains(event.target)) {
      unlocked.value = false;
      nextTick(refresh);
    }
  }

  if (resetKey) {
    watch(
      resetKey,
      () => {
        unlocked.value = false;
        nextTick(refresh);
      },
      { flush: "post" },
    );
  }

  if (contentKey) {
    watch(contentKey, () => nextTick(refresh), { flush: "post" });
  }

  watch(boxRef, () => nextTick(refresh), { flush: "post" });

  onMounted(() => {
    touchQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    touchQuery.addEventListener("change", refresh);
    document.addEventListener("pointerdown", onOutsidePointer, { passive: true });
    document.fonts?.ready?.then(() => nextTick(refresh));
    nextTick(refresh);
  });

  onBeforeUnmount(() => {
    touchQuery?.removeEventListener("change", refresh);
    document.removeEventListener("pointerdown", onOutsidePointer);
  });

  return { unlocked, clipped, onTap, refresh };
}
