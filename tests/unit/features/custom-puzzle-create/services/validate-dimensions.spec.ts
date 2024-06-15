import { validateCustomPuzzleDimensions } from "@/features/puzzle-editor/services/validate-dimensions.js"

describe('validateCustomPuzzleDimensions', () => {
	describe('checks for valid integers', () => {
		test('returns false for floats', () => {
			expect(validateCustomPuzzleDimensions({ width: 1.5, height: 1.5 })).toEqual({
				valid: false,
				type: 'non-integer',
				width: 1.5,
				height: 1.5
			})
			expect(validateCustomPuzzleDimensions({ width: 1.5, height: 2 })).toEqual({
				valid: false,
				type: 'non-integer',
				width: 1.5,
				height: null
			})
		})
	})

	describe('checks for min and max dimensions', () => {
		test('returns false for width and height below min', () => {
			expect(validateCustomPuzzleDimensions({ width: 3, height: 3 }, {
				min: 4,
				max: 20
			})).toEqual({
				valid: false,
				type: 'range',
				width: 'low',
				height: 'low'
			})

			expect(validateCustomPuzzleDimensions({ width: 10, height: 5 }, {
				min: 6, // different min
				max: 20
			})).toEqual({
				valid: false,
				type: 'range',
				width: null,
				height: 'low'
			})
		})

		test('returns false + "high" for width and height above max', () => {
			expect(validateCustomPuzzleDimensions({ width: 21, height: 5 }, {
				min: 4,
				max: 20
			})).toEqual({
				valid: false,
				type: 'range',
				width: 'high',
				height: null
			})
		})
	})

	describe('checks for incompatible dimensions, where only one side is odd', () => {
		it('returns false for odd width and even height', () => {
			expect(validateCustomPuzzleDimensions({ width: 5, height: 6 }, {
				min: 1,
				max: 20
			})).toEqual({
				valid: false,
				type: 'incompatible:odd',
			})
		})
	})

	describe('checks for incompatible dimensions, where the ratio is too stretched', () => {
		test('returns false for ratio > max', () => {
			expect(validateCustomPuzzleDimensions({ width: 10, height: 20 }, {
				min: 1,
				max: 20,
				maxAspectRatio: 1.5
			})).toEqual({
				valid: false,
				type: 'incompatible:ratio',
			})
		})

		it('returns true for ratio === max', () => {
			expect(validateCustomPuzzleDimensions({ width: 10, height: 20 }, {
				min: 1,
				max: 20,
				maxAspectRatio: 2
			})).toEqual({
				valid: true,
			})
		})

		it('returns true for ratio < max', () => {
			expect(validateCustomPuzzleDimensions({ width: 10, height: 20 }, {
				min: 1,
				max: 20,
				maxAspectRatio: 2.1
			})).toEqual({
				valid: true,
			})
		})

		it('handles small side of 4 differently', () => {
			expect(validateCustomPuzzleDimensions({ width: 4, height: 8 }, {
				min: 1,
				max: 20,
				maxAspectRatio: 1000
			})).toEqual({
				valid: false,
				type: 'incompatible:ratio',
			})

			expect(validateCustomPuzzleDimensions({ width: 4, height: 6 }, {
				min: 1,
				max: 20,
				maxAspectRatio: 1000
			})).toEqual({
				valid: true,
			})
		})
    })
})