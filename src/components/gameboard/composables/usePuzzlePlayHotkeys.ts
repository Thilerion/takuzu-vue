import { useMagicKeys, whenever } from "@vueuse/core"
import { logicAnd, logicNot } from "@vueuse/math";

type HotkeyEventHandlerMap<T extends string> = Record<T, () => void>;
export type PuzzlePlayEventHandlers = HotkeyEventHandlerMap<'undo' | 'togglePause' | 'getHint' | 'hideHint' | 'check'>;

export const usePuzzlePlayHotkeys = ({
	undo, togglePause, getHint, hideHint, check
}: PuzzlePlayEventHandlers): void => {
	const magicKeys = useMagicKeys();

	const noModifierKeysPressed = logicAnd(
		logicNot(magicKeys['ctrl']),
		logicNot(magicKeys['shift']),
		logicNot(magicKeys['alt']),
	);

	const keyWithoutModifiers = (key: string) => logicAnd(
		noModifierKeysPressed,
		magicKeys[key]
	);

	whenever(magicKeys['ctrl+z'], () => undo());
	whenever(keyWithoutModifiers('p'), () => togglePause());
	whenever(keyWithoutModifiers('h'), () => getHint());
	whenever(keyWithoutModifiers('Escape'), () => hideHint());
	whenever(keyWithoutModifiers('c'), () => check());
}