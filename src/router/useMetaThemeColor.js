import { readonly, ref } from "vue"

export const useMetaThemeColor = ({
	defaultColor = 'white'
} = {}) => {
	// TODO: different colors for dark/light mode
	const metaEl = document.querySelector("meta[name=theme-color]");
	const getCurrentThemeColor = () => metaEl.getAttribute("content");
	
	const color = ref(getCurrentThemeColor());

	const setCurrentThemeColor = (value) => {
		metaEl.setAttribute("content", value);
		color.value = value;
	}

	return {
		color: readonly(color),
		setThemeColor: setCurrentThemeColor,
		updateThemeColorWithRouteMeta: (to, from) => {
			const newColor = to?.meta?.metaThemeColor ?? defaultColor;
			if (!newColor) {
				return;
			} else if (typeof newColor !== 'string') {
				console.warn('Meta theme-color should be a string.');
				console.warn({ newColor });
				return;
			}
			if (newColor !== color.value) {
				setCurrentThemeColor(newColor);
			}
		}
	}
}