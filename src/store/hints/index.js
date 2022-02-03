import { hintGenerators } from "./Hint.js";
import { hintValidators } from "./validation.js";

export function createHint(type, data) {
	if (!Object.keys(hintGenerators).includes(type)) {
		throw new Error('No hint generator function for hint of this type:', type);
	}

	return hintGenerators[type](data);
}

export function validateHint(hint, state) {
	if (!Object.keys(hintValidators).includes(hint.type)) {
		throw new Error('No hint validator found for hint of this type:', type);
	}

	return hintValidators[hint.type](hint, state);
}