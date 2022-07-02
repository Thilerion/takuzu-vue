import { provide, inject } from 'vue'

const key = Symbol('appGlobalBuildData');

export interface GlobalBuildData {
	pkgVersion: typeof __PKG_VERSION__;
	buildDate: typeof __BUILD_DATE__;
}

export const provideGlobalBuildData = () => {
	provide(key, {
		pkgVersion: __PKG_VERSION__,
		buildDate: __BUILD_DATE__
	} as GlobalBuildData)
}

export const useGlobalBuildData = (): GlobalBuildData => {
	const buildData = inject(key);
	if (buildData === undefined) {
		throw new Error('Injected build data must not be undefined.')
	}
	const { pkgVersion, buildDate } = (buildData as GlobalBuildData);
	return { pkgVersion, buildDate };
}