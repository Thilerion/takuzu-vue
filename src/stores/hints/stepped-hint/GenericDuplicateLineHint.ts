import type { Target, LineId, PuzzleValueLine, BoardAndSolutionBoards } from "@/lib/types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import type { GenericDuplicateLineTechniqueResult } from "@/lib/solvers/human-solver/techniques/GenericDuplicateLineTechnique.js";
import type { HintStepFinal, HintStepIntermediate } from "./types.js";
import { EMPTY } from "@/lib/constants.js";
import { createCellHighlight, createLineHighlightFromLineId, type CellHighlight } from "@/helpers/puzzle-visual-cues.js";

export class GenericDuplicateLineSteppedHint extends BaseSteppedHint {
	readonly type = 'duplicateLineGeneric' as const;
	readonly steps: HintStepsData;

	readonly targets: Target[];
	readonly lineId: LineId;
	readonly originalLineValues: PuzzleValueLine;
	readonly remainingCounts: [least: number, most: number];
	readonly potentialDuplicateLines: LineId[];
	readonly rawData: { id: number, type: 'duplicateLineGeneric', data: GenericDuplicateLineTechniqueResult };

	constructor(data: GenericDuplicateLineTechniqueResult, id?: number) {
		super(id);

		const {
			line: lineId, remainingCounts, targets, lineValues, potentialDuplicateLines
		} = data;

		this.lineId = lineId;
		this.remainingCounts = [...remainingCounts];
		this.targets = [...targets];
		this.originalLineValues = [...lineValues];
		this.potentialDuplicateLines = [...potentialDuplicateLines];
		this.rawData = { id: this.id, type: 'duplicateLineGeneric', data: { ...data } };

		const firstStep: HintStepIntermediate = {
			actionLabel: 'next',
			index: 0,
			onNext: (ctx, { setHighlights }) => {
				// highlight potential duplicate lines
				const potentialDuplicateLineHighlights = this.potentialDuplicateLines.map((lineId) => {
					return createLineHighlightFromLineId(lineId, ctx.board, {
						colorId: 1,
						source: 'hint'
					})
				})
				setHighlights(potentialDuplicateLineHighlights);
			}
		}

		// Displays potential duplicate lines
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
				const targetLineHighlight = createLineHighlightFromLineId(
					this.lineId,
					ctx.board,
					{
						colorId: 2,
						source: 'hint'
					}
				)
				setHighlights([...currentHighlights.value, targetLineHighlight]);
			}
		}

		// Displays target line
		const thirdStep: HintStepIntermediate = {
			actionLabel: 'locate',
			index: 2,
			onShow: (ctx, { showHighlights }) => {
				showHighlights();
			},
			onPrev: (ctx, { currentHighlights, setHighlights }) => {
				setHighlights(
					currentHighlights.value.filter(h => h.colorId === 1 && h.highlightAreaType === 'line')
				)
			},
			onHide: (ctx, { hideHighlights }) => {
				hideHighlights();
			},
			onNext: (ctx, { currentHighlights, setHighlights }) => {
				const cellHighlights: CellHighlight[] = this.targets.map((tg) => {
					return createCellHighlight(tg, {
						colorId: 2,
						source: 'hint'
					})
				});
				setHighlights([
					...cellHighlights,
					...currentHighlights.value
				])
			}
		}

		// Displays the target cells (in addition to the target line, and the potential duplicate lines)
		const finalStep: HintStepFinal = {
			actionLabel: 'execute',
			index: 3,
			onShow: (ctx, { showHighlights }) => {
				showHighlights();
			},
			onPrev: (ctx, { currentHighlights }) => {
				// remove all cell highlights
				currentHighlights.value = currentHighlights.value.filter(h => h.highlightAreaType !== 'cell');
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
		this.steps = [firstStep, secondStep, thirdStep, finalStep];
	}

	validate({ board, solution }: BoardAndSolutionBoards) {
		if (board.hasIncorrectValues(solution).hasMistakes) return false;

		// in contrast to EliminationHint, we cannot guarantee that this hint is still valid if some target cells are now not empty anymore
		if (this.targets.some(({ x, y }) => board.get(x, y) !== EMPTY)) return false;

		// not valid if the "potential duplicate lines" are not all filled
		for (const dupeLineId of this.potentialDuplicateLines) {
			const dupeLine = board.getLine(dupeLineId);
			if (dupeLine.includes(EMPTY)) return false;
		}
		return true;
	}
}