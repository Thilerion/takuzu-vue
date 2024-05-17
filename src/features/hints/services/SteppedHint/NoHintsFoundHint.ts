import type { VecValue } from "@/lib/types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import type { HintStepFinal } from "./types.js";
import { createCellHighlight } from "@/helpers/puzzle-visual-cues.js";

export class NoHintsFoundSteppedHint extends BaseSteppedHint {
	readonly steps: HintStepsData;
	readonly type = 'noHintsFound' as const;
	readonly target: VecValue;
	readonly rawData: { id: number, type: 'noHintsFound', data: ConstructorParameters<typeof NoHintsFoundSteppedHint>['0'] };

	constructor(
		data: {
			target: VecValue;
		}, id?: number
	) {
		super(id);
		this.target = {...data.target};
		this.rawData = { id: this.id, type: 'noHintsFound', data: { ...data } };

		const step: HintStepFinal = {
			actionLabel: 'apply',
			index: 0,
			onShow: (ctx, { setHighlights }) => {
				setHighlights([createCellHighlight(this.target, {
					colorId: 1,
					source: 'hint'
				})], { setVisible: true });
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