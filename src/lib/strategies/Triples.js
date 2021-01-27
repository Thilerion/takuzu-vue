// Search for "doubles" (.11 / 00.) or "sandwiches" (1.1 / 0.0) inside every unit of three cells in a board

import { EMPTY, OPPOSITE_VALUE } from "../constants";

const doublesLeft = ['.11', '.00'];
const doublesRight = ['11.', '00.'];
const doubles = [...doublesLeft, ...doublesRight];
const sandwiches = ['1.1', '0.0'];

export function checkTriplesStrategy(threesUnit) {
	if (!threesUnit) return { found: false };

	const { values, coords } = threesUnit;
	
	if (!values.includes(EMPTY)) return { found: false };
	
	const valueStr = values.join('');
	if (sandwiches.includes(valueStr)) {
		return {
			found: true,
			target: {
				x: coords[1].x,
				y: coords[1].y,
				value: OPPOSITE_VALUE[values[0]]
			}
		}
	} else if (doubles.includes(valueStr)) {
		if (doublesLeft.includes(valueStr)) {
			return {
				found: true,
				target: {
					x: coords[2].x,
					y: coords[2].y,
					value: OPPOSITE_VALUE[values[1]]
				}
			}
		} else if (doublesRight.includes(valueStr)) {
			return {
				found: true,
				target: {
					x: coords[0].x,
					y: coords[0].y,
					value: OPPOSITE_VALUE[values[1]]
				}
			}
		}
	}
	return { found: false };
}