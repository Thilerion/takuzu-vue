import type { VecValue } from "@/lib/types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import type { FoundIncorrectValue } from "@/lib/mistakes/types.js";
import type { HintStepFinal, HintStepIntermediate } from "./types.js";
import { EMPTY } from "@/lib/constants.js";
import { createCellHighlight, type CellHighlight } from "@/helpers/puzzle-visual-cues.js";

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
			actionLabel: 'locate',
			index: 0,
			onNext: (ctx, { setHighlights, addErrorMarksFromCells }) => {
				const highlights = this.moves.map((vec): CellHighlight => {
					return createCellHighlight(vec, {
						colorId: 1,
						source: 'hint'
					})
				})
				setHighlights(highlights);

				// also add (persistent) error marks to the cells
				addErrorMarksFromCells('incorrectValue', this.moves.map(({ x, y }) => ({ x, y })));
			}
		}
		const finalStep: HintStepFinal = {
			actionLabel: 'fix',
			index: 1,
			onShow: (ctx, { showHighlights, addErrorMarksFromCells }) => {
				// add error marks again because they may have been removed while the hint was hidden
				addErrorMarksFromCells('incorrectValue', this.moves.map(({ x, y }) => ({ x, y })));
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

	validate(/* { board, solution }: BoardAndSolutionBoards */) {
		// TODO: validate incorrectValuesHint
		return false;
	}
}