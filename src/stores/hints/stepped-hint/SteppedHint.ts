import { EMPTY } from "@/lib/constants.js";
import type { TriplesTechniqueResult } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";
import type { BoardAndSolutionBoards, Vec, VecValue } from "@/lib/types.js";
import { HIGHLIGHT_LEVELS, createAreaHighlightAroundCells, createCellHighlight } from "../highlights/highlight.js";
import type { HintStepEventCallbackActionsParam, HintStepFinal, HintStepIntermediate, SteppedHintType } from "./types.js";
import type { TriplesSteppedHint } from "./TriplesHint.js";

const nextHintId = (() => {
	let id = 0;
	return () => id++;
})();

type HintStepsData = [...HintStepIntermediate[], HintStepFinal];

export abstract class BaseSteppedHint {
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