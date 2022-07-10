import { execSync } from "child_process";
import type { AppBuildMode, PkgVersion, GitRevisionString, MetadataString, DetailedVersionString, BuildDateString, SemverData } from '../src/services/build-data/types';
import { createBuildDateString } from '../src/services/build-data/buildDateString';

export interface BuildVersionDetails {
	mode: AppBuildMode | null,
	revision: GitRevisionString,
	date: BuildDateString,
	pkgVersion: PkgVersion,
	parsedVersion: SemverData,
	metadata: MetadataString,
	detailedVersion: DetailedVersionString
}

const getGitRevision = (): GitRevisionString => execSync('git rev-parse --short HEAD').toString().trim();
const getAppBuildMode = (mode: string): AppBuildMode | null => {
	if (mode === 'alpha' || mode === 'beta') {
		return mode;
	}
	return null;
} 
const getPkgVersion = () => process.env.npm_package_version as PkgVersion;
const parsePkgVersion = (versionStr: PkgVersion): SemverData => {
	const [major, minor, patch] = versionStr.split('.').map(val => {
		const int = Number.parseInt(val);
		if (int == null || Number.isNaN(int)) {
			return 0;
		}
		return int;
	});
	return { major, minor, patch };
}
const getMetadataString = (appBuildMode: AppBuildMode | null, dateStr: BuildDateString, revision: GitRevisionString): MetadataString => {
	if (appBuildMode != null) {
		return `${appBuildMode}.${dateStr}_${revision}`;
	} else {
		return `${dateStr}_${revision}`;
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
		mode: buildMode,
		revision,
		date,
		pkgVersion,
		parsedVersion: parsePkgVersion(pkgVersion),
		metadata,
		detailedVersion
	}
}