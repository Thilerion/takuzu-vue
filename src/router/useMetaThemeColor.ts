import { readonly, ref } from "vue";
import type { RouteLocationNormalized } from "vue-router";

export const useMetaThemeColor = ({
	defaultColor = 'white'
} = {}) => {
	// TODO: different colors for dark/light mode
	const metaEl = document.querySelector("meta[name=theme-color]");
	const getCurrentThemeColor = () => metaEl!.getAttribute("content");
	
	const color = ref(getCurrentThemeColor());

	const setCurrentThemeColor = (value: string) => {
		metaEl!.setAttribute("content", value);
		color.value = value;
	}

	return {
		color: readonly(color),
		setThemeColor: setCurrentThemeColor,
		updateThemeColorWithRouteMeta: (to: RouteLocationNormalized) => {
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