import type { ThreesCoords, ThreesUnit } from "@/lib/board/ThreesUnit.js";
import { EMPTY, ONE, ZERO } from "@/lib/constants.js";
import { checkTriplesStrategy2 } from "@/lib/solvers/common/TriplesStrategy.js";
import type { Vec } from "@/lib/types.js";

const asMockUnit = (obj: { values: string[], coords: Vec[] }): ThreesUnit => {
	return obj as unknown as ThreesUnit;
}

describe('checkTriplesStrategy2', () => {
	it('should return the correct result for double strategy', () => {
	  const unit = asMockUnit({
		values: [ONE, ONE, EMPTY],
		coords: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]
	  })
	  const result = checkTriplesStrategy2(unit);

	  expect(result).toMatchObject({
		found: true,
		data: {
		  type: 'double',
		  target: {
			value: ZERO,
			x: 0,
			y: 2
		  },
		  origin: [{ x: 0, y: 0 }, { x: 0, y: 1 }]
		}
	  })
	});
  
	it('should return the correct result for sandwich strategy', () => {
	  const unit = asMockUnit({
		values: [ONE, EMPTY, ONE],
		coords: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }]
	  });
	  const result = checkTriplesStrategy2(unit);
	  expect(result).toMatchObject({
		found: true,
		data: {
		  type: 'sandwich',
		  target: {
			value: ZERO,
			x: 0,
			y: 1
		  },
		  origin: [{ x: 0, y: 0 }, { x: 0, y: 2 }]
		}
	  });
	});

	it('should return the correct result when no strategy is found due to no matching patterns', () => {
		const expected = { found: false };
		const coords = [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] as ThreesCoords;

		expect(checkTriplesStrategy2(
			asMockUnit({
				values: [ONE, ONE, ZERO],
				coords
			})
		)).toEqual(expected);

		expect(checkTriplesStrategy2(
			asMockUnit({
				values: [EMPTY, EMPTY, EMPTY],
				coords
			})
		)).toEqual(expected);

		expect(checkTriplesStrategy2(
			asMockUnit({
				values: [ONE, EMPTY, ZERO],
				coords
			})
		)).toEqual(expected);
	  });
  });