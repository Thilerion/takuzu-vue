import { inject, provide, type InjectionKey } from 'vue';
import { useAppSemver } from './stores/composables/useAppSemver';

type InjectedBuildData = ReturnType<typeof useAppSemver>;

const key: InjectionKey<InjectedBuildData> = Symbol('appGlobalBuildData');

export const provideGlobalBuildData = () => {
	const { pkgVersion, buildDate, curAppVersion, prevAppVersion, versionUpdated, buildVersionDetails } = useAppSemver();
	provide(key, {
		pkgVersion,
		curAppVersion,
		prevAppVersion,
		buildDate,
		versionUpdated,
		buildVersionDetails
	});
}

export const useGlobalBuildData = (): InjectedBuildData => {
	const buildData = inject(key);
	if (buildData === undefined) {
		throw new Error('Injected build data must not be undefined.')
	}
	const { pkgVersion, buildDate, curAppVersion, prevAppVersion, versionUpdated, buildVersionDetails } = buildData;
	return { pkgVersion, buildDate, curAppVersion, prevAppVersion, versionUpdated, buildVersionDetails };
}