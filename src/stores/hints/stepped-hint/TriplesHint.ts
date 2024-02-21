import { EMPTY, OPPOSITE_SYMBOL_MAP, type PuzzleSymbol } from "@/lib/constants.js";
import type { TriplesTechniqueResult } from "@/lib/human-solver/triples.js";
import type { Vec, VecValue, BoardAndSolutionBoards, Target } from "@/lib/types.js";
import { createAreaHighlightAroundCells, HIGHLIGHT_LEVELS, createCellHighlight } from "../highlights/highlight.js";
import type { HintStepIntermediate, HintStepFinal, HintStepEventCallbackActionsParam } from "./types.js";
import { BaseSteppedHint } from "./SteppedHint.js";

export class TriplesSteppedHint extends BaseSteppedHint {
	readonly subType: 'double' | 'sandwich';
	readonly source: [Vec, Vec]; // the pair of cells that resulted in this hint, for instance: the pair of cells in one symbol that resulted in the cells adjacent to be the opposite symbol
	readonly targets: Target[]; // the cells and values that are affected by this hint, that can be set
	readonly steps: [...HintStepIntermediate[], HintStepFinal];
	readonly type = 'triples' as const;
	readonly sourceSymbol: PuzzleSymbol;
	readonly targetSymbol: PuzzleSymbol;

	constructor(data: TriplesTechniqueResult, id?: number) {
		const { targets, origin, type: subType } = data;

		super(id);		

		this.subType = subType;
		this.source = [...origin];
		this.targets = [...targets];
		this.targetSymbol = this.targets[0].value;
		this.sourceSymbol = OPPOSITE_SYMBOL_MAP[this.targetSymbol];

		// The first step displays the type of the hint, and has an action that locates it.
		// This action displays the source of the hint as a highlight.
		const firstStep: HintStepIntermediate = {
			actionLabel: 'Locate',
			index: 0,
			// TODO: if many triples hints found, replace message with There are multiple pairs and/or sandwiches on the board.
			message: `There is a ${this.subType} somewhere on the board.`,
			onNext: (ctx, { setHighlights }) => {
				TriplesSteppedHint.setSourceHighlight(this.source, { setHighlights });
			},
		}
		// The second step explains the hint, and has an action that locates the target(s).
		// If going back to the first step, the source highlight is removed.
		// If going forward to the third step, the target highlights are added to the currently shown source highlight.
		const secondStep: HintStepIntermediate = {
			actionLabel: `Locate`,
			index: 1,
			message: ($p) => `Three ${$p(this.sourceSymbol, true)} cannot be next to each other. Therefore, the adjacent ${this.targets.length > 1 ? 'cells' : 'cell'} can only possibly be one ${$p('symbol', false)}.`,
			onShow: (ctx, { showHighlights }) => {
				showHighlights();
			},
			onPrev: (ctx, { removeHighlights }) => {
				removeHighlights();
			},
			onHide: (ctx, { hideHighlights }) => {
				hideHighlights();
			},
			onNext: (ctx, { currentHighlights }) => {
				TriplesSteppedHint.addTargetsHighlights(this.targets, { currentHighlights });
			},
		}
		// The final step further explains the hint, and has an action that sets the target(s) to the opposite (correct) symbol.
		// If going back to the second step, the target highlights are removed, while the source highlight is kept.
		const finalStep: HintStepFinal = {
			actionLabel: 'Execute',
			index: 2,
			message: ($p) => {
				const SYMBOLS = $p('symbol', true);
				const SYMBOL = $p('symbol', false);
				const TARGET = $p(this.targetSymbol, this.targets.length > 1);
				const SOURCES = $p(this.sourceSymbol, true);
				if (this.subType === 'double') {
					return `Two equal ${SYMBOLS} (${SOURCES}) are next to each other. That means the surrounding cell${this.targets.length > 1 ? 's' : ''} must be ${TARGET}.`;
				} else {
					return `An empty cell is surrounded by two of the same ${SYMBOL}. To prevent three of the same ${SYMBOLS} in a row, the empty cell must be ${TARGET}.`;
				}
			},
			onShow: (ctx, { showHighlights }) => {
				showHighlights();
			},
			onPrev: (ctx, { currentHighlights }) => {
				TriplesSteppedHint.removeTargetsHighlights({ currentHighlights });
			},
			onHide: (ctx, { hideHighlights }) => {
				hideHighlights();
			},
			onFinish: (ctx, { makeMove, removeHighlights }) => {
				removeHighlights();
				for (const { x, y, value } of this.targets) {
					const boardValue = ctx.board.get(x, y);
					if (boardValue === EMPTY) {
						makeMove({ x, y, value });
					}
				}
			}
		}

		this.steps = [firstStep, secondStep, finalStep];
	}

	validate({ board, solution }: BoardAndSolutionBoards) {
		console.log('validating stepped triples hint');
		if (board.hasIncorrectValues(solution).hasMistakes) return false;
		// in the case of a "triples" hint, it is only still valid if all source cells are the same, and at least one of the target cells is empty
		if (this.targets.every(({ x, y }) => board.get(x, y) !== EMPTY)) return false;
		if (this.source.some(({ x, y }) => board.get(x, y) !== solution.get(x, y))) return false;
		return true;
	}

	static setSourceHighlight(source: [Vec, Vec], { setHighlights }: Pick<HintStepEventCallbackActionsParam, 'setHighlights'>) {
		const highlights = [
			createAreaHighlightAroundCells(source, HIGHLIGHT_LEVELS.PRIMARY),
		];
		setHighlights(highlights, { setVisible: true });
	}
	static addTargetsHighlights(
		targets: Vec[],
		{ currentHighlights }: Pick<HintStepEventCallbackActionsParam, 'currentHighlights'>
	) {
		const highlights = targets.map(vec => {
			return createCellHighlight(vec, HIGHLIGHT_LEVELS.SECONDARY);
		});
		currentHighlights.value.push(...highlights);
	}
	static removeTargetsHighlights(
		{ currentHighlights }: Pick<HintStepEventCallbackActionsParam, 'currentHighlights'>
	) {
		currentHighlights.value = currentHighlights.value.filter(h => h.level !== HIGHLIGHT_LEVELS.SECONDARY);
	}
}