import { computed, ref } from "vue"

export const useMetaThemeColor = () => {
	const metaEl = document.querySelector("meta[name=theme-color]");
	const getCurrentThemeColor = () => metaEl.getAttribute("content");
	const setCurrentThemeColor = (value) => metaEl.setAttribute("content", value);

	const color = ref(getCurrentThemeColor);

	return computed({
		get() {
			return color.value;
		},
		set(value) {
			setCurrentThemeColor(value);
		}
	})
}