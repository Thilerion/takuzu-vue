import { parseBuildDateString } from "@/services/build-data/buildDateString";
import { computed, readonly } from "vue";
import { initializePersistence } from "./init";
import type { BuildVersionSummary } from "./types";
import { initVersionChange } from "./version-change";

const BUILD_VERSION_DETAILS = Object.freeze(__BUILD_VERSION_DETAILS__);

const { persistedVersionData: persistedVersionDataRef, initializedToDefaults } = initializePersistence(BUILD_VERSION_DETAILS);

const updatedVersionSummary: BuildVersionSummary = Object.freeze({
	pkgVersion: BUILD_VERSION_DETAILS.pkgVersion,
	detailedVersion: BUILD_VERSION_DETAILS.detailedVersion,
	buildDateString: BUILD_VERSION_DETAILS.date
})

const updateCheckData = initVersionChange(persistedVersionDataRef, updatedVersionSummary);

// state
const { changed: versionChanged, pkgVersionChanged, detailedVersionChanged } = updateCheckData;

const persistedVersionData = readonly(persistedVersionDataRef);

const {
	date: buildDateString,
	...restOfBuildVersionDetails
} = BUILD_VERSION_DETAILS;
const buildDate = parseBuildDateString(buildDateString);

const curAppVersionData = computed(() => persistedVersionDataRef.value.current);
const prevAppVersionData = computed(() => persistedVersionDataRef.value.previous);

export const useBuildVersionDetails = () => {
	return {
		versionUpdateData: {
			versionChanged,
			pkgVersionChanged,
			detailedVersionChanged,
			initializedToDefaults
		},
		persistedVersionData,

		buildDate,
		buildDateString,
		...restOfBuildVersionDetails,
		curAppVersionData,
		prevAppVersionData
	}
}