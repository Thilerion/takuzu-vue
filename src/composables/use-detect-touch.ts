import { createSharedComposable, tryOnScopeDispose } from "@vueuse/core";
import { ref, watchEffect } from "vue";

export const initTouchDetectionDataAttrs = createSharedComposable(() => {
	// Set event listeners on window to detect pointer events. Toggle a boolean to indicate if it was a touch event, or a "fine" pointer event such as mouse or pen.
	// A data attribute is set on the document element to indicate if the last interaction was touch or not. This defaults to (window?.matchMedia?.('(pointer: coarse)').matches

	const rootEl = document.documentElement;
	const primaryPointerMm = window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';

	// Default "lastTouch" to the matchMedia coarse pointer before any interactions have been made
	const lastTouch = ref(primaryPointerMm === 'coarse');

	function updateLastTouchDataAttr(value: boolean) {
		rootEl.dataset.lastTouch = String(value);
	}
	function handlePointerDown(ev: PointerEvent) {
		const { pointerType } = ev;
		if (!isKnownPointerType(pointerType)) return;
		lastTouch.value = pointerType === 'touch';
	}

	window.addEventListener('pointerdown', handlePointerDown, { passive: true });

	watchEffect(() => {
		updateLastTouchDataAttr(lastTouch.value);
	})

	tryOnScopeDispose(() => {
		window.removeEventListener('pointerdown', handlePointerDown);
	});
})

type KnownPointerType = 'mouse' | 'pen' | 'touch';
const isKnownPointerType = (pointerType: string): pointerType is KnownPointerType => {
	return ['mouse', 'pen', 'touch'].includes(pointerType);
}