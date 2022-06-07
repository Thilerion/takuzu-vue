import { createSharedComposable } from '@vueuse/core';
import { computed, ref, watchEffect } from 'vue';

const useTouchDetection = () => {
	const lastInteractionType = ref(null);
	const coarsePointer = window?.matchMedia?.('(pointer: coarse)')?.matches ?? null;
	const lastInteractionWasTouch = computed(() => {
		if (lastInteractionType.value == null) {
			return coarsePointer;
		}
		return lastInteractionType.value === 'touch';
	})
	const hasTouched = ref(false);

	window.addEventListener('pointerdown', (ev) => {
		const { pointerType } = ev;
		if (!pointerType) {
			console.error('Pointer event without pointer type?', ev);
			return;
		}
		lastInteractionType.value = pointerType;
	}, { passive: true });

	const rootEl = document.documentElement;
	window.addEventListener('touchstart', (ev) => {
		hasTouched.value = true;
		rootEl.dataset.hasTouch = true;
	}, { once: true, passive: true });


	watchEffect(() => {
		const type = lastInteractionType.value;
		if (type != null) {
			rootEl.dataset.lastPointer = type;
			rootEl.dataset.lastTouch = !!lastInteractionWasTouch.value;
		}
	})

	return { hasTouched, lastInteractionType, lastInteractionWasTouch };
}

const sharedUseTouchDetection = createSharedComposable(useTouchDetection);

export { sharedUseTouchDetection as useTouchDetection };