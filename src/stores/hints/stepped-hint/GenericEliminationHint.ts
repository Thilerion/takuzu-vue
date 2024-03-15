import type { BoardAndSolutionBoards, LineId, PuzzleValueLine, Target } from "@/lib/types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import { BoardLine } from "@/lib/board/BoardLine.js";
import { EMPTY } from "@/lib/constants.js";
import type { GenericEliminationTechniqueResult } from "@/lib/solvers/human-solver/techniques/GenericEliminationTechnique.js";
import type { HintStepFinal, HintStepIntermediate } from "./types.js";
import { HIGHLIGHT_LEVELS, createCellHighlight, createLineHighlight } from "../highlights/highlight.js";

export class GenericEliminationSteppedHint extends BaseSteppedHint {
	readonly type = 'eliminationGeneric' as const;
	readonly steps: HintStepsData;

	readonly targets: Target[];
	readonly lineId: LineId;
	readonly originalLineValues: PuzzleValueLine;
	readonly remainingCounts: [least: number, most: number];

	constructor(data: GenericEliminationTechniqueResult, id?: number) {
		super(id);

		const { line: lineId, remainingCounts, targets, lineValues } = data;

		this.lineId = lineId;
		this.remainingCounts = [...remainingCounts];
		this.targets = [...targets];
		this.originalLineValues = [...lineValues];

		const firstStep: HintStepIntermediate = {
			actionLabel: 'Locate',
			index: 0,
			onNext: (ctx, { setHighlights }) => {
				const highlights = [createLineHighlight(
					this.lineId,
					HIGHLIGHT_LEVELS.PRIMARY,
					ctx.board
				)]
				setHighlights(highlights);
			}
		}

		const secondStep: HintStepIntermediate = {
			actionLabel: 'Locate',
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
			onNext: (ctx, { currentHighlights }) => {
				const cellHighlights = this.targets.map(target => createCellHighlight(
					target,
					HIGHLIGHT_LEVELS.SECONDARY
				));
				currentHighlights.value.push(...cellHighlights);
			}
		}

		const finalStep: HintStepFinal = {
			actionLabel: 'Execute',
			index: 2,
			onShow: (ctx, { showHighlights }) => {
				showHighlights();
			},
			onPrev: (ctx, { currentHighlights }) => {
				currentHighlights.value = currentHighlights.value.filter(h => h.level === HIGHLIGHT_LEVELS.PRIMARY);
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
		if (board.hasIncorrectValues(solution).hasMistakes) return false;

		// not valid if all target cells are not empty
		// TODO: same as in TriplesSteppedHint: if targets is not exactly the same, the message shown in the hint, and the displayed highlights, might not be accurate anymore
		if (this.targets.every(({ x, y }) => board.get(x, y) !== EMPTY)) return false;

		// not valid if any non-target cell on the line when the hint was created has a different value than it has now
		const currentBoardLine = BoardLine.fromBoard(board, this.lineId);

		for (let idx = 0; idx < currentBoardLine.length; idx++) {
			const { x, y } = currentBoardLine.getCoords(idx);

			const isTargetCell = this.targets.find(tg => tg.x === x && tg.y === y);
			if (isTargetCell) continue; // skip target cells

			const currentValue = currentBoardLine.values[idx];
			const originalValue = this.originalLineValues[idx];
			// the non-target cell value has changed since the hint was created, so it is now invalid
			if (currentValue !== originalValue) return false;
		}

		return true;
	}
}