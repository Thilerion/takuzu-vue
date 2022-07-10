export type AppBuildMode = 'alpha' | 'beta';
export type BuildDateString = string & { readonly __stringtype__: 'YYMMDDHH+2min_intervals' };
export type PkgVersion = `${number}.${number}.${number}`;
export type GitRevisionString = string;
export type MetadataString = `${GitRevisionString}_${BuildDateString}` | `${AppBuildMode}.${GitRevisionString}_${BuildDateString}`;
export type DetailedVersionString = `${PkgVersion}+${MetadataString}`;

export interface SemverData {
	major: number,
	minor: number,
	patch: number
}