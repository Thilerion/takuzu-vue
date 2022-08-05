import { readonly, ref, type Ref } from "vue";
import type { RouteLocationNormalized } from 'vue-router';

export type UseMetaThemeColorOpts = {
	defaultColor?: string;
};

export const useMetaThemeColor = ({
	defaultColor = 'white'
}: UseMetaThemeColorOpts = {}) => {
	// TODO: different colors for dark/light mode
	const metaEl = document.querySelector('meta[name=theme-color]');

	const getCurrentThemeColor = () => {
	  return metaEl!.getAttribute('content') ?? null;
	};
  
	const initialColor = getCurrentThemeColor() ?? defaultColor;
	const color: Ref<string> = ref(initialColor);
  
	const setCurrentThemeColor = (value: string) => {
	  metaEl!.setAttribute('content', value);
	  color.value = value;
	};
  
	if (getCurrentThemeColor() == null) {
	  setCurrentThemeColor(color.value);
	}

	return {
		color: readonly(color),
		setThemeColor: setCurrentThemeColor,
		updateThemeColorWithRouteMeta: (to: RouteLocationNormalized) => {
		  const newColor = to.meta?.metaThemeColor;
		  if (newColor == null) return;
		  if (newColor !== color.value) {
			setCurrentThemeColor(newColor);
		  }
		},
	  };
}