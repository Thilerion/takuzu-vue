import type { BoardAndSolutionBoards } from "@/lib/types.js";
import type { HintStepIntermediate, HintStepFinal, SteppedHintType } from "./types.js";

const nextHintId = (() => {
	let id = 0;
	return () => id++;
})();

export type HintStepsData = [...HintStepIntermediate[], HintStepFinal];

export abstract class BaseSteppedHint {
	// A variable amount of "intermediate" steps, and one required final step. For example, a hint might have no steps per se (such as the old, legacy hint type),
	// so the standard hint would be part of the final step.
	abstract readonly steps: HintStepsData;
	abstract readonly type: SteppedHintType;
	readonly id: number;
	
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