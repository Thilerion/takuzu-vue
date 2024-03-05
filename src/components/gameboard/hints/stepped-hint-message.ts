import type { ToDynamicPuzzleString } from "@/components/dynamic-symbols/useDynamicPuzzleSymbolString.js";
import type { BalanceSteppedHint } from "@/stores/hints/stepped-hint/BalanceHint.js";
import type { TriplesSteppedHint } from "@/stores/hints/stepped-hint/TriplesHint.js";
import type { SteppedHint } from "@/stores/hints/stepped-hint/types.js";
import { type Ref, computed } from "vue";

type HintMessageFnArray<T extends SteppedHint> = ((hint: T, $p: ToDynamicPuzzleString) => string | { messageKey: string, namedProperties?: Record<string, string> })[];
const TRIPLES_HINT_MESSAGES: HintMessageFnArray<TriplesSteppedHint> = [
	// TODO: separate messages for when colored tiles are used, is much easier than introducing many variables in the same messages
	// TODO: "a 1" or "a red tile" as additional message: so an article preceding the symbol might sometimes be used
	(hint) => ({ messageKey: 'Hints.Triples.messages[0]', namedProperties: { subType: `Hints.Triples.${hint.subType === 'sandwich' ? 'sandwich' : 'pair' }` }}),
	(hint, $p) => ({
		messageKey: 'Hints.Triples.messages[1]',
		namedProperties: {
			sourceSymbol: $p(hint.sourceSymbol, true),
			surroundingCells: hint.targets.length > 1 ? 'Hints.common.surrounding-cells' : 'Hints.common.adjacent-cell',
			symbolOrColor: $p('symbol', false),
		}
	}),
	(hint, $p) => {
		const messageKey = hint.subType === "double" ? 'Hints.Triples.messages[2].pair' : 'Hints.Triples.messages[2].sandwich';
		const surroundingCells = hint.targets.length > 1 ? 'Hints.common.surrounding-cells' : 'Hints.common.adjacent-cell';
		return {
			messageKey,
			namedProperties: {
				source: $p(hint.sourceSymbol, true),
				surroundingCells,
				target: $p(hint.targetSymbol, hint.targets.length > 1),
				symbolOrColor: $p('symbol', false),
				symbolOrColorPlural: $p('symbol', true),
			}
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
	const message = computed((): string 
	| { messageKey: string, namedProperties?: Record<string, string> } | null => {
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