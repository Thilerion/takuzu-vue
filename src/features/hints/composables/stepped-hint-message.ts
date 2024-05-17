import type { ToDynamicPuzzleString } from "@/components/dynamic-symbols/useDynamicPuzzleSymbolString.js";
import { ONE, ROW, ZERO } from "@/lib/constants.js";
import { lineSizeToNumRequired, lineTypeFromLineId } from "@/lib/utils/puzzle-line.utils";
import type { BalanceSteppedHint } from "@/features/hints/services/SteppedHint/BalanceHint.js";
import type { GenericDuplicateLineSteppedHint } from "@/features/hints/services/SteppedHint/GenericDuplicateLineHint.js";
import type { GenericEliminationSteppedHint } from "@/features/hints/services/SteppedHint/GenericEliminationHint.js";
import type { IncorrectValuesSteppedHint } from "@/features/hints/services/SteppedHint/IncorrectValuesHint.js";
import type { TriplesSteppedHint } from "@/features/hints/services/SteppedHint/TriplesHint.js";
import type { SteppedHint } from "@/features/hints/services/SteppedHint/types.js";
import { usePuzzleStore } from "@/stores/puzzle/store.js";
import { type Ref, computed } from "vue";

type HintMessageFnArray<T extends SteppedHint> = ((hint: T, $p: ToDynamicPuzzleString) => string | { messageKey: string, namedProperties?: Record<string, string | number> })[];
const TRIPLES_HINT_MESSAGES: HintMessageFnArray<TriplesSteppedHint> = [
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
		const isOddSized = numRequired[ZERO] !== numRequired[ONE];

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

const INCORRECT_VALUES_HINT_MESSAGE: HintMessageFnArray<IncorrectValuesSteppedHint> = [
	() => ({
		messageKey: 'Hints.IncorrectValues.message-1',
	}),
	() => ({ messageKey: 'Hints.IncorrectValues.message-2' }),
]

const ELIMINATION_GENERIC_HINT_MESSAGE: HintMessageFnArray<GenericEliminationSteppedHint> = [
	(hint, $p) => ({ 
		messageKey: hint.targets.length > 1 ? 'Hints.EliminationGeneric.message-1-multiple-targets' : 'Hints.EliminationGeneric.message-1-single-target',
		namedProperties: {
			symbolOrColor: $p('symbol', false),
			rowOrColumn: lineTypeFromLineId(hint.lineId) === ROW ? 'Hints.common.row' : 'Hints.common.column',
		}
	}),
	(hint, $p) => ({
		messageKey: hint.targets.length > 1 ? 'Hints.EliminationGeneric.message-2-multiple-targets' : 'Hints.EliminationGeneric.message-2-single-target',
		namedProperties: {
			rowOrColumn: lineTypeFromLineId(hint.lineId) === ROW ? 'Hints.common.row' : 'Hints.common.column',
			symbolOrColor: $p('symbol', false),
		}
	}),
	(hint, $p) => ({
		messageKey: hint.targets.length > 1 ? 'Hints.EliminationGeneric.message-3-multiple-targets' : 'Hints.EliminationGeneric.message-3-single-target',
		namedProperties: {
			symbolOrColorPlural: $p('symbol', true),
		}
	}),
]
const DUPLICATE_LINE_GENERIC_HINT_MESSAGE: HintMessageFnArray<GenericDuplicateLineSteppedHint> = [
	(hint, $p) => {
		// There is a completed @:{rowOrColumn} with similarities to an incomplete @:{rowOrColumn}. There is one way of placing values to prevent them from being duplicates.
		const hasMultiplePotentialDuplicateLines = hint.potentialDuplicateLines.length > 1;
		const messageKey = `Hints.DuplicateLineGeneric.message-1.${hasMultiplePotentialDuplicateLines ? 'multiple-comparisons' : 'single-comparison'}`;

		const lineType = lineTypeFromLineId(hint.lineId);
		return {
			messageKey,
			namedProperties: {
				rowOrColumn: lineType === 'row' ? 'Hints.common.row' : 'Hints.common.column',
				rowsOrColumns: lineType === 'row' ? 'Hints.common.rows' : 'Hints.common.columns',
				symbolOrColorPlural: $p('symbol', true),
			}
		};
	},
	(hint, $p) => {
		// Compare this row to the incomplete rows. Are there any that, when certain values are placed, are potential duplicates?
		// Compare these rows to the incomplete rows. Are there any that, when certain values are placed, are potential duplicates?
		const lineType = lineTypeFromLineId(hint.lineId);
		const hasMultiplePotentialDuplicateLines = hint.potentialDuplicateLines.length > 1;
		const messageKey = `Hints.DuplicateLineGeneric.message-2.${hasMultiplePotentialDuplicateLines ? 'multiple-comparisons' : 'single-comparison'}`;
		return {
			messageKey,
			namedProperties: {
				rowOrColumn: lineType === 'row' ? 'Hints.common.row' : 'Hints.common.column',
				rowsOrColumns: lineType === 'row' ? 'Hints.common.rows' : 'Hints.common.columns',
				symbolOrColorPlural: $p('symbol', true),
			}
		}
	},
	(hint, $p) => {
		// This row is similar to the completed row. Placing colors in certain cells will result in them being the same, which is not allowed.
		// This row is similar to those completed rows. Placing colors in certain cells will result in them being the same, which is not allowed.
		const comparisonKey = hint.potentialDuplicateLines.length > 1 ? 'multiple-comparisons' : 'single-comparison';
		const targetKey = hint.targets.length > 1 ? 'multiple-targets' : 'single-target';
		const messageKey = `Hints.DuplicateLineGeneric.message-3.${comparisonKey}.${targetKey}`;
		const lineType = lineTypeFromLineId(hint.lineId);
		return {
			messageKey,
			namedProperties: {
				rowOrColumn: lineType === 'row' ? 'Hints.common.row' : 'Hints.common.column',
				rowsOrColumns: lineType === 'row' ? 'Hints.common.rows' : 'Hints.common.columns',
				symbolOrColorPlural: $p('symbol', true),
			}
		}
	},
	(hint) => {
		// [These cells/This cell] can only be filled in one way to prevent this @:{rowOrColumn} from being a duplicate of the already completed @:{rowOrColumn}.
		const comparisonKey = hint.potentialDuplicateLines.length > 1 ? 'multiple-comparisons' : 'single-comparison';
		const targetKey = hint.targets.length > 1 ? 'multiple-targets' : 'single-target';
		const messageKey = `Hints.DuplicateLineGeneric.message-4.${comparisonKey}.${targetKey}`;
		const lineType = lineTypeFromLineId(hint.lineId);
		return {
			messageKey,
			namedProperties: {
				rowOrColumn: lineType === 'row' ? 'Hints.common.row' : 'Hints.common.column',
				rowsOrColumns: lineType === 'row' ? 'Hints.common.rows' : 'Hints.common.columns',
			}
		}
	},
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
	const hintType = hint.type;
	switch(hintType) {
		case 'triples': {
			const fn = TRIPLES_HINT_MESSAGES.at(stepIdx);
			if (!fn) {
				console.error('No valid message found for triples hint step');
				return null;
			}
			return fn(hint, $p);
		}
		case 'balance': {
			const fn = BALANCE_HINT_MESSAGE.at(stepIdx);
			if (!fn) {
				console.error('No valid message found for balance hint step');
				return null;
			}
			return fn(hint, $p);
		}
		case 'incorrectValues': {
			const fn = INCORRECT_VALUES_HINT_MESSAGE.at(stepIdx);
			if (!fn) {
				console.error('No valid message found for incorrect values hint step');
				return null;
			}
			return fn(hint, $p);
		}
		case 'eliminationGeneric': {
			const fn = ELIMINATION_GENERIC_HINT_MESSAGE.at(stepIdx);
			if (!fn) {
				console.error('No valid message found for generic elimination hint step');
				return null;
			}
			return fn(hint, $p);
		}
		case 'noHintsFound': {
			if (stepIdx !== 0) {
				console.error('No valid message found for no hints found hint step');
				return null;
			}
			return { messageKey: 'Hints.NoHintsFound.message' };
		}
		case 'duplicateLineGeneric': {
			const fn = DUPLICATE_LINE_GENERIC_HINT_MESSAGE.at(stepIdx);
			if (!fn) {
				console.error('No valid message found for generic duplicate line hint step');
				return null;
			}
			return fn(hint, $p);
		}
		default: {
			const x: never = hintType;
			console.error('No valid message found for hint type ' + x);
			return null;
		}
	}
}