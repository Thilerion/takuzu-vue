// Search for "doubles" (.11 / 00.) or "sandwiches" (1.1 / 0.0) inside every unit of three cells in a board

import type { ThreesCoords, ThreesUnit } from "../board/ThreesUnit";
import { EMPTY, OPPOSITE_SYMBOL_MAP, type PuzzleSymbol } from "../constants";
import type { Target, Vec } from "../types";

const doublesLeft: ReadonlyArray<string> = ['.11', '.00'];
const doublesRight: ReadonlyArray<string> = ['11.', '00.'];
const doubles: ReadonlyArray<string> = [...doublesLeft, ...doublesRight];
const sandwiches: ReadonlyArray<string> = ['1.1', '0.0'];

type TriplesStrategyOptions = {
	detailed?: boolean
}
type TriplesStrategyNoResult = { found: false };
type TriplesSubtype = 'sandwich' | 'double';
type TriplesStrategyBasicResult = { found: true, target: Target };
type TriplesStrategyDetailedResult = {
	found: true;
	target: Target;
	type: TriplesSubtype;
	origin: readonly [Vec, Vec];
}
type TripleSymbols = [PuzzleSymbol, PuzzleSymbol, PuzzleSymbol];

const isTripleSymbols = (v: unknown[]): v is TripleSymbols => {
	return !(v.includes(EMPTY));
}

export function checkTriplesStrategy(threesUnit: ThreesUnit, options: { detailed: true }): TriplesStrategyNoResult | TriplesStrategyDetailedResult;
export function checkTriplesStrategy(threesUnit: ThreesUnit): TriplesStrategyNoResult | TriplesStrategyBasicResult;
export function checkTriplesStrategy(threesUnit: ThreesUnit, options: { detailed: false }): TriplesStrategyNoResult | TriplesStrategyBasicResult;
export function checkTriplesStrategy(threesUnit: ThreesUnit, options?: TriplesStrategyOptions) {
	if (!threesUnit) return { found: false };

	const { detailed = false } = options ?? {};

	// TODO: after threesUnit converted to TS, remove type cast
	const { values, coords } = threesUnit;
	
	if (!isTripleSymbols(values)) return { found: false } as TriplesStrategyNoResult;

	const valueStr = values.join('');
	if (sandwiches.includes(valueStr)) {
		return detailed ?
			getDetailedResult(coords, values, 1, true) :
			getBasicResult(coords, values, 1, 0);
		
	} else if (doubles.includes(valueStr)) {
		if (doublesLeft.includes(valueStr)) {
			return detailed ?
				getDetailedResult(coords, values, 0, false) :
				getBasicResult(coords, values, 0, 1);
			
		} else if (doublesRight.includes(valueStr)) {
			return detailed ?
				getDetailedResult(coords, values, 2, false) :
				getBasicResult(coords, values, 2, 1);
		}
	}
	return { found: false };
}

function getBasicResult(coords: ThreesCoords, values: TripleSymbols, targetIdx: number, sourceIdx: number): TriplesStrategyBasicResult {
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

function getDetailedResult(coords: ThreesCoords, values: TripleSymbols, targetIdx: number, isSandwich: boolean): TriplesStrategyDetailedResult {
	const sourceIdxA = (targetIdx + 1) % 3;
	const sourceIdxB = (targetIdx + 2) % 3;

	const { found, target } = getBasicResult(coords, values, targetIdx, sourceIdxA);
	const type = isSandwich ? 'sandwich' : 'double';
	const origin = [
		{ ...coords[sourceIdxA] },
		{ ...coords[sourceIdxB] },
	] as const;
	return { found, target, type, origin };
}