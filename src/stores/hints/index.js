import { hintGenerators, HINT_TYPE } from "./Hint";

export function createHint(type, data) {
	if (!Object.keys(hintGenerators).includes(type)) {
		throw new Error('No hint generator function for hint of this type:', type);
	}

	return hintGenerators[type](data);
}

export function validateHint(hint, /* state */) {
	if (!Object.keys(HINT_TYPE).includes(hint.type)) {
		throw new Error('No hint validator found for hint of this type:', type);
	}

	// TODO
	// TODO: before hintValidator (except mistake), check that there are no mistakes first

	return false;
}