import { useStorage } from "@vueuse/core";
import type { BuildVersionDetails } from "scripts/build-metadata";
import { ref, type Ref } from "vue";
import type { BuildVersionSummary, PersistedBuildVersionData } from "./types";
const LS_KEY = 'takuzu_build-version-data';

const isValidPersistedData = (value: unknown): value is PersistedBuildVersionData => {
	if (typeof value !== 'object' || value == null) return false;
	if (!('current' in value) || !('previous' in value)) return false;
	const curPkgVersion: string | null = (value as PersistedBuildVersionData).current?.pkgVersion;
	return curPkgVersion != null && curPkgVersion !== '';
}

const setInitialValue = (ref: Ref<PersistedBuildVersionData | undefined>, data: BuildVersionDetails) => {
	const { pkgVersion, detailedVersion, date: buildDateString } = data;
	const summary: BuildVersionSummary = { pkgVersion, detailedVersion, buildDateString };
	ref.value = {
		current: {
			...summary,
		},
		previous: null
	}
}
const checkInitialPersistedData = () => {
	try {
		const json = localStorage.getItem(LS_KEY);
		if (json == null) {
			// set default data
			return false;
		}
		const parsedValue = JSON.parse(json);
		if (!isValidPersistedData(parsedValue)) {
			// set default data
			return false;
		}
		return parsedValue;
	} catch (e) {
		// set default data
		console.warn(e);
		return false;
	}
}

export const initializePersistence = (details: BuildVersionDetails) => {
	const storedValueRef = ref<PersistedBuildVersionData>();
	const initialCheck = checkInitialPersistedData();
	let initializedToDefaults = false;
	if (!initialCheck) {
		setInitialValue(storedValueRef, details);
		initializedToDefaults = true;
	} else {
		storedValueRef.value = initialCheck;
	}

	const persistedVersionData = useStorage(
		LS_KEY,
		(storedValueRef as Ref<PersistedBuildVersionData>),
		localStorage,
		{ deep: true, writeDefaults: true, listenToStorageChanges: false, mergeDefaults: false }
	);

	return {
		persistedVersionData: persistedVersionData as Ref<PersistedBuildVersionData>,
		storedValueRef: storedValueRef as Ref<PersistedBuildVersionData>,
		initializedToDefaults
	}
}
