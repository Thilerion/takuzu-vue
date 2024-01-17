import type { BoardAndSolutionBoards } from "@/lib/types";
import { pickRandom } from "@/lib/utils";
import { shuffleCopy } from "@/utils/random.utils";
import { getBoardShapeType } from "../board-type";
import { getTransformedPuzzleBoards } from "./transform-grid";
import type { GridTransformationId } from "./types";

const allTransformationIds = [
	'rotate0', 'rotate0_reflect',
	'rotate90', 'rotate90_reflect',
	'rotate180', 'rotate180_reflect',
	'rotate270', 'rotate270_reflect',
	'rotate0_invertSymbols', 'rotate0_reflect_invertSymbols',
	'rotate90_invertSymbols', 'rotate90_reflect_invertSymbols',
	'rotate180_invertSymbols', 'rotate180_reflect_invertSymbols',
	'rotate270_invertSymbols', 'rotate270_reflect_invertSymbols'
] as const; // 16

type GridTransformIdList = ReadonlyArray<GridTransformationId>;

const squareTransformationIds: GridTransformIdList = [...allTransformationIds];
const rectTransformationIds: GridTransformIdList = allTransformationIds.filter(val => {
	return val.startsWith('rotate0') || val.startsWith('rotate180'); // remove rotate90 and rotate270
})
const oddSquareTransformationIds: GridTransformIdList = allTransformationIds.filter(val => {
	return !(val.includes('invertSymbols')); // without invert symbols transformation
})
type ExcludeIdentity<T extends string> = Exclude<T, 'rotate0'>;
const excludeIdentityFromList = (arr: GridTransformIdList): ReadonlyArray<ExcludeIdentity<GridTransformationId>> => {
	return arr.filter((val): val is ExcludeIdentity<GridTransformationId> => val !== 'rotate0');
}

const transformationIdsByType = {
	square: squareTransformationIds,
	squareNoIdentity: excludeIdentityFromList(squareTransformationIds),
	rect: rectTransformationIds,
	rectNoIdentity: excludeIdentityFromList(rectTransformationIds),
	odd: oddSquareTransformationIds,
	oddNoIdentity: excludeIdentityFromList(oddSquareTransformationIds)
}

type RandomTransformIdOpts = {
	exclude?: GridTransformationId[],
	excludeIdentity?: boolean
}
type GetRandomTransformIdFn = (opts: RandomTransformIdOpts) => GridTransformationId;
const getRandomTransformationIdFromList = (list: GridTransformIdList, exclude?: GridTransformationId[]) => {
	if (exclude && exclude.length) {
		return pickRandom(list.filter(val => !(exclude.includes(val))));
	} else return pickRandom(list);
}
const getRandomSquareTransformationId: GetRandomTransformIdFn = ({
	exclude,
	excludeIdentity = true
}) => {
	const baseList = excludeIdentity ? transformationIdsByType.squareNoIdentity : transformationIdsByType.square;
	return getRandomTransformationIdFromList(baseList, exclude);
}
const getRandomRectTransformationId: GetRandomTransformIdFn = ({
	exclude,
	excludeIdentity = true
}) => {
	const baseList = excludeIdentity ? transformationIdsByType.rectNoIdentity : transformationIdsByType.rect;
	return getRandomTransformationIdFromList(baseList, exclude);
}
const getRandomOddSquareTransformationId: GetRandomTransformIdFn = ({
	exclude,
	excludeIdentity = true
}) => {
	const baseList = excludeIdentity ? transformationIdsByType.oddNoIdentity : transformationIdsByType.odd;
	return getRandomTransformationIdFromList(baseList, exclude);
}

export const getRandomTransformationId = (type: 'square' | 'odd' | 'rect', opts: RandomTransformIdOpts = {}) => {
	if (type === 'square') {
		return getRandomSquareTransformationId(opts);
	} else if (type === 'odd') {
		return getRandomOddSquareTransformationId(opts);
	} else if (type === 'rect') {
		return getRandomRectTransformationId(opts);
	}
	throw new Error(`Unexpected type: ${type}`);
}

export function getRandomTransformedPuzzle(boards: BoardAndSolutionBoards, opts?: RandomTransformIdOpts) {
	const type = getBoardShapeType(boards.board);
	const id = getRandomTransformationId(type, opts);
	const { board, solution } = getTransformedPuzzleBoards(boards, id);
	return { transformation: id, board, solution };
}

export function* generateRandomRepeatingSequence<T>(
	list: ReadonlyArray<T>,
	initPrevious: T[] = []
) {
	const length = list.length + initPrevious.length;
	const shuffleAfter = Math.ceil(length / 2);

	let current: T[] = shuffleCopy(list);
	let previous: T[] = [...initPrevious];

	while (true) {
		const next = current.pop()!;
		yield next;

		if (previous.length >= shuffleAfter) {
			current = [
				...shuffleCopy(previous),
				...current,
			];
			previous = [next];
		} else {
			previous.push(next);
		}
	}

}

export function* generateRandomRepeatingTransformIdList(list: GridTransformIdList) {
	let baseList, initPrevious;

	if (list.includes('rotate0')) {
		baseList = list.filter(val => val !== 'rotate0');
		initPrevious = ['rotate0'];
	} else {
		baseList = [...list];
	}
	yield* generateRandomRepeatingSequence(baseList, initPrevious);
}

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest;
	test('all transform ids is correct size', () => {
		const allMatched: GridTransformationId[] = [...new Set(allTransformationIds)];
		expect(allMatched).toHaveLength(16);
		expect(allTransformationIds).toHaveLength(16);
	})
	test('rect transform ids is correct size', () => {
		const allMatched: GridTransformationId[] = [...new Set(rectTransformationIds)];
		expect(allMatched).toHaveLength(8);
		expect(rectTransformationIds).toHaveLength(8);
	})
	test('odd square transform ids is correct size', () => {
		const allMatched: GridTransformationId[] = [...new Set(oddSquareTransformationIds)];
		expect(allMatched).toHaveLength(8);
		expect(oddSquareTransformationIds).toHaveLength(8);
	})
}