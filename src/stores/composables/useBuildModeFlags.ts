import type { AppMode } from "env";
import { readonly } from "vue";

export interface BuildModeFlags {
	devMode: boolean,
	productionMode: boolean,
	appMode: AppMode
}

export const useBuildModeFlags = () => {
	const flags: BuildModeFlags = {
		devMode: import.meta.env.DEV,
		productionMode: import.meta.env.PROD,
		appMode: import.meta.env.MODE as AppMode
	}
	return readonly(flags);
}