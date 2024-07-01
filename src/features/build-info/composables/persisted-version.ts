import { useStorage } from "@vueuse/core"
import type { BuildSemver } from "../types.js";
import { computed } from "vue";
import { isSameVersion } from "../helpers.js";

export const usePersistedAppVersion = () => {
	const appVersionStorageRef = useStorage<{
		previous: BuildSemver | null,
		current: BuildSemver | null,
	}>(
		'takuzu_build-semver',
		() => ({ previous: null, current: null }),
		localStorage,
	);

	const previousAppVersion = computed(() => appVersionStorageRef.value.previous);
	const currentAppVersion = computed(() => appVersionStorageRef.value.current);

	const handleVersionUpgrade = (value: BuildSemver | null) => {
		// TODO: handle upgrades here, whatever is needed
		const { current } = appVersionStorageRef.value;
		if (isSameVersion(value, current)) {
			throw new Error('Should not update persisted app version to the same value.');
		}
		appVersionStorageRef.value = {
			previous: current,
			current: value,
		}
	}

	return {
		previousAppVersion,
		currentAppVersion,
		handleVersionUpgrade,
	}
}