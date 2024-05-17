import { BalanceSteppedHint } from "./BalanceHint.js";
import { GenericDuplicateLineSteppedHint } from "./GenericDuplicateLineHint.js";
import { GenericEliminationSteppedHint } from "./GenericEliminationHint.js";
import { IncorrectValuesSteppedHint } from "./IncorrectValuesHint.js";
import { NoHintsFoundSteppedHint } from "./NoHintsFoundHint.js";
import { TriplesSteppedHint } from "./TriplesHint.js";
import type { SteppedHint, SteppedHintRawData } from "./types.js";

export function exportSteppedHint<H extends SteppedHint>(hint: H): H['rawData'] {
	return { ...hint.rawData };
}

export function importSteppedHint(data: SteppedHintRawData): SteppedHint {
	const type = data.type;
	switch(type) {
		case 'triples': {
			return new TriplesSteppedHint(data.data, data.id);
		}
		case 'balance': {
			return new BalanceSteppedHint(data.data, data.id);
		}
		case 'eliminationGeneric': {
			return new GenericEliminationSteppedHint(data.data, data.id);
		}
		case 'duplicateLineGeneric': {
			return new GenericDuplicateLineSteppedHint(data.data, data.id);
		}
		case 'incorrectValues': {
			return new IncorrectValuesSteppedHint(data.data, data.id);
		}
		case 'noHintsFound': {
			return new NoHintsFoundSteppedHint(data.data, data.id);
		}
		default: {
			const x: never = type;
			throw new Error(`Cannot import hint with unknown hint type: ${x}`);
		}
	}
}