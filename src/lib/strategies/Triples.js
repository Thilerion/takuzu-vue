// Search for "doubles" (.11 / 00.) or "sandwiches" (1.1 / 0.0) inside every unit of three cells in a board

import { EMPTY, OPPOSITE_SYMBOL_MAP } from "../constants";

const doublesLeft = ['.11', '.00'];
const doublesRight = ['11.', '00.'];
const doubles = [...doublesLeft, ...doublesRight];
const sandwiches = ['1.1', '0.0'];

export function checkTriplesStrategy(threesUnit, options = {}) {
	if (!threesUnit) return { found: false };

	const { expanded = false } = options;

	const { values, coords } = threesUnit;
	
	if (!values.includes(EMPTY)) return { found: false };
	
	const valueStr = values.join('');
	if (sandwiches.includes(valueStr)) {
		return expanded ?
			getExpandedResult(coords, values, 1, true) :
			getBasicResult(coords, values, 1, 0);
		
	} else if (doubles.includes(valueStr)) {
		if (doublesLeft.includes(valueStr)) {
			return expanded ?
				getExpandedResult(coords, values, 0, false) :
				getBasicResult(coords, values, 0, 1);
			
		} else if (doublesRight.includes(valueStr)) {
			return expanded ?
				getExpandedResult(coords, values, 2, false) :
				getBasicResult(coords, values, 2, 1);
		}
	}
	return { found: false };
}

function getBasicResult(coords, values, targetIdx, sourceIdx) {
	const targetCoords = coords[targetIdx];
	return {
		found: true,
		target: {
			x: targetCoords.x,
			y: targetCoords.y,
			value: OPPOSITE_SYMBOL_MAP[values[sourceIdx]]
		}
	}
}

function getExpandedResult(coords, values, targetIdx, isSandwich) {
	const sourceIdxA = (targetIdx + 1) % 3;
	const sourceIdxB = (targetIdx + 2) % 3;

	const { found, target } = getBasicResult(coords, values, targetIdx, sourceIdxA);
	const type = isSandwich ? 'sandwich' : 'double';
	const origin = [
		{ ...coords[sourceIdxA] },
		{ ...coords[sourceIdxB] },
	];
	return { found, target, type, origin };
}