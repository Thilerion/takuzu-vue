// TODO: compat check added 3-feb-2022, remove in the near future

export const DEBUG_MODE_LS_KEY = 'takuzu-debug-mode';
export const DEV_MODE_LS_KEY = 'takuzu-dev-mode';

export function isDebugModeEnabledInLocalStorage({ defaultValue = false } = {}) {
	try {
		const storageVal = localStorage.getItem(DEBUG_MODE_LS_KEY);
		if (storageVal == null) {
			// this only happens the first time this key is checked
			// because it sets "true" or "false"
			// check the previous implementation; which is devMode; and delete that key so it is never used again
			const devModeCheck = devModeCompatibilityCheck();
			if (devModeCheck) {
				persistDebugMode(true);
				localStorage.removeItem(DEV_MODE_LS_KEY);
				return true;
			}
			localStorage.removeItem(DEV_MODE_LS_KEY);
			const value = !!defaultValue;
			persistDebugMode(value);
			return value;
		}
		const enabled = JSON.parse(storageVal);
		return !!enabled;
	} catch {
		localStorage.setItem(DEBUG_MODE_LS_KEY, "false");
		return false;
	}
}

export const persistDebugMode = (enabled) => {
	localStorage.setItem(DEBUG_MODE_LS_KEY, JSON.stringify(enabled));
}

function devModeCompatibilityCheck() {
	try {
		const storageVal = localStorage.getItem(DEV_MODE_LS_KEY);
		if (storageVal == null) return null;
		return true;
	} catch {
		localStorage.removeItem(DEV_MODE_LS_KEY);
		return false;
	}
}