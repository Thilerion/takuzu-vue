import { identity } from "@/utils/function.utils";
import { SimpleBoard } from "@/lib";
import type { BoardShape } from "@/lib/types";
import type { PuzzleTransformFn } from "./types";
import { rotate90, rotate180, rotate270, hFlip, vFlip, invertPuzzle } from "./transformation-fns";

export type PuzzleTransformCategories = 'rotation' | 'reflection' | 'value';
export type RotationTransforms = 'rotate90' | 'rotate180' | 'rotate270';
export type ReflectionTransforms = 'flipHorizontal' | 'flipVertical'; // flip both is equal to rotate180
export type ValueTransforms = 'invertSymbols';
export type IdentityTransform = 'identity';
export type PuzzleTransforms = RotationTransforms | ReflectionTransforms | ValueTransforms;

const rotationTransformFnMap: Record<RotationTransforms, PuzzleTransformFn> = {
	rotate90: rotate90,
	rotate180: rotate180,
	rotate270: rotate270,
};
const reflectionTransformFnMap: Record<ReflectionTransforms, PuzzleTransformFn> = {
	flipHorizontal: hFlip,
	flipVertical: vFlip,
}
const valueTransformFnMap: Record<ValueTransforms, PuzzleTransformFn> = {
	invertSymbols: invertPuzzle,
}

const transformFnMap: Record<PuzzleTransforms, PuzzleTransformFn> = {
	...rotationTransformFnMap,
	...reflectionTransformFnMap,
	...valueTransformFnMap
};
type TransformsByCategory = {
	'rotation': RotationTransforms,
	'reflection': ReflectionTransforms,
	'value': ValueTransforms
}
type TransformCategoryFnMap = {
	[P in keyof TransformsByCategory]: TransformsByCategory[P][]
}
type TransformCategoryFnMapWithIdentity = {
	[P in keyof TransformsByCategory]: (TransformsByCategory[P] | IdentityTransform)[]
}

export const getValidTransformsForPuzzle = (dimensions: BoardShape): TransformCategoryFnMap => {
	const { width, height } = dimensions;
	const isRect = width !== height;
	const isOdd = width % 2 !== 0 || (isRect && height % 2 !== 0);

	const valueTransforms: ValueTransforms[] = isOdd ? [] : ['invertSymbols'];
	const reflectionTransforms: ReflectionTransforms[] = ['flipHorizontal', 'flipVertical'];
	const rotationTransforms: RotationTransforms[] = [
		'rotate180',
		...(isRect ? [] : ['rotate90', 'rotate270']) as RotationTransforms[]
	]
	return {
		value: valueTransforms,
		reflection: reflectionTransforms,
		rotation: rotationTransforms
	}
}

export const getValidTransformsForRectPuzzle = (): TransformCategoryFnMap => {
	return {
		value: ['invertSymbols'],
		reflection: ['flipHorizontal', 'flipVertical'],
		rotation: ['rotate180']
	}
}
export const getValidTransformsForSquarePuzzle = (): TransformCategoryFnMap => {
	return {
		value: ['invertSymbols'],
		reflection: ['flipHorizontal', 'flipVertical'],
		rotation: ['rotate90', 'rotate180', 'rotate270']
	}
}
export const getValidTransformsForOddSquarePuzzle = (): TransformCategoryFnMap => {
	const { reflection, rotation } = getValidTransformsForSquarePuzzle();
	return { value: [], reflection, rotation };
}
export const getValidTransformsForOddRectPuzzle = (): TransformCategoryFnMap => {
	const { reflection, rotation } = getValidTransformsForRectPuzzle();
	return { value: [], reflection, rotation };
}

export function getRandomTransformation({
	board,
	solution
}: { board: SimpleBoard, solution: SimpleBoard }) {
	const fns = [vFlip, hFlip, rotate180];
	if (board.width === board.height) {
		fns.push(rotate90, rotate270, (arr) => vFlip(rotate90(arr)), (arr) => vFlip(rotate270(arr)));
	}
	const invert = board.width % 2 === 0;

	const invertFn = invert ? invertPuzzle : identity;
	const transformFn = fns[Math.floor(Math.random() * fns.length)];

	const boardGrid = invertFn(board.grid);
	const solutionGrid = invertFn(solution.grid);

	return {
		board: new SimpleBoard(transformFn(boardGrid)),
		solution: new SimpleBoard(transformFn(solutionGrid))
	}
}