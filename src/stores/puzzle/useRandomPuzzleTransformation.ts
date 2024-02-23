import type { AllPuzzleBoards } from "@/lib/types.js";
import { PuzzleTransformations } from "@/lib/transformations/PuzzleTransformations.js";
import type { BaseTransformationConfig, TransformationKey } from "@/lib/transformations/types.js";
import { applyTransformationConfig, getReverseTransformationConfig, getTransformationConfigFromKey, getTransformationKey } from "@/lib/transformations/helpers.js";
import { usePuzzleStore } from "./store.js";
import { SimpleBoard } from "@/lib/index.js";
import { createSynchronizedTransformationHandlers } from "@/lib/transformations/synced.js";

export const getRandomPuzzleTransformationOnRestart = (): AllPuzzleBoards => {
	const store = usePuzzleStore();

	// initialize puzzleTransformations class first in store
	if (store.transformations == null) {
		const [
			initialGridHandler,
			solutionHandler,
		] = createSynchronizedTransformationHandlers(
			store.initialBoard!.grid,
			store.solution!.grid
		)
		store.transformations = {
			previous: [],
			initialGridHandler,
			solutionHandler,
		}
	}

	const handler = store.transformations.initialGridHandler as PuzzleTransformations; // for some reason the private properties are missing from the type definition in the store

	// set current transformation key in previously used transformations
	const currentKey = handler.getTransformationKeyOfGrid(store.initialBoard!.grid)!;
	addKeyToPreviousAndCapLength(currentKey);

	// also prevent the transformation to only be a symbol inversion from the current one
	// note: a transformation with invert is invalid for odd-sized boards, but this does not matter if it is added to keys to skip
	const currentConfig = getTransformationConfigFromKey(currentKey);
	const invertedCurrentConfig: BaseTransformationConfig = [
		currentConfig[0],
		currentConfig[1],
		currentConfig[2] === 'noInvert' ? 'invertSymbols' : 'noInvert'
	];
	const keysToSkip = [
		...store.transformations.previous,
		getTransformationKey(invertedCurrentConfig)
	]
	const randomKey = getRandomUniqueTransformationKeyWithRetry(
		handler,
		keysToSkip
	);

	const initialBoardResult = SimpleBoard.fromString(
		handler.getTransformationByKey(randomKey)!);
	const solutionBoardResult = SimpleBoard.fromString(
		store.transformations.solutionHandler.getTransformationByKey(randomKey)!);

	return {
		board: initialBoardResult.copy(),
		initialBoard: initialBoardResult,
		solution: solutionBoardResult,
	};
}

const addKeyToPreviousAndCapLength = (key: TransformationKey) => {
	const store = usePuzzleStore();
	const transformations = store.transformations!;
	const uniqueTransformationsAmount = transformations.initialGridHandler.amountOfUniqueTransformations();
	transformations.previous.push(key);

	const maxKeys = Math.max(uniqueTransformationsAmount - 2, 0);

	while (transformations.previous.length > maxKeys) {
		transformations.previous.shift();
	}
}

const getRandomUniqueTransformationKeyWithRetry = (handler: PuzzleTransformations, keysToSkip: TransformationKey[]): TransformationKey => {
	const opts = { skip: [...keysToSkip] };
	// should succeed in the first try
	for (let i = 0; i < 2; i++) {
		const key = handler.getRandomUniqueTransformationKey(opts);
		if (key != null) {
			return key;
		}
	}
	if (keysToSkip.length > 0) {
		// else, don't skip any previous keys; can occur when there are very few unique transformations
		const key = handler.getRandomUniqueTransformationKey({
			skip: []
		});
		if (key != null) return key;
	}
	// else, return a random transformation key
	const randomKey = handler.getRandomTransformationKey();
	return randomKey!;
}