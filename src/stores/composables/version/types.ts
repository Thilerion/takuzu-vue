import type { BuildDateString, DetailedVersionString, PkgVersion } from "@/services/build-data/types";

export interface BuildVersionSummary {
	pkgVersion: PkgVersion,
	buildDateString: BuildDateString,
	detailedVersion: DetailedVersionString
}
export interface PersistedBuildVersionData {
	current: BuildVersionSummary,
	previous: null | BuildVersionSummary
}