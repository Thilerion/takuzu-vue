import { hintGenerators, HINT_TYPE, Hint } from "./Hint";

export type HintTypeDataMap = {
	[K in keyof typeof hintGenerators]: Parameters<typeof hintGenerators[K]>[0]
}

export function createHint<T extends keyof HintTypeDataMap>(type: T, data: HintTypeDataMap[T]) {
	if (!Object.keys(hintGenerators).includes(type)) {
		throw new Error('No hint generator function for hint of this type: ' + type);
	}

	return hintGenerators[type](data as any);
}

export function validateHint(hint: Hint) {
	if (!Object.keys(HINT_TYPE).includes(hint.type)) {
		throw new Error('No hint validator found for hint of this type: ' + hint.type);
	}

	// TODO
	// TODO: before hintValidator (except mistake), check that there are no mistakes first

	return false;
}