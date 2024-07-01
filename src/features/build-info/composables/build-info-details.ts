import { createSharedComposable } from "@vueuse/core";
import { getBuildInfoDetails } from "../get-info.js";
import { usePersistedAppVersion } from "./persisted-version.js";
import { checkAppVersionChange, isSameVersion, type AppVersionChangeResult } from "../helpers.js";

export const useBuildInfoDetails = createSharedComposable(() => {
	const buildInfo = getBuildInfoDetails();
	const {
		pkgVersion,
		semverInfo,

		commitHash,
		date,

		appBuildMode,
	} = buildInfo;

	const {
		previousAppVersion, currentAppVersion,
		persistVersionChange,
	} = usePersistedAppVersion();

	const versionChangeResult = checkAppVersionChange(
		previousAppVersion.value,
		currentAppVersion.value
	);
	if (!versionChangeResult.hasChanged) {
		// No version change
		console.log('Version has not changed since last visit.');
	} else {
		const { type, direction } = versionChangeResult;
		if (type === 'unknown' && direction === 'upgrade') {
			console.log('Unknown version upgrade detected. Possibly first visit, or localStorage was reset.');
			break;
		}
	}
})

function handleVersionChangeResult(result: AppVersionChangeResult) {
	if (!result.hasChanged) {
		// No version change
		console.log('Version has not changed since last visit.');
		return;
	}
	const { type, direction } = result;
	if (direction === 'downgrade') {
		console.warn('Version downgrade detected. This should not happen, except possibly during development.');
		return;
	}
	if (type === 'unknown') {
		console.log('Unknown version upgrade detected. Possibly first visit, or localStorage was reset.');
		return;
	}
	// Direction is upgrade, type is major/minor/patch
	console.log(`Version upgrade detected: ${type} version.`);
	// TODO: handle upgrade here! Such as: persistVersionChange
	throw new Error('Not yet implemented');
}