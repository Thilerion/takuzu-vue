import { arrayCountValuesAsMap } from "@/utils/array.ts.utils.js";
import type { SimpleBoard } from "../board/Board.js";
import { ZERO, ONE } from "../constants.js";
import type { BoardShape, DimensionStr } from "../types.js";
import { getMaskRatio } from "../board/Board.helpers.js";

const maskRatioTargets = new Map<DimensionStr | 'default', MaskQualityRange>([
	['default', { min: 0.70, optimal: 0.78 }],

	['4x4', { min: 0.65, optimal: 0.6875 }],
	['6x6', { min: 0.72, optimal: 0.81 }],
	['8x8', { min: 0.72, optimal: 0.81 }],
	['10x10', { min: 0.72, optimal: 0.81 }],
	['12x12', { min: 0.72, optimal: 0.76 }],
	['14x14', { min: 0.72, optimal: 0.75 }],
	['16x16', { min: 0.72, optimal: 0.74 }],

	['5x5', { min: 0.68, optimal: 0.72 }],
	['7x7', { min: 0.72, optimal: 0.81 }],
	['9x9', { min: 0.72, optimal: 0.81 }],
	['11x11', { min: 0.72, optimal: 0.75 }],
	['13x13', { min: 0.72, optimal: 0.74 }],

	['6x10', { min: 0.72, optimal: 0.81 }],
	['8x12', { min: 0.72, optimal: 0.81 }],
	['10x14', { min: 0.72, optimal: 0.79 }],
	['12x16', { min: 0.72, optimal: 0.78 }],
])

export type MaskQualityRange = { min: number, optimal: number };

export type GetMaskQualityCheckerOpts = {
	maskRatioTarget?: MaskQualityRange,
	minSymbolDistribution?: number,
}
export type MaskQualityResult = {
	maskRatio: number,
	symbolDistribution: number,
	success: boolean,
}
export type CheckMaskQualityOpts = {
	/** A number between 0 and 1 that determines how strict to adhere to the "optimal" values */
	strictness?: number,
}

/** Assesses the quality of the mask: its masking ratio, and its symbol distribution, with a specified strictness to determine if it passes the minimum values. */
export type CheckMaskQualityFn = (board: SimpleBoard, opts?: CheckMaskQualityOpts) => MaskQualityResult;

export function getMaskQualityChecker(
	shape: BoardShape,
	opts: GetMaskQualityCheckerOpts = {}
): CheckMaskQualityFn {
	const maskRatioTargetRange = getMaskRatioTargetRange(shape, opts);
	const { minSymbolDistribution = 0.25 } = opts;

	return (board: SimpleBoard, opts: CheckMaskQualityOpts = {}) => {
		const {
			strictness = 1,
		} = opts;
		
		const maskRatio = getMaskRatio(board);
		const symbolDistribution = getSymbolDistributionRatio(board);

		let success = true;

		// Determine the absolute minimum mask ratio, based on the strictness (where 1 means it must be at least "optimal", and 0 means it must be at least "min")
		const minMaskRatio = getMinQualityWithStrictness(maskRatioTargetRange, strictness);

		if (maskRatio < minMaskRatio) {
			success = false;
		} else if (symbolDistribution < minSymbolDistribution) {
			success = false;
		}

		return {
			maskRatio,
			symbolDistribution,
			success,
		}
	}
}

/** Gives the (lowest) symbol distribution between 0 and 0.5, with 0 meaning all given values are the same, and 0.5 meaning they are equally distributed. */
function getSymbolDistributionRatio(board: SimpleBoard): number {
	const symbolCounts = arrayCountValuesAsMap([...board.grid].flat());
	const countZero = symbolCounts.get(ZERO)!;
	const countOne = symbolCounts.get(ONE)!;
	const numFilled = countZero + countOne;

	const symbolRatioZero = countZero / numFilled;
	const symbolRatioOne = countOne / numFilled;
	
	// Ratio of the least common symbol. Best if higher than 0.35, with a max of 0.5 possible when both symbols are equally given.
	const symbolRatio = Math.min(symbolRatioOne, symbolRatioZero);
	return symbolRatio;
}

function getMaskRatioTargetRange(shape: BoardShape, opts?: GetMaskQualityCheckerOpts): MaskQualityRange {
	if (opts?.maskRatioTarget) {
		return opts.maskRatioTarget;
	}
	let key: DimensionStr | 'default' = `${shape.width}x${shape.height}` as DimensionStr;
	if (!maskRatioTargets.has(key)) {
		key = 'default';
	}
	return maskRatioTargets.get(key)!;
}

function getMinQualityWithStrictness(qualityRange: MaskQualityRange, strictness: number) {
	return qualityRange.min + (qualityRange.optimal - qualityRange.min) * strictness;
}