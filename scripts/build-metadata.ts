import { execSync } from "child_process";
import type { AppBuildMode, PkgVersion, GitRevisionString, MetadataString, DetailedVersionString, BuildDateString, SemverData } from '../src/services/build-data/types.js';
import { createBuildDateString } from '../src/services/build-data/buildDateString.js';

export interface BuildVersionDetails {
	mode: AppBuildMode | null,
	revision: GitRevisionString,
	date: BuildDateString,
	pkgVersion: PkgVersion,
	parsedVersion: SemverData,
	metadata: MetadataString,
	detailedVersion: DetailedVersionString
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