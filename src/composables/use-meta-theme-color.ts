import { useThemePreferences, type BaseTheme } from "@/features/settings/composables/use-theme-preferences.js";
import { createSharedComposable } from "@vueuse/core";
import { computed, readonly, ref, watch, type Ref } from "vue";
import { useRoute } from 'vue-router';

export type UseMetaThemeColorOpts = {
	defaultColor?: string;
};

const DEFAULT_META_THEME_COLORS: Record<BaseTheme, string> = {
	light: 'white',
	dark: '#1e293b'
}

export const useMetaThemeColor = ({
	defaultColor = 'white',
}: UseMetaThemeColorOpts = {}) => {
	const metaEl = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');

	const getCurrentThemeColor = () => {
		return metaEl?.getAttribute('content') ?? null;
	};
  
	const initialColor = getCurrentThemeColor() ?? defaultColor;
	const color: Ref<string> = ref(initialColor);
  
	const setCurrentThemeColor = (value: string) => {
		metaEl?.setAttribute('content', value);
		color.value = value;
	};
  
	if (getCurrentThemeColor() == null) {
		setCurrentThemeColor(color.value);
	}

	return {
		color: readonly(color),
		setThemeColor: setCurrentThemeColor,
	};
}

export const useUpdateThemeColorWithRouteAndTheme = createSharedComposable(() => {
	const route = useRoute();
	const routeMetaTheme = computed(() => route.meta?.metaThemeColors);

	const themePrefs = useThemePreferences();
	const currentTheme = computed(() => themePrefs.baseTheme.value);

	watch([routeMetaTheme, currentTheme], ([routeMetaTheme, currentTheme]) => {
		const { setThemeColor } = useMetaThemeColor();
		if (routeMetaTheme == null) {
			// Use default metaThemeColor (still based on currentTheme)
			setThemeColor(DEFAULT_META_THEME_COLORS[currentTheme]);
			return;
		}

		const newColor = routeMetaTheme[currentTheme];
		if (newColor == null) return;
		setThemeColor(newColor);

	}, { immediate: true })
});