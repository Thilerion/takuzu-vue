import type { BoardAndSolutionBoards, VecValue } from "@/lib/types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import type { FoundIncorrectValue } from "@/lib/mistakes/types.js";
import type { HintStepFinal, HintStepIntermediate } from "./types.js";
import { createCellHighlight, HIGHLIGHT_LEVELS } from "../highlights/highlight.js";
import { EMPTY } from "@/lib/constants.js";

export class IncorrectValuesSteppedHint extends BaseSteppedHint {
	readonly type = 'incorrectValues' as const;

	readonly moves: VecValue[];
	readonly incorrectValues: FoundIncorrectValue[];
	readonly steps: HintStepsData;

	constructor(data: {
		incorrectValues: FoundIncorrectValue[]
	}, id?: number) {
		super(id);

		this.incorrectValues = [...data.incorrectValues];
		this.moves = this.incorrectValues.map(({ x, y }) => {
			return { x, y, value: EMPTY };
		})

		// TODO: use different highlights; use the "incorrect" highlight, also used with the Check button functionality
		const firstStep: HintStepIntermediate = {
			actionLabel: 'Locate',
			index: 0,
			onNext: (ctx, { setHighlights }) => {
				const highlights = this.moves.map((vec) => {
					return createCellHighlight(vec, HIGHLIGHT_LEVELS.PRIMARY);
				})
				setHighlights(highlights);
			}
		}
		const finalStep: HintStepFinal = {
			actionLabel: 'Fix',
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
			onFinish: (ctx, { makeMultipleMoves, removeHighlights }) => {
				// TODO: add different action that reverts the board to the last correct state
				removeHighlights();
				makeMultipleMoves(
					this.moves,
					{ historyCommitType: 'reset' } // would probably never want to undo a Hint move that fixes mistakes, I think?
				);
			}
		}

		this.steps = [firstStep, finalStep];
	}

	validate({ board, solution }: BoardAndSolutionBoards) {
		// TODO: validate incorrectValuesHint
		return false;
	}
}