import { provide, inject } from 'vue'

const key = Symbol('appGlobalBuildData');

export const provideGlobalBuildData = () => {
	provide(key, {
		pkgVersion: __PKG_VERSION__,
		buildDate: __BUILD_DATE__
	})
}

export const useGlobalBuildData = () => {
	const { pkgVersion, buildDate } = inject(key);
	return { pkgVersion, buildDate };
}