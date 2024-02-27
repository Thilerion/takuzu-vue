import type { ToDynamicPuzzleString } from "@/components/dynamic-symbols/useDynamicPuzzleSymbolString.js";
import type { BalanceSteppedHint } from "@/stores/hints/stepped-hint/BalanceHint.js";
import type { TriplesSteppedHint } from "@/stores/hints/stepped-hint/TriplesHint.js";
import type { SteppedHint } from "@/stores/hints/stepped-hint/types.js";
import { type Ref, computed } from "vue";

type HintMessageFnArray<T extends SteppedHint> = ((hint: T, $p: ToDynamicPuzzleString) => string)[];
const TRIPLES_HINT_MESSAGES: HintMessageFnArray<TriplesSteppedHint> = [
	(hint) => `There is a ${hint.subType} somewhere on the board.`,
	(hint, $p) => `Three ${$p(hint.sourceSymbol, true)} cannot be next to each other. Therefore, the adjacent ${hint.targets.length > 1 ? 'cells' : 'cell'} can only possibly be one ${$p('symbol', false)}.`,
	(hint, $p) => {
		const SYMBOLS = $p('symbol', true);
		const SYMBOL = $p('symbol', false);
		const TARGET = $p(hint.targetSymbol, hint.targets.length > 1);
		const SOURCES = $p(hint.sourceSymbol, true);
		if (hint.subType === 'double') {
			return `Two equal ${SYMBOLS} (${SOURCES}) are next to each other. That means the surrounding cell${hint.targets.length > 1 ? 's' : ''} must be ${TARGET}.`;
		} else {
			return `An empty cell is surrounded by two of the same ${SYMBOL}. To prevent three of the same ${SYMBOLS} in a row, the empty cell must be ${TARGET}.`;
		}
	}
]
const BALANCE_HINT_MESSAGE: HintMessageFnArray<BalanceSteppedHint> = [
	(hint) => `There is a ${hint.lineType} on the board that can be balanced.`,
	(hint, $p) => {
		return `This ${hint.lineType} requires an equal amount of each ${$p('symbol')}, and all ${$p(hint.filledSymbol, true)} have been placed.`
	},
	(hint, $p) => {
		// TODO: handle odd-sized boards in this message
		return `To balance this ${hint.lineType} (so that an equal number of each ${$p('symbol')} are placed), ${hint.targets.length === 1 ? 'a ' : ''}${$p(hint.missingSymbol, hint.targets.length > 1)} must be placed in ${hint.targets.length > 1 ? 'these empty cells' : 'this empty cell'}.`
	}
] 


export const useSteppedHintMessage = (
	hint: Ref<SteppedHint>,
	stepIdx: Ref<number>,
	$p: ToDynamicPuzzleString,
) => {
	const message = computed((): string | null => {
		return getHintMessage(hint.value, stepIdx.value, $p);
	})
	return { message };
}

function getHintMessage(hint: SteppedHint, stepIdx: number, $p: ToDynamicPuzzleString) {
	if (hint.type === 'triples') {
		const fn = TRIPLES_HINT_MESSAGES.at(stepIdx);
		if (!fn) {
			console.error('No valid message found for triples hint step');
			return null;
		}
		return fn(hint, $p);
	} else if (hint.type === 'balance') {
		const fn = BALANCE_HINT_MESSAGE.at(stepIdx);
		if (!fn) {
			console.error('No valid message found for balance hint step');
			return null;
		}
		return fn(hint, $p);
	} else {
		console.error('No valid message found for hint type');
		return null;
	}
}