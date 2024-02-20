import { EMPTY } from "@/lib/constants.js";
import type { TriplesTechniqueResult } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";
import type { BoardAndSolutionBoards, Vec, VecValue } from "@/lib/types.js";
import type { usePuzzleStore } from "@/stores/puzzle/store.js";
import type { HintHighlight } from "../highlights/types.js";
import { createLegacyTriplesHintHighlights } from "../highlights/legacy-hint-highlights.js";
import { HIGHLIGHT_LEVELS, createAreaHighlightAroundCells } from "../highlights/highlight.js";

export type HintV2Type = 'ruleViolation' | 'incorrectValues' | 'triples' | 'balance' | 'elimination' | 'elimDuplicate';

const nextHintId = (() => {
	let id = 0;
	return () => id++;
})();

// set certain cells in puzzleStore to a certain value, with or without adding to history, or adding to history as batch?
export type HintStepOnCallback = (
	ctx: BoardAndSolutionBoards,
	actions: {
		toggle: ReturnType<typeof usePuzzleStore>['toggle'],
		setHighlights: (highlights: HintHighlight[]) => void,
		hideHighlights: () => void, // TODO: maybe option to only hide certain highlights, ie those created by this hint?
	},
) => void;

type BaseHintStep = {
	message: string;
	actionLabel: string;
	index: number; // for easy ordering, checking which step this step is
	onNext?: HintStepOnCallback;
}
type HintStepIntermediate = BaseHintStep & {
	onShow?: HintStepOnCallback;
	onHide?: HintStepOnCallback;
}
type HintStepFinal = HintStepIntermediate & {
	// onFinish is called when the final actionButton is clicked, which performs all actions and "finishes" the hint
	onFinish: HintStepOnCallback;
}
type HintStepsData = [...HintStepIntermediate[], HintStepFinal];

abstract class BaseSteppedHint {
	// A variable amount of "intermediate" steps, and one required final step. For example, a hint might have no steps per se (such as the old, legacy hint type),
	// so the standard hint would be part of the final step.
	abstract readonly steps: HintStepsData;
	abstract readonly type: HintV2Type;
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

// TODO: add intermediate steps
export class TriplesSteppedHint extends BaseSteppedHint {
	readonly subType: 'double' | 'sandwich';
	readonly source: [Vec, Vec]; // the pair of cells that resulted in this hint, for instance: the pair of cells in one symbol that resulted in the cells adjacent to be the opposite symbol
	readonly targets: VecValue[]; // the cells and values that are affected by this hint, that can be set
	readonly steps: [...HintStepIntermediate[], HintStepFinal];
	readonly type = 'triples' as const;

	constructor(data: TriplesTechniqueResult, id?: number) {
		const { targets, origin, type } = data;

		super(id);		

		this.subType = type;
		this.source = [...origin];
		this.targets = [...targets];

		this.steps = [{
			actionLabel: 'Execute',
			index: 0,
			message: `There is a ${type} somewhere on the board.`,
			onShow: (ctx, { setHighlights }) => {
				const highlights = [
					createAreaHighlightAroundCells(this.source, HIGHLIGHT_LEVELS.PRIMARY)
				];
				setHighlights(highlights);
			},
			onHide: (ctx, { hideHighlights }) => {
				hideHighlights();
			},
			onFinish: (ctx, { toggle }) => {
				for (const { x, y, value } of this.targets) {
					const boardValue = ctx.board.get(x, y);
					if (boardValue !== EMPTY) return;
					toggle({ x, y, value });
				}
			}
		}]
	}

	validate({ board, solution }: BoardAndSolutionBoards) {
		console.log('validating stepped triples hint');
		if (board.hasIncorrectValues(solution)) return false;
		// in the case of a "triples" hint, it is only still valid if all source cells are the same, and at least one of the target cells is empty
		if (this.targets.every(({ x, y }) => board.get(x, y) !== EMPTY)) return false;
		if (this.source.some(({ x, y }) => board.get(x, y) !== solution.get(x, y))) return false;
		return true;
	}
}

export type SteppedHint = TriplesSteppedHint;