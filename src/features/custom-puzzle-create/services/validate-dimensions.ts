import type { BoardShape } from "@/lib/types.js";

export const CUSTOM_PUZZLE_MIN_SIZE = 4;
export const CUSTOM_PUZZLE_MAX_SIZE = 16;
export const CUSTOM_PUZZLE_MAX_ASPECT_RATIO = 2.49;

export type ValidateCustomPuzzleDimensionsOpts = {
	min?: number;
	max?: number;
	minAspectRatio?: number;
}
export type CustomPuzzleInvalidRange = "high" | "low";

export type CustomPuzzleDimensionsInvalidRangeResult = {
	valid: false,
	type: 'range',
	width: CustomPuzzleInvalidRange | null,
	height: CustomPuzzleInvalidRange | null,
}
// Type that indicates that one or both dimensions are invalid as they are not valid integers
export type CustomPuzzleDimensionsInvalidNonIntegerResult = {
	valid: false,
	type: 'non-integer',
	/** If width is valid, null */
	width: number | null,
	/** If height is valid, null */
	height: number | null,
}
export type CustomPuzzleDimensionsIncompatibleResult = {
	valid: false,
	type: 'incompatible:odd' | 'incompatible:ratio',
}
export type CustomPuzzleDimensionsValidationResult = {
	valid: true;
} | CustomPuzzleDimensionsInvalidRangeResult | CustomPuzzleDimensionsIncompatibleResult | CustomPuzzleDimensionsInvalidNonIntegerResult;

export type CustomPuzzleDimensionsInvalidResultType = Extract<CustomPuzzleDimensionsValidationResult, { valid: false }>['type'];

export const validateCustomPuzzleDimensions = (
	dimensions: BoardShape,
	opts: ValidateCustomPuzzleDimensionsOpts = {}
): CustomPuzzleDimensionsValidationResult => {
	const { width, height } = dimensions;

	// Check that width and height are both integers (i.e. not floats and not NaN)
	const widthIsValidInteger = Number.isInteger(width);
	const heightIsValidInteger = Number.isInteger(height);
	
	if (!widthIsValidInteger || !heightIsValidInteger) {
		return {
			valid: false,
			type: "non-integer",
			width: widthIsValidInteger ? null : width,
			height: heightIsValidInteger ? null : height,
		}
	}

	const {
		min = CUSTOM_PUZZLE_MIN_SIZE,
		max = CUSTOM_PUZZLE_MAX_SIZE,
	} = opts;

	const widthTooLow = width < min;
	const heightTooLow = height < min;
	const widthTooHigh = width > max;
	const heightTooHigh = height > max;

	const highLowInvalid = widthTooLow || heightTooLow || widthTooHigh || heightTooHigh;

	if (highLowInvalid) {
		return {
			valid: false,
			type: "range",
			width: widthTooLow ? "low" : widthTooHigh ? "high" : null,
			height: heightTooLow ? "low" : heightTooHigh ? "high" : null,
		}
	}

	// Check that, if one of the dimensions is odd, the other is odd as well
	const widthIsOdd = width % 2 === 1;
	const heightIsOdd = height % 2 === 1;

	if (widthIsOdd && !heightIsOdd || !widthIsOdd && heightIsOdd) {
		// Return an invalid result that indicates that the dimensions are not compatible due to one being odd
		return {
			valid: false,
			type: "incompatible:odd"
		}
	}

	// Check that the ratio between width and height is not "too stretched", because then it absolutely cannot be solved
	// The longest side cannot be more than 2.5 times the shortest side (by default)
	const ratio = Math.max(width, height) / Math.min(width, height);
	if (ratio > CUSTOM_PUZZLE_MAX_ASPECT_RATIO) {
		return {
			valid: false,
			type: "incompatible:ratio"
		}
	}

	return {
		valid: true
	}
}