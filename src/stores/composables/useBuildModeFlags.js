import { readonly } from "vue";

export const useBuildModeFlags = () => {
	return readonly({
		devMode: import.meta.env.DEV,
		productionMode: import.meta.env.PROD,
		appMode: import.meta.env.MODE,
	})
}