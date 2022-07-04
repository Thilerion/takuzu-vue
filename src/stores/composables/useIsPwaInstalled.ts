import { ref } from "vue";

const isInstalled = ref(false);

const mm = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)');

isInstalled.value = !!mm.matches;
const check = () => {
	isInstalled.value = !!mm.matches;
	return isInstalled.value;
}

export const useIsPwaInstalled = () => {
	return { isInstalled, check };
}