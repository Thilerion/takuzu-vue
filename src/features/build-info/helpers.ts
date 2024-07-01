import type { BuildSemver } from "./types.js";

export const isSameVersion = (a: BuildSemver | null, b: BuildSemver | null) => {
	if (a == null && b == null) return true;
	if (a == null || b == null) return false;
	return a.join(',') === b.join(',');
}

const getSemverPartName = (idx: number): 'major' | 'minor' | 'patch' => {
	switch (idx) {
		case 0: return 'major';
		case 1: return 'minor';
		case 2: return 'patch';
		default: {
			throw new Error(`Unexpected semver part index: ${idx}`);
		}
	}
}

export type AppVersionChangeType = 'major' | 'minor' | 'patch' | 'unknown';
export type AppVersionChangeDirection = 'upgrade' | 'downgrade';
export type AppVersionChangeResult = {
	hasChanged: false,
	type?: undefined,
	direction?: undefined,
} | {
	hasChanged: true,
	type: AppVersionChangeType,
	direction: AppVersionChangeDirection,
}

export const checkAppVersionChange = (
	from: BuildSemver | null,
	to: BuildSemver | null
): AppVersionChangeResult => {
	if (isSameVersion(from, to)) return {
		hasChanged: false,
	};

	if (from == null && to != null) {
		return {
			hasChanged: true,
			type: 'unknown' as const,
			direction: 'upgrade' as const,
		};
	} else if (from != null && to == null) {
		return {
			hasChanged: true,
			type: 'unknown',
			direction: 'downgrade'
		}
	} else if (from == null || to == null) {
		// Should not be reached, as isSameVersion already checks for this
		throw new Error('Unexpected error in isAppVersionUpgrade');
	}

	// Compare step-by-step: first major, then minor, then patch
	for (let i = 0; i < 3; i++) {
		const a = from[i];
		const b = to[i];
		if (a === b) {
			continue;
		} else if (a > b) {
			return {
				hasChanged: true,
				type: getSemverPartName(i),
				direction: 'downgrade',
			}
		} else if (a < b) {
			return {
				hasChanged: true,
				type: getSemverPartName(i),
				direction: 'upgrade',
			}
		}
	}

	// This also should not be reached, as isSameVersion already checks for this
	console.error('Unexpected error in isAppVersionUpgrade');
	return {
		hasChanged: false,
		type: undefined,
		direction: undefined,
	}
}