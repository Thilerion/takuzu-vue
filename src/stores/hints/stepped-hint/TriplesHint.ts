import { EMPTY, OPPOSITE_SYMBOL_MAP, type PuzzleSymbol } from "@/lib/constants.js";
import type { TriplesTechniqueResult } from "@/lib/human-solver/triples.js";
import type { Vec, BoardAndSolutionBoards, Target } from "@/lib/types.js";
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
			onShow: (ctx, { showHighlights }) => {
				showHighlights();
			},
			onPrev: (ctx, { currentHighlights }) => {
				TriplesSteppedHint.removeTargetsHighlights({ currentHighlights });
			},
			onHide: (ctx, { hideHighlights }) => {
				hideHighlights();
			},
			onFinish: (ctx, { makeMultipleMoves, removeHighlights }) => {
				removeHighlights();
				const moves = this.targets.filter(t => {
					return ctx.board.get(t.x, t.y) === EMPTY;
				})
				makeMultipleMoves(moves, { historyCommitType: "commitCombined" });
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