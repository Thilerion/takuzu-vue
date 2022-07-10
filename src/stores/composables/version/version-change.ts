import type { Ref } from "vue";
import type { BuildVersionSummary, PersistedBuildVersionData } from "./types";

export const checkVersionChanged = (persistedData: PersistedBuildVersionData, updatedVersionSummary: BuildVersionSummary) => {
	const detailedVersionChanged = persistedData.current.detailedVersion !== updatedVersionSummary.detailedVersion;
	const pkgVersionChanged = persistedData.current.pkgVersion !== updatedVersionSummary.pkgVersion;

	if (detailedVersionChanged || pkgVersionChanged) {
		return {
			changed: true as const,
			pkgVersionChanged,
			detailedVersionChanged,

			previous: { ...persistedData.current } as BuildVersionSummary,
			current: {...updatedVersionSummary} as BuildVersionSummary
		}
	} else {
		return {
			changed: false,
			pkgVersionChanged: false,
			detailedVersionChanged: false
		} as const;
	}
}

export const updatePersistedVersions = (persistedDataRef: Ref<PersistedBuildVersionData>, { previous, current }: { previous: BuildVersionSummary, current: BuildVersionSummary }) => {
	console.log('Version in storage has changed:');
	console.log({
		previous: { ...previous },
		current: { ...current }
	});
	persistedDataRef.value = { previous, current };
}

export const initVersionChange = (
	persistedDataRef: Ref<PersistedBuildVersionData>,
	updatedVersionSummary: BuildVersionSummary
) => {
	const updateCheck = checkVersionChanged(persistedDataRef.value, updatedVersionSummary);
	if (updateCheck.changed) {
		const { previous, current } = updateCheck;
		updatePersistedVersions(persistedDataRef, { previous, current });
	}

	return {
		...updateCheck
	}
}