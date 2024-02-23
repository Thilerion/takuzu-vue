import type { PuzzleGrid } from "../types.js";
import { PuzzleTransformations } from "./PuzzleTransformations.js";
import { applyTransformationConfig, getReverseTransformationConfig, getTransformationConfigFromKey } from "./helpers.js";

/**
 * Create multiple PuzzleTransformations instances that are synchronized with each other.
 * This is useful when a SolutionGrid and a grid with empty cells need to have the same transformations applied, because doing it another way, their canonical forms might be different.
 */

export function createSynchronizedTransformationHandlers(initialGrid: PuzzleGrid, solutionGrid: PuzzleGrid): [initialGridHandler: PuzzleTransformations, solutionHandler: PuzzleTransformations];
export function createSynchronizedTransformationHandlers(base: PuzzleGrid, ...others: PuzzleGrid[]): [baseHandler: PuzzleTransformations, ...PuzzleTransformations[]];
export function createSynchronizedTransformationHandlers(base: PuzzleGrid, ...others: PuzzleGrid[]): [PuzzleTransformations, ...PuzzleTransformations[]] {
	const baseHandler = PuzzleTransformations.fromAnyGrid(base);

	// get the transformation config to get from the base to the canonical grid
	const canonicalToBaseKey = baseHandler.getTransformationKeyOfGrid(base)!;
	const canonicalToBaseConf = getTransformationConfigFromKey(canonicalToBaseKey);
	const baseToCanonicalConf = getReverseTransformationConfig(canonicalToBaseConf);

	// apply this config to all other grids to get those grids from the viewpoint of the base canonical grid
	// then, create a handler for them using "fromCanonicalGrid"
	const otherHandlers = others.map(grid => {
	const otherCanonicalGrid = applyTransformationConfig(grid, baseToCanonicalConf);
		return PuzzleTransformations.fromCanonicalGrid(otherCanonicalGrid);
	});

	return [
		baseHandler,
		...otherHandlers
	];
}