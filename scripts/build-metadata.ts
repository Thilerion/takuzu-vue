import { execSync } from "child_process";
import type { AppBuildMode, PkgVersion, GitRevisionString, MetadataString, DetailedVersionString, BuildDateString, SemverData } from '../src/services/build-data/types.js';

export interface BuildVersionDetails {
	mode: AppBuildMode | null,
	revision: GitRevisionString,
	date: BuildDateString,
	pkgVersion: PkgVersion,
	parsedVersion: SemverData,
	metadata: MetadataString,
	detailedVersion: DetailedVersionString
}

// Creates a BuildDateString. The function that parses the build date string
// is located within the src/services/build-data folder, along with the types.
// Those functions are only used in the runtime logic.
const createBuildDateString = (date = new Date()): BuildDateString => {
	const yy = `${date.getFullYear()}`.slice(-2);
	const mm = `${date.getMonth() + 1}`.padStart(2, '0');
	const dd = `${date.getDate()}`.padStart(2, '0');

	const hours = date.getHours();
	const minutes = date.getMinutes();
	// max minutes is 23 hours and 59 minutes = 1439 minutes
	// so this value is between 0 and (1439 / 2) = 720
	const minute2SinceMidnight = Math.round((hours * 60 + minutes) / 2);
	const min2String = `${minute2SinceMidnight}`.padStart(3, '0');
	return `${yy}${mm}${dd}${min2String}` as BuildDateString;
}

const getGitRevision = (): GitRevisionString => execSync('git rev-parse --short HEAD').toString().trim() as GitRevisionString;
const getAppBuildMode = (mode: string): AppBuildMode | null | 'test' => {
	if (mode === 'test') {
		console.warn('Test mode in build!');
		return 'test';
	}
	if (mode === 'alpha' || mode === 'beta') {
		return mode;
	}
	return null;
} 
const getPkgVersion = () => process.env.npm_package_version as PkgVersion;
const parsePkgVersion = (versionStr: PkgVersion): SemverData => {
	const split: string[] = (versionStr || '').split('.');
	if (!versionStr || split.length < 2) {
		// included because, when running vitest from vscode, versionStr is undefined and would cause an error
		console.warn('Cannot parse package version, as versionStr is not defined, or not of correct length.');
		return { major: 0, minor: 0, patch: 0 };
	}
	const [major, minor, patch] = split.map((val: string) => {
		const int = Number.parseInt(val);
		if (int == null || Number.isNaN(int)) {
			return 0;
		}
		return int;
	});
	return { major, minor, patch };
}
const getMetadataString = (appBuildMode: AppBuildMode | null | 'test', dateStr: BuildDateString, revision: GitRevisionString): MetadataString => {
	// MetaDataString: GitRevision_BuildDate || BuildMove.GitRevision_BuildDate
	if (appBuildMode != null) {
		return `${appBuildMode}.${revision}_${dateStr}`;
	} else {
		return `${revision}_${dateStr}`;
	}
}
const getDetailedVersionString = (version: PkgVersion, metadata: MetadataString): DetailedVersionString => {
	return `${version}+${metadata}`;
}

export const getBuildVersionDetails = (mode: string): BuildVersionDetails => {
	const buildMode = getAppBuildMode(mode);
	const date = createBuildDateString(new Date());
	const pkgVersion = getPkgVersion();
	const revision = getGitRevision();
	const metadata = getMetadataString(buildMode, date, revision);
	const detailedVersion = getDetailedVersionString(pkgVersion, metadata);
	return {
		mode: buildMode as AppBuildMode | null,
		revision,
		date,
		pkgVersion,
		parsedVersion: parsePkgVersion(pkgVersion),
		metadata,
		detailedVersion
	}
}