import { getBoardShapeTypeFromGrid } from "../helpers/board-type.js";
import { SimpleBoard } from "../index.js";
import type { BoardString, PuzzleGrid } from "../types.js";
import { pickRandom } from "../utils.js";
import { createCombinedTransformationFn } from "./base-transformations.js";
import { getTransformationKey, getTransformationConfigFromKey, generateAllValidTransformations } from "./helpers.js";
import type { TransformationKey, BaseTransformationConfig, RotationTransform, TransformationBoardStringsMap, TransformationRecord } from "./types.js";

export class PuzzleTransformations {
    private transformations: TransformationBoardStringsMap;
	public readonly canonicalForm: BoardString;

	private constructor(
		// from perspective of canonicalForm
		transformations: TransformationBoardStringsMap,
	) {
		this.transformations = transformations;
		this.canonicalForm = this.transformations.get('rot0_noFlip_noInvert')!;
	}

	static fromAnyGrid(inputGrid: PuzzleGrid): PuzzleTransformations {
		/*
		Steps in getting all Transformations from the perspective of a canonical form:
			1. generate all transformations from viewpoint of inputGrid, and temporarily store these
			2. find canonical form of inputGrid, using stringify and lexical ordering
			3. store canonical form in this.canonicalForm
			4. adjust all transformations to be relative to the canonical form by either: 
			a. applying the inverse of the transformation to the canonical form, or
				b. redoing the transformation from the viewpoint of the canonical form (inefficient, slower but easier)
			5. store reordered transformations in this.transformations
		*/
		const boardShapeType = getBoardShapeTypeFromGrid(inputGrid);
		const tempTransformations: Partial<TransformationRecord<PuzzleGrid>> = generateAllValidTransformations(inputGrid, boardShapeType);
		const [canonicalKey] = PuzzleTransformations.identifyCanonicalForm(tempTransformations);
		const transformations = PuzzleTransformations.getTransformationsFromCanonicalForm(
			canonicalKey,
			tempTransformations,
		);
		return new PuzzleTransformations(transformations);
	}
	
	static fromCanonicalGrid(canonicalGrid: PuzzleGrid): PuzzleTransformations {
		const boardShapeType = getBoardShapeTypeFromGrid(canonicalGrid);
		const transformations: Partial<TransformationRecord<PuzzleGrid>> = generateAllValidTransformations(canonicalGrid, boardShapeType);
		// make the TransformationBoardStringsMap
		const result: TransformationBoardStringsMap = new Map();
		for (const entry of Object.entries(transformations)) {
			const [key, grid] = entry as [TransformationKey, PuzzleGrid];
			const boardString = SimpleBoard.gridToBoardString(grid);
			result.set(key, boardString);
		}
		return new PuzzleTransformations(result);
	}

	static getTransformationKeyFromPuzzleGrid(grid: PuzzleGrid): {
		isCanonical: boolean,
		transformationKey: TransformationKey
	} {
		const instance = PuzzleTransformations.fromAnyGrid(grid);
		const isCanonical = instance.isCanonicalForm(grid);
		const transformationKey = instance.getTransformationKeyOfGrid(grid)!;
		return {
			isCanonical,
			transformationKey
		}
	}
	static applyTransformation(grid: PuzzleGrid, config: BaseTransformationConfig): PuzzleGrid {
		const transformationFn = createCombinedTransformationFn(config);
        return transformationFn(grid);
	}
	static applyTransformationKey(grid: PuzzleGrid, key: TransformationKey): PuzzleGrid {
		const config = getTransformationConfigFromKey(key);
		return this.applyTransformation(grid, config);
	}
	static applyTransformationToBoard(board: SimpleBoard, config: BaseTransformationConfig): SimpleBoard {
		const grid = PuzzleTransformations.applyTransformation(board.grid, config);
		return SimpleBoard.fromGrid(grid);
	}
	getSynchronizedTransformedBoard(boards: SimpleBoard[], key: TransformationKey): { self: SimpleBoard, others: SimpleBoard[] } {
		// TODO: this returns incorrect results, probably due to the canonical form of a board with empty cells not being the same as the canonical form of its solution	
		const config = getTransformationConfigFromKey(key);
		const self = this.getTransformedBoardByKey(key)!;

		const others = boards.map(board => {
			return PuzzleTransformations.applyTransformationToBoard(board, config);
		});

		return { self, others };
	}

	public getAllTransformations(): Readonly<TransformationBoardStringsMap> {
		return this.transformations;
	}

	public getTransformationByKey(key: TransformationKey): BoardString | undefined {
		return this.transformations.get(key);
	}
	public getTransformedBoardByKey(key: TransformationKey): SimpleBoard | undefined {
		const boardString = this.getTransformationByKey(key);
		if (boardString === undefined) {
			return undefined;
		}
		return SimpleBoard.fromString(boardString);
	}
	public getTransformationByConfig(config: BaseTransformationConfig): BoardString | undefined {
		const key = getTransformationKey(config);
		return this.getTransformationByKey(key);
	}
	public getTransformedBoardByConfig(config: BaseTransformationConfig): SimpleBoard | undefined {
		const key = getTransformationKey(config);
		return this.getTransformedBoardByKey(key);		
	}
	public isCanonicalForm(gridOrBoardString: PuzzleGrid | BoardString): boolean {
		const boardString = typeof gridOrBoardString === 'string' ? gridOrBoardString : SimpleBoard.gridToBoardString(gridOrBoardString);
		return boardString === this.canonicalForm;
	}
	public isTransformationOfCanonicalForm(grid: PuzzleGrid | BoardString): boolean {
		const boardString = typeof grid === 'string' ? grid : SimpleBoard.gridToBoardString(grid);
		// check if any value in this.transformations is equal to boardString
		return [...this.transformations.values()].some(val => val === boardString);
	}
	public getTransformationKeyOfGrid(grid: PuzzleGrid | BoardString): TransformationKey | undefined {
		const boardString = typeof grid === 'string' ? grid : SimpleBoard.gridToBoardString(grid);
		for (const [key, value] of this.transformations) {
			if (value === boardString) {
				return key;
			}
		}
		return undefined;
	}

	public getValidTransformationKeys(): TransformationKey[] {
		return [...this.transformations.keys()];
	}
	public getAllTransformationBoardStrings(): BoardString[] {
		return [...this.transformations.values()];
	}
	public getAllUniqueTransformationBoardStrings(): BoardString[] {
		return [...new Set(this.getAllTransformationBoardStrings())];
	}
	public amountOfTransformations(): number {
		return this.transformations.size;
	}
	public amountOfUniqueTransformations(): number {
		return this.getAllUniqueTransformationBoardStrings().length;
	}
	/**
	 * Checks whether the board has "symmetries",
	 * i.e. if there are multiple transformations that result in the same board.
	 * While not *strictly* a symmetrical board, a board that is identical after symbols are inverted can be considered symmetrical.
	 */
	public hasSymmetries(): boolean {
		return this.getAllUniqueTransformationBoardStrings().length < this.amountOfTransformations();
	}
	public getSymmetricalTransformationKeys(): TransformationKey[][] {
		const uniqueBoardStrings = this.getAllUniqueTransformationBoardStrings();
		const result: TransformationKey[][] = [];
		for (const boardString of uniqueBoardStrings) {
			const group: TransformationKey[] = [];
			for (const [key, value] of this.transformations) {
				if (value === boardString) {
					group.push(key);
				}
			}
			result.push(group);
		}
		return result;
	}

	public getRandomTransformationKey(opts: { skip?: TransformationKey[] } = {}): TransformationKey | null {
		const { skip = [] } = opts;
		const filteredKeys = this.getValidTransformationKeys().filter(key => !skip.includes(key));
		if (filteredKeys.length === 0) return null;
		return pickRandom(filteredKeys);
	}
	/**
	 * Returns a random TransformationKey valid for the current puzzle.
	 * It will never return two keys that produce the same board by checking the symmetrical groups and always picking one from those.
	 */
	public getRandomUniqueTransformationKey(opts: { skip?: TransformationKey[] } = {}): TransformationKey | null {
		const symmGroups = this.getSymmetricalTransformationKeys();
		const { skip = [] } = opts;
		// filters out groups that contain any of the keys in skip
		const filteredGroups = symmGroups.filter(group => {
			return group.every(key => !skip.includes(key));
		})
		if (filteredGroups.length === 0) {
			return null;
		}
		const group = pickRandom(filteredGroups);
		// always return the first key in the group, to stay consistent
		return group[0];
	}

	static subRot(a: RotationTransform, b: RotationTransform): RotationTransform {
		const aInt = parseInt(a.replace('rot', ''));
		const bInt = parseInt(b.replace('rot', ''));
		const resInt = (aInt - bInt + 360) % 360;
		return `rot${resInt}` as RotationTransform;
	}

	/**
	 * Get the record of all transformations, that was generated from the perspective of the inputGrid, and
	 * update it to be from the perspective of the canonicalForm.
	 * 
	 * @param canonicalKey The transformationKey that, when applied to the inputGrid, yields the canonicalForm.
	 * @param tempTransformations All transformed grids with their transformationKeys, from the perspective of the inputGrid
	 */
	static getTransformationsFromCanonicalForm(
		// the transformation used to get from inputGrid to canonicalForm
		canonicalKey: TransformationKey,
		tempTransformations: Partial<TransformationRecord<PuzzleGrid>>,
	): TransformationBoardStringsMap {
		const result = new Map();
		const [
			canonicalRot,
			canonicalFlip,
			canonicalInvert,
		] = getTransformationConfigFromKey(canonicalKey);
		for (const [origKey, grid] of Object.entries(tempTransformations)) {
			// origKey is the transformation to get this particular grid from the inputGrid
			const [
				origRot,
				origFlip,
				origInvert
			] = getTransformationConfigFromKey(origKey as TransformationKey);
			const boardString = SimpleBoard.gridToBoardString(grid);
			
			const expectedRot = canonicalFlip === 'noFlip' ? PuzzleTransformations.subRot(origRot, canonicalRot) : this.subRot(canonicalRot, origRot);
			const expectedFlip = origFlip === canonicalFlip ? 'noFlip' : 'flip';
			const expectedInvert = origInvert === canonicalInvert ? 'noInvert' : 'invertSymbols';
			// then the result is the expectedKey, which is the transformation to get a particular grid (generated from the inputGrid) but from the viewpoint of the canonicalForm; how to transform the canonicalForm to get that grid
			const expectedKey = getTransformationKey([expectedRot, expectedFlip, expectedInvert]);
			result.set(expectedKey, boardString);
		}
		return result;
	}

	static identifyCanonicalForm(transformations: Partial<TransformationRecord<PuzzleGrid>>): [TransformationKey, BoardString] {
		const entries = Object.entries(transformations) as [TransformationKey, PuzzleGrid][];
		const boardStringEntries = entries.map(([key, grid]) => {
			return [key, SimpleBoard.gridToBoardString(grid)] as [TransformationKey, BoardString];
		});
		boardStringEntries.sort((a, b) => a[1].localeCompare(b[1]));

		const [canonicalKey, canonicalBoardString] = boardStringEntries[0];
		return [canonicalKey, canonicalBoardString];
	}
}