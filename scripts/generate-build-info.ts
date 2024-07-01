import { differenceInMinutes, getDayOfYear, startOfDay } from "date-fns";
import { execSync } from "node:child_process";
import { isAppBuildMode, isSemverInfo, type AppBuildMode, type BuildInfoDetails, type BuildSemver, type PkgVersion } from "../src/features/build-info/types.js";

export function generateBuildInfoDetails(viteMode: string | undefined): BuildInfoDetails {
	const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
	const pkgVersion = process.env.npm_package_version as PkgVersion;
	const semverInfo = parsePkgVersion(pkgVersion);
	const appBuildMode = getAppBuildMode(viteMode);

	const date = new Date();
	const dayStart = startOfDay(date);

	const year = Number.parseInt(String(date.getFullYear()).slice(-2));
	const dayOfYear = getDayOfYear(date);

	// get minutes since midnight
	const minutesSinceMidnight = differenceInMinutes(date, dayStart);

	return {
		pkgVersion,
		semverInfo,
		commitHash,
		date: {
			year, dayOfYear, minutesSinceMidnight,
		},
		appBuildMode,
	}
}

function parsePkgVersion(versionStr: PkgVersion): BuildSemver | null {
	const split: string[] = (versionStr || '').split('.');
	if (!versionStr || split.length < 2) {
		// included because, when running vitest from vscode, versionStr is undefined and would cause an error
		console.warn('Cannot parse package version, as versionStr is not defined, or not of correct length.');
		return null;
	}
	const semverInfoOrNull = split.slice(0, 3).map((val: string) => {
		const int = Number.parseInt(val);
		if (int == null || Number.isNaN(int)) {
			return null;
		}
		return int;
	});
	if (!isSemverInfo(semverInfoOrNull)) {
		console.warn(`Cannot parse package version, as versionStr is not of correct length, or contains invalid values: "${semverInfoOrNull}"`);
		return null;
	}
	return semverInfoOrNull;
}
function getAppBuildMode(value: string | undefined): AppBuildMode {
	if (isAppBuildMode(value)) return value;
	else return undefined;
} 