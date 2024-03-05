import type { ToDynamicPuzzleString } from "@/components/dynamic-symbols/useDynamicPuzzleSymbolString.js";
import { ONE, ZERO } from "@/lib/constants.js";
import { lineSizeToNumRequired } from "@/lib/utils.js";
import type { BalanceSteppedHint } from "@/stores/hints/stepped-hint/BalanceHint.js";
import type { TriplesSteppedHint } from "@/stores/hints/stepped-hint/TriplesHint.js";
import type { SteppedHint } from "@/stores/hints/stepped-hint/types.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { type Ref, computed } from "vue";

type HintMessageFnArray<T extends SteppedHint> = ((hint: T, $p: ToDynamicPuzzleString) => string | { messageKey: string, namedProperties?: Record<string, string | number> })[];
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
	(hint) => ({
		messageKey: 'Hints.Balance.message-1',
		namedProperties: {
			rowOrColumn: hint.lineType === 'row' ? `Hints.common.row` : `Hints.common.column`,
		}
	}),
	(hint, $p) => {
		const puzzleStore = usePuzzleStore();
		const lineSize = hint.lineType === 'row' ? puzzleStore.board!.width : puzzleStore.board!.height;
		const numRequired = lineSizeToNumRequired(lineSize);
		let isOddSized = numRequired[ZERO] !== numRequired[ONE];

		const messageKey = isOddSized ? 'Hints.Balance.message-2-odd' : 'Hints.Balance.message-2';
		return { messageKey, namedProperties: {
			rowOrColumn: hint.lineType === 'row' ? `Hints.common.row` : `Hints.common.column`,
			symbolOrColor: $p('symbol', false),
			sourceSymbols: $p(hint.filledSymbol, true),
			reqZero: numRequired[ZERO],
			reqOne: numRequired[ONE],
			zeros: $p(ZERO, true),
			ones: $p(ONE, true),
		} };
	},
	(hint, $p) => {
		const puzzleStore = usePuzzleStore();
		const lineSize = hint.lineType === 'row' ? puzzleStore.board!.width : puzzleStore.board!.height;
		const numRequired = lineSizeToNumRequired(lineSize);

		const messageKey = hint.targets.length > 1 ? "Hints.Balance.message-3-multiple-targets" : "Hints.Balance.message-3-single-target";
		return { messageKey, namedProperties: {
			rowOrColumn: hint.lineType === 'row' ? `Hints.common.row` : `Hints.common.column`,
			target: $p(hint.missingSymbol, false),
			targets: $p(hint.missingSymbol, true),
			reqZero: numRequired[ZERO],
			reqOne: numRequired[ONE],
			zeros: $p(ZERO, true),
			ones: $p(ONE, true),
		} };
	}
] 


export const useSteppedHintMessage = (
	hint: Ref<SteppedHint>,
	stepIdx: Ref<number>,
	$p: ToDynamicPuzzleString,
) => {
	const message = computed((): string 
	| { messageKey: string, namedProperties?: Record<string, string | number> } | null => {
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