import { pickRandom } from "@/utils/random.utils.js";
import { puzzleGridToBoardString } from "../board/board-conversion.helpers.js";
import { getBoardShapeTypeFromGrid } from "../helpers/board-type.js";
import type { BoardString, PuzzleGrid } from "../types.js";
import { getTransformationKey, getTransformationConfigFromKey, generateAllValidTransformations } from "./helpers.js";
import type { TransformationKey, RotationTransform, TransformationBoardStringsMap, TransformationRecord } from "./types.js";

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

	/*================================================================
	 * STATIC CLASS INSTANTIATION METHODS
	 * ===============================================================*/

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
			const boardString = puzzleGridToBoardString(grid);
			result.set(key, boardString);
		}
		return new PuzzleTransformations(result);
	}

	/*================================================================
	 * METHODS FOR GETTING TRANSFORMATIONS/TRANSFORMATION KEYS AND CONFIGS/A SPECIFIC TRANSFORMATION
	 * ===============================================================*/

	public getAllTransformations(): Readonly<TransformationBoardStringsMap> {
		return this.transformations;
	}
	public getTransformationByKey(key: TransformationKey): BoardString | undefined {
		return this.transformations.get(key);
	}

	/**
	 * Get the TransformationKey that, when applied to the canonical grid,
	 * yields the grid supplied as the first argument.
	 */
	public getTransformationKeyOfGrid(grid: PuzzleGrid | BoardString): TransformationKey | undefined {
		const boardString = typeof grid === 'string' ? grid : puzzleGridToBoardString(grid);
		for (const [key, value] of this.transformations) {
			if (value === boardString) {
				return key;
			}
		}
		return undefined;
	}

	/** Get all TransformationKeys that are valid for the current grid. */
	public getValidTransformationKeys(): TransformationKey[] {
		return [...this.transformations.keys()];
	}
	/** Get all BoardStrings that are a transformation of the current (canonical) grid, or the canonical grid itself. */
	public getAllTransformationBoardStrings(): BoardString[] {
		return [...this.transformations.values()];
	}
	/** Get all BoardStrings that are a transformation of the current grid, without any duplicates. Duplicates could only happen if there are symmetries in the current grid. */
	public getAllUniqueTransformationBoardStrings(): BoardString[] {
		return [...new Set(this.getAllTransformationBoardStrings())];
	}
	/**
	 * The amount of valid transformations possible for the current grid.
	 * Includes the identity transformation.
	 */
	public amountOfTransformations(): number {
		return this.transformations.size;
	}
	/**
	 * The amount of valid transformations possible for the current grid that yield a unique transformed grid.
	 * Includes the identity transformation.
	 */
	public amountOfUniqueTransformations(): number {
		return this.getAllUniqueTransformationBoardStrings().length;
	}

	/*================================================================
	 * SYMMETRY-RELATED METHODS
	 * ===============================================================*/

	/**
	 * Checks whether the board has "symmetries",
	 * i.e. if there are multiple transformations that result in the same board.
	 * While not *strictly* a symmetrical board, a board that is identical after symbols are inverted can be considered symmetrical.
	 */
	public hasSymmetries(): boolean {
		return this.getAllUniqueTransformationBoardStrings().length < this.amountOfTransformations();
	}
	/**
	 * Get all TransformationKeys that, when applied to the current grid, yield the same board.
	 * @returns An array of arrays, where each sub-array contains all TransformationKeys that yield the same board.
	 */
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

	/*================================================================
	 * METHODS FOR GETTING RANDOM TRANSFORMATIONS
	 * ===============================================================*/

	/**
	 * Returns a random TransformationKey valid for the current puzzle.
	 * Allows skipping certain TransformationKeys, possibly because they were used recently and you don't want the random result to be the same as the previous one.
	 * If opts.uniqueOnly is true, it will never return two keys that produce the same board by checking the symmetrical groups and always picking one from those.
	 */
	public getRandomTransformationKey(opts: {
		uniqueOnly?: boolean,
		skip?: TransformationKey[]
	} = {}): TransformationKey | null {
		if (opts.uniqueOnly) {
			return this.getRandomUniqueTransformationKey(opts);
		}
		const { skip = [] } = opts;
		const filteredKeys = this.getValidTransformationKeys().filter(key => !skip.includes(key));
		if (filteredKeys.length === 0) return null;
		return pickRandom(filteredKeys);
	}
	/**
	 * Returns a random TransformationKey valid for the current puzzle.
	 * It will never return two keys that produce the same board by checking the symmetrical groups and always picking one from those.
	 */
	private getRandomUniqueTransformationKey(opts: { skip?: TransformationKey[] } = {}): TransformationKey | null {
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


	/*================================================================
	 * PRIVATE STATIC METHODS
	 * ===============================================================*/

	/**
	 * Subtract rotation a from rotation b (as RotationTransform strings), and return the result.\
	 * 
	 * @example
	 * subtractRotations('rot90', 'rot180') // returns 'rot270': 90 - 180 = -90, equal to 270
	 */
	private static subtractRotations(a: RotationTransform, b: RotationTransform): RotationTransform {
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
	private static getTransformationsFromCanonicalForm(
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
			const boardString = puzzleGridToBoardString(grid);

			const expectedRot = canonicalFlip === 'noFlip' ? PuzzleTransformations.subtractRotations(origRot, canonicalRot) : this.subtractRotations(canonicalRot, origRot);
			const expectedFlip = origFlip === canonicalFlip ? 'noFlip' : 'flip';
			const expectedInvert = origInvert === canonicalInvert ? 'noInvert' : 'invertSymbols';
			// then the result is the expectedKey, which is the transformation to get a particular grid (generated from the inputGrid) but from the viewpoint of the canonicalForm; how to transform the canonicalForm to get that grid
			const expectedKey = getTransformationKey([expectedRot, expectedFlip, expectedInvert]);
			result.set(expectedKey, boardString);
		}
		return result;
	}

	private static identifyCanonicalForm(transformations: Partial<TransformationRecord<PuzzleGrid>>): [TransformationKey, BoardString] {
		const entries = Object.entries(transformations) as [TransformationKey, PuzzleGrid][];
		const boardStringEntries = entries.map(([key, grid]) => {
			return [key, puzzleGridToBoardString(grid)] as [TransformationKey, BoardString];
		});
		boardStringEntries.sort((a, b) => a[1].localeCompare(b[1]));

		const [canonicalKey, canonicalBoardString] = boardStringEntries[0];
		return [canonicalKey, canonicalBoardString];
	}
}