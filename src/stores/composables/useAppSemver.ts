import { useStorage } from "@vueuse/core";
import { computed, type ComputedRef } from "vue";

const lsKeyVersion = 'takuzu_app-versions';
export interface AppVersionDataPersisted {
	version: string
	previous: null | string;
}

export interface AppVersionDataRefs {
	curAppVersion: ComputedRef<AppVersionDataPersisted['version']>;
	prevAppVersion: ComputedRef<AppVersionDataPersisted['previous']>;
}
type VersionChangeCheckResult =
	| { changed: false }
	| { changed: true, previous: null | string, current: string };

const appVersionData = useStorage<AppVersionDataPersisted>(lsKeyVersion, {
	version: '',
	previous: null
})

const prevAppVersion = computed(() => appVersionData.value.previous);
const curAppVersion = computed(() => appVersionData.value.version);
const buildVersionDetails = Object.freeze(__BUILD_VERSION_DETAILS__);

const checkVersionChange = (storedCurrent: string | null, globalVersion: string): VersionChangeCheckResult => {
	if (storedCurrent == null || storedCurrent === '') {
		// first load, or first load since using this composable
		return {
			changed: true,
			previous: null,
			current: globalVersion
		}
	}
	if (storedCurrent !== globalVersion) {
		// the app version has changed since last load
		return {
			changed: true,
			previous: storedCurrent,
			current: globalVersion
		}
	}
	// stored version is the same as the app version, no change
	return { changed: false };
}

const globalVersion = `${__PKG_VERSION__}_${__BUILD_DATE__}`;
const hasUpdatedCheck = checkVersionChange(curAppVersion.value, globalVersion);
if (hasUpdatedCheck.changed) {
	const { previous, current } = hasUpdatedCheck;
	appVersionData.value = { previous, version: current };
	console.log(`App version has changed from "${previous}" to "${current}"`);
}

export const useAppSemver = () => {
	return {
		pkgVersion: __PKG_VERSION__,
		buildDate: __BUILD_DATE__,
		curAppVersion,
		prevAppVersion,
		buildVersionDetails,

		versionUpdated: computed(() => curAppVersion.value !== prevAppVersion.value)
	}
}