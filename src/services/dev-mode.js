export function isDevModeEnabledInLocalStorage() {
	try {
		const storageVal = localStorage.getItem('takuzu-dev-mode');
		if (storageVal == null) return null;
		return JSON.parse(storageVal);
	} catch {
		localStorage.removeItem('takuzu-dev-mode');
		return null;
	}
}