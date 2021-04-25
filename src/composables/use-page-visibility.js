import { ref } from 'vue';

let visibility;
let hidden;

export function usePageVisibility() {
	if (!hidden) {
		hidden = ref(document.hidden);
	}

	if (!visibility) {
		visibility = ref(document.visibilityState);
		document.addEventListener('visibilitychange', () => {
			visibility.value = document.visibilityState;
			hidden.value = document.hidden;
		}, true);
	}

	return {
		visibility,
		hidden
	};
}