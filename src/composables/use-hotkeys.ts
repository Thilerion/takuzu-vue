import { useMagicKeys, whenever, type UseMagicKeysOptions } from "@vueuse/core";

export type UseHotkeysEventMap = Record<string, () => void>;
export const useHotkeys = (
	keyEvents: UseHotkeysEventMap,
	opts: Exclude<UseMagicKeysOptions<false>, 'reactive'>
) => {
	const magicKeys = useMagicKeys(opts);
	
	for (const [key, event] of Object.entries(keyEvents)) {
		whenever(magicKeys[key], () => {
			event();
		})
	}
}