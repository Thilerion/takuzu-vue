import { EMPTY } from "@/lib/constants.js";
import type { TriplesTechniqueResult } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";
import type { BoardAndSolutionBoards, Vec, VecValue } from "@/lib/types.js";
import { HIGHLIGHT_LEVELS, createAreaHighlightAroundCells, createCellHighlight } from "../highlights/highlight.js";
import type { HintStepEventCallbackActionsParam, HintStepFinal, HintStepIntermediate, SteppedHintType } from "./types.js";

const nextHintId = (() => {
	let id = 0;
	return () => id++;
})();

type HintStepsData = [...HintStepIntermediate[], HintStepFinal];

abstract class BaseSteppedHint {
	// A variable amount of "intermediate" steps, and one required final step. For example, a hint might have no steps per se (such as the old, legacy hint type),
	// so the standard hint would be part of the final step.
	abstract readonly steps: HintStepsData;
	abstract readonly type: SteppedHintType;
	readonly id: number;
	
	// TODO: implement title, subtitle inside component itself
	readonly title?: string;
	readonly subtitle?: string;
	
	constructor(
		id?: number
	) {
		this.id = id ?? nextHintId();
	}

	get numSteps(): number {
		return this.steps.length;
	}
	get finalStep(): HintStepFinal {
		return this.steps.at(-1) as HintStepFinal;
	}
	get isLegacyHint(): false {
		return false;
	}
	get isSteppedHint(): true {
		return true;
	}

	abstract validate(boardAndSolution: BoardAndSolutionBoards): boolean;
}

export class TriplesSteppedHint extends BaseSteppedHint {
	readonly subType: 'double' | 'sandwich';
	readonly source: [Vec, Vec]; // the pair of cells that resulted in this hint, for instance: the pair of cells in one symbol that resulted in the cells adjacent to be the opposite symbol
	readonly targets: VecValue[]; // the cells and values that are affected by this hint, that can be set
	readonly steps: [...HintStepIntermediate[], HintStepFinal];
	readonly type = 'triples' as const;

	constructor(data: TriplesTechniqueResult, id?: number) {
		const { targets, origin, type: subType } = data;

		super(id);		

		this.subType = subType;
		this.source = [...origin];
		this.targets = [...targets];

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
			message: 'Three of the same [symbol] cannot be next to each other. This can be prevented by placing the [opposite symbol].',
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
			index: 1,
			message: this.subType === 'double' ? `Two equal symbols are next to each other. That means the surrounding cell${this.targets.length > 1 ? 's' : ''} must be the opposite symbol.` : `An empty cell is surrounded by two of the same symbol. To prevent three of the same symbol in a row, the empty cell must be the opposite symbol.`,
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

export type SteppedHint = TriplesSteppedHint;