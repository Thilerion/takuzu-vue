import { EMPTY, type PuzzleSymbol } from "@/lib/constants.js";
import type { Vec, BoardAndSolutionBoards, Target } from "@/lib/types.js";
import type { HintStepIntermediate, HintStepFinal, HintStepEventCallbackActionsParam } from "./types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import { getOppositeSymbol } from "@/lib/utils/puzzle-value.utils.js";
import type { TriplesTechniqueResult } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";
import { type AreaHighlight, createAreaHighlightFromCorners, createCellHighlight } from "@/features/puzzle-visual-cues/helpers/highlights.js";

export class TriplesSteppedHint extends BaseSteppedHint {
	readonly subType: 'double' | 'sandwich';
	readonly source: [Vec, Vec]; // the pair of cells that resulted in this hint, for instance: the pair of cells in one symbol that resulted in the cells adjacent to be the opposite symbol
	readonly targets: Target[]; // the cells and values that are affected by this hint, that can be set
	readonly steps: HintStepsData;
	readonly type = 'triples' as const;
	readonly sourceSymbol: PuzzleSymbol;
	readonly targetSymbol: PuzzleSymbol;
	readonly rawData: { id: number, type: 'triples', data: TriplesTechniqueResult };

	constructor(data: TriplesTechniqueResult, id?: number) {
		const { targets, origin, type: subType } = data;

		super(id);		

		this.subType = subType;
		this.source = [...origin];
		this.targets = [...targets];
		this.targetSymbol = this.targets[0].value;
		this.sourceSymbol = getOppositeSymbol(this.targetSymbol);
		this.rawData = { id: this.id, type: 'triples', data: { ...data } };

		// The first step displays the type of the hint, and has an action that locates it.
		// This action displays the source of the hint as a highlight.
		const firstStep: HintStepIntermediate = {
			actionLabel: 'locate',
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
			actionLabel: 'locate',
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
			onNext: (ctx, { currentHighlights, setHighlights }) => {
				TriplesSteppedHint.addTargetsHighlights(this.targets, { currentHighlights, setHighlights });
			},
		}
		// The final step further explains the hint, and has an action that sets the target(s) to the opposite (correct) symbol.
		// If going back to the second step, the target highlights are removed, while the source highlight is kept.
		const finalStep: HintStepFinal = {
			actionLabel: 'execute',
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
		// TODO: if targets is not exactly the same, the message shown in the hint, and the displayed highlights, might not be accurate anymore
		if (this.targets.every(({ x, y }) => board.get(x, y) !== EMPTY)) return false;
		if (this.source.some(({ x, y }) => board.get(x, y) !== solution.get(x, y))) return false;
		return true;
	}

	static setSourceHighlight(source: [Vec, Vec], { setHighlights }: Pick<HintStepEventCallbackActionsParam, 'setHighlights'>) {
		const [start, end] = source;
		const highlights: AreaHighlight[] = [
			createAreaHighlightFromCorners(start, end, {
				colorId: 1,
				source: 'hint'
			})
		];
		setHighlights(highlights, { setVisible: true });
	}
	static addTargetsHighlights(
		targets: Vec[],
		{ currentHighlights, setHighlights }: Pick<HintStepEventCallbackActionsParam, 'currentHighlights' | 'setHighlights'>
	) {
		const highlights = targets.map(vec => createCellHighlight(vec, {
			colorId: 2,
			source: 'hint'
		}));

		setHighlights([...currentHighlights.value, ...highlights], { setVisible: true })
	}
	static removeTargetsHighlights(
		{ currentHighlights }: Pick<HintStepEventCallbackActionsParam, 'currentHighlights'>
	) {
		currentHighlights.value = currentHighlights.value.filter(h => h.colorId !== 2);
	}
}