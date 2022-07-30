// Source: https://github.com/GoogleChromeLabs/proxx/blob/80f93fbefb3d22cb12fc4b9ba486f33908c35d4e/src/main/services/state/best-times.ts#L46-L54
export function persistStorage({
	preventPermissionPrompt = true
} = {}) {
	const supported = !!(navigator?.storage?.persist);

	if (!supported) {
		console.warn('StorageManager is not supported; persistStorage failed.');
		return;
	}

	// firefox shows permission prompt
	const isExcluded = preventPermissionPrompt ? navigator.userAgent.includes('Firefox/') : false;

	if (isExcluded) {
		console.warn('User agent is Firefox, which shows a permission prompt for persist storage, which should be excluded. PersistStorage failed.');
		return;
	}

	return navigator.storage.persist();
}

export async function estimateStorage() {
	try {
		if (navigator.storage && navigator.storage.estimate) {
			const estimate = await navigator.storage.estimate();

			const { quota, usage } = estimate;

			if (quota == null || usage == null) {
				throw new Error('Quota and/or usage in storage.estimate() are undefined.');
			}

			const quotaMB = quota / 1024 / 1024;
			const usageMB = usage / 1024 / 1024;
			const percentageUsed = usage / quota;

			console.log({ quota, usage, quotaMB, usageMB, percentageUsed });
			return {
				quota,
				usage,
				quotaMB,
				usageMB,
				percentageUsed
			};
		} else {
			console.error('StorageManager not found.');
		}
	} catch (e) {
		console.warn('Error while estimating storage.');
		console.error(e);
	}
	return null;
}