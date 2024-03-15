import type { VecValue } from "@/lib/types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import type { HintStepFinal } from "./types.js";
import { createCellHighlight } from "../highlights/highlight.js";

export class NoHintsFoundSteppedHint extends BaseSteppedHint {
	readonly steps: HintStepsData;
	readonly type = 'noHintsFound' as const;
	readonly target: VecValue;

	constructor(
		data: {
			target: VecValue;
		}, id?: number
	) {
		super(id);
		this.target = data.target;

		const step: HintStepFinal = {
			actionLabel: 'apply',
			index: 0,
			onShow: (ctx, { setHighlights }) => {
				const cellHighlight = createCellHighlight(
					this.target,
					'PRIMARY'
				)
				setHighlights([cellHighlight], { setVisible: true });
			},
			onHide: (ctx, { hideHighlights }) => {
				hideHighlights();
			},
			onFinish: (ctx, { makeMove }) => {
				makeMove(data.target, { historyCommitType: 'commit' });
			}
		}
		this.steps = [step];
	}

	validate(): boolean {
		// NoHintsFoundHint is only valid for the exact same board state
		// it was created for
		return false;
	}
}