import { useStorage } from '@vueuse/core';
import { provide, inject, computed, type ComputedRef } from 'vue';

const key = Symbol('appGlobalBuildData');
const lsKeyVersion = 'takuzu_app-versions';

interface AppVersionDataPersisted {
	version: string
	previous: null | string;
}

interface AppVersionDataRefs {
	curAppVersion: ComputedRef<AppVersionDataPersisted['version']>;
	prevAppVersion: ComputedRef<AppVersionDataPersisted['previous']>;
}

interface GlobalDefinedBuildData {
	pkgVersion: typeof __PKG_VERSION__;
	buildDate: typeof __BUILD_DATE__;
}

export interface InjectedBuildData extends AppVersionDataRefs, GlobalDefinedBuildData { }

export const provideGlobalBuildData = () => {
	const appVersionData = useStorage<AppVersionDataPersisted>(lsKeyVersion, {
		version: '',
		previous: null
	});
	const prevAppVersion = computed(() => appVersionData.value.previous);
	const curAppVersion = computed(() => appVersionData.value.version);

	const constructedVersion = `${__PKG_VERSION__}_${__BUILD_DATE__}`;

	if (constructedVersion !== appVersionData.value.version) {
		const version = constructedVersion;
		const storedVersion = appVersionData.value.version;
		const hasStoredVersion = storedVersion != null && storedVersion !== '';
		const previous = hasStoredVersion ? storedVersion : null;
		appVersionData.value = { version, previous };

		if (hasStoredVersion) {
			console.log(`App version increased from "${storedVersion}" to "${version}"!`);
			if (import.meta.env.DEV) {
				window.alert(`App version increased from "${storedVersion}" to "${version}"!`)
			}
		} else {
			console.log(`App version has been set for the first time to "${version}"!`);
			if (import.meta.env.DEV) {
				window.alert(`App version has been set for the first time to "${version}"!`)
			}
		}
	}
	provide(key, {
		pkgVersion: __PKG_VERSION__,
		curAppVersion,
		prevAppVersion,
		buildDate: __BUILD_DATE__
	} as InjectedBuildData)
}

export const useGlobalBuildData = (): InjectedBuildData => {
	const buildData = inject(key);
	if (buildData === undefined) {
		throw new Error('Injected build data must not be undefined.')
	}
	const { pkgVersion, buildDate, curAppVersion, prevAppVersion } = (buildData as InjectedBuildData);
	return { pkgVersion, buildDate, curAppVersion, prevAppVersion };
}