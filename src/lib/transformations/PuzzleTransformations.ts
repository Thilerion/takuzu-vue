import { type BoardShapeType, getBoardShapeTypeFromGrid } from "../helpers/board-type.js";
import { SimpleBoard } from "../index.js";
import type { BoardString, PuzzleGrid } from "../types.js";
import { createCombinedTransformationFn } from "./base-transformations.js";
import { squareBoardTransformationConfigs, rectBoardTransformationConfigs, oddBoardTransformationConfigs, getTransformationKey } from "./helpers.js";
import { rotationValues, type BaseTransformationConfig, type FlipTransform, type RotationTransform, type SymbolInversionTransform, type TransformationKey } from "./types.js";

export class PuzzleTransformations {
    private transformations: Map<TransformationKey, BoardString>;
    private boardShapeType: BoardShapeType;

	constructor(inputGrid: PuzzleGrid) {
		this.boardShapeType = getBoardShapeTypeFromGrid(inputGrid);

		// 1. generate all transformations from viewpoint of inputGrid, and temporarily store these
		// 2. find canonical form of inputGrid, using stringify and lexical ordering
		// 3. store canonical form in this.canonicalForm
		// 4. adjust all transformations to be relative to the canonical form by either: 
		//    a. applying the inverse of the transformation to the canonical form, or
		//	  b. redoing the transformation from the viewpoint of the canonical form (inefficient, slower but easier)
		// 5. store reordered transformations in this.transformations

		const tempTransformations: Partial<Record<TransformationKey, PuzzleGrid>> = this.generateAllTransformations(inputGrid);
		const [canonicalKey, canonicalForm] = this.identifyCanonicalForm(tempTransformations);
		this.transformations = this.efficientGetTransformationsFromCanonicalForm(
			canonicalKey,
			tempTransformations,
		)
	}

	get canonicalForm(): BoardString {
		return this.transformations.get('rot0_noFlip_noInvert')!;
	}
	public getAllTransformations(): ReadonlyMap<TransformationKey, BoardString> {
		return this.transformations;
	}

	public getTransformationByKey(key: TransformationKey): BoardString | undefined {
		return this.transformations.get(key);
	}
	public getTransformationByConfig(config: BaseTransformationConfig): BoardString | undefined {
		const key = getTransformationKey(config);
		return this.getTransformationByKey(key);
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

	private subRot(a: RotationTransform, b: RotationTransform): RotationTransform {
		const aInt = parseInt(a.replace('rot', ''));
		const bInt = parseInt(b.replace('rot', ''));
		const resInt = (aInt - bInt + 360) % 360;
		return `rot${resInt}` as RotationTransform;
	}
	private efficientGetTransformationsFromCanonicalForm(
		canonicalKey: TransformationKey,
		tempTransformations: Partial<Record<TransformationKey, PuzzleGrid>>,
	): Map<TransformationKey, BoardString> {
		const result = new Map<TransformationKey, BoardString>();
		const [
			canonicalRot,
			canonicalFlip,
			canonicalInvert,
		] = canonicalKey.split('_') as [RotationTransform, FlipTransform, SymbolInversionTransform];
		for (const [origKey, grid] of Object.entries(tempTransformations)) {
			const [
				origRot,
				origFlip,
				origInvert
			] = origKey.split('_') as [RotationTransform, FlipTransform, SymbolInversionTransform];
			const boardString = SimpleBoard.gridToBoardString(grid);
			
			const expectedRot = canonicalFlip === 'noFlip' ? this.subRot(origRot, canonicalRot) : this.subRot(canonicalRot, origRot);
			const expectedFlip = origFlip === canonicalFlip ? 'noFlip' : 'flip';
			const expectedInvert = origInvert === canonicalInvert ? 'noInvert' : 'invertSymbols';
			const expectedKey = getTransformationKey([expectedRot, expectedFlip, expectedInvert]);
			result.set(expectedKey, boardString);
		}
		return result;
	}

	private getTransformationsFromCanonicalForm(
		canonicalForm: BoardString,
	): Map<TransformationKey, BoardString> {
		const result = new Map<TransformationKey, BoardString>();
		const grid = SimpleBoard.fromString(canonicalForm).grid;
		const record = this.generateAllTransformations(grid);
		for (const [key, grid] of Object.entries(record)) {
			result.set(key as TransformationKey, SimpleBoard.gridToBoardString(grid));
		}
		return result;
	}

	private generateAllTransformations(grid: PuzzleGrid): Partial<Record<TransformationKey, PuzzleGrid>> {
		const configs = this.getTransformationConfigs();
		const result: Partial<Record<TransformationKey, PuzzleGrid>> = {};
        configs.forEach(config => {
            const key = getTransformationKey(config);
			const transformedGrid = this.applyTransformation(grid, config);
			result[key] = transformedGrid;
        });
		return result;
	}
	private getTransformationConfigs(): readonly BaseTransformationConfig[] {
		switch (this.boardShapeType) {
            case 'square':
                return squareBoardTransformationConfigs;
            case 'rect':
                return rectBoardTransformationConfigs;
            case 'odd':
                return oddBoardTransformationConfigs;
            default:
                throw new Error(`Unsupported board type: ${this.boardShapeType}`);
        }
	}
	private applyTransformation(grid: PuzzleGrid, config: BaseTransformationConfig): PuzzleGrid {
		const transformationFn = createCombinedTransformationFn(config);
        return transformationFn(grid);
	}
	private identifyCanonicalForm(transformations: Partial<Record<TransformationKey, PuzzleGrid>>): [TransformationKey, BoardString] {
		const entries = Object.entries(transformations) as [TransformationKey, PuzzleGrid][];
		const boardStringEntries = entries.map(([key, grid]) => {
			return [key, SimpleBoard.gridToBoardString(grid)] as [TransformationKey, BoardString];
		});
		boardStringEntries.sort((a, b) => a[1].localeCompare(b[1]));

		const [canonicalKey, canonicalBoardString] = boardStringEntries[0];
		return [canonicalKey, canonicalBoardString];
	}
}