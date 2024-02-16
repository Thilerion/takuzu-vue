import { onBeforeUnmount, nextTick, onMounted, ref, watchEffect, type Ref } from "vue";

/**
 * Helps with transitioning in different components in PuzzleRecap.
 * Shows the banner, then after a the transition is done, show the backdrop and content.
 */
export const usePuzzleRecapTransitionTimings = ({ enabled }: { enabled: Ref<boolean> }) => {
	const showBanner = ref(false);
	const showBackdrop = ref(false);
	const showContent = ref(false);

	let bannerAfterEnterTimeout: ReturnType<typeof setTimeout> | null = null;

	watchEffect(() => {
		if (enabled.value) {
			nextTick(() => showBanner.value = true);
		} else {
			showBanner.value = false;
			showBackdrop.value = false;
			showContent.value = false;
		}
	})

	onMounted(() => {
		showBanner.value = true;
	})

	onBeforeUnmount(() => {
		clearTimeout(bannerAfterEnterTimeout!);
		bannerAfterEnterTimeout = null;
	})

	const bannerAfterEnter = () => {
		clearTimeout(bannerAfterEnterTimeout!);
		bannerAfterEnterTimeout = globalThis.setTimeout(() => {
			showBackdrop.value = true;
			showBanner.value = false;
			showContent.value = true;
		}, 300);
	}

	return { showBanner, showBackdrop, showContent, bannerAfterEnter };
}