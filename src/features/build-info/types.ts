export type PkgVersion = `${number}.${number}.${number}`;

const APP_BUILD_MODES = ['alpha', 'beta', 'test'] as const;
export type AppBuildMode = typeof APP_BUILD_MODES[number] | undefined;
export function isAppBuildMode(value: unknown): value is AppBuildMode {
	return value === undefined || APP_BUILD_MODES.includes(value as any);
}

export type BuildSemver = [major: number, minor: number, patch: number];
export function isSemverInfo(val: unknown[]): val is BuildSemver {
	if (val.length !== 3) return false;
	for (const val2 of val) {
		if (typeof val2 !== 'number') return false;
		if (Number.isNaN(val2)) return false;
	}
	return true;
}

export type BuildInfoDetails = {
	pkgVersion: PkgVersion,
	semverInfo: BuildSemver | null,
	commitHash: string,
	date: {
		year: number,
		dayOfYear: number,
		minutesSinceMidnight: number,
	},
	appBuildMode: AppBuildMode,
}