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
	
			const { quota, usage, usageDetails } = estimate;
	
			const quotaMB = quota / 1024 / 1024;
			const usageMB = usage / 1024 / 1024;
			const percentageUsed = usage / quota;
	
			console.log({ quota, usage, usageDetails, quotaMB, usageMB, percentageUsed });
			return {
				...estimate,
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