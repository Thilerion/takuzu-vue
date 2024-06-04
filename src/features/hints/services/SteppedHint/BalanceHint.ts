import type { BalanceTechniqueResult } from "@/lib/solvers/human-solver/techniques/BalanceTechnique.js";
import type { BoardAndSolutionBoards, LineId, Target } from "@/lib/types.js";
import { BaseSteppedHint, type HintStepsData } from "./SteppedHint.js";
import type { HintStepIntermediate, HintStepFinal } from "./types.js";
import { type LineType, type PuzzleSymbol, EMPTY } from "@/lib/constants.js";
import { BoardLine } from "@/lib/board/BoardLine.js";
import { getOppositeSymbol } from "@/lib/utils/puzzle-value.utils.js";
import { lineTypeFromLineId } from "@/lib/utils/puzzle-line.utils.js";
import { createLineHighlightFromLineId, type CellHighlight, createCellHighlight } from "@/features/puzzle-visual-cues/helpers/highlights.js";

export class BalanceSteppedHint extends BaseSteppedHint {
	readonly targets: Target[]; // the cells and values that are affected by this hint, that can be set
	readonly steps: HintStepsData;
	readonly type = 'balance' as const;

	readonly missingSymbol: PuzzleSymbol;
	readonly filledSymbol: PuzzleSymbol;
	readonly lineId: LineId;
	readonly lineType: LineType;
	readonly rawData: { id: number, type: 'balance', data: BalanceTechniqueResult };

	constructor(data: BalanceTechniqueResult, id?: number) {
		const { targets, lineId } = data;

		super(id);		

		this.targets = [...targets];
		this.missingSymbol = targets[0].value;
		this.filledSymbol = getOppositeSymbol(this.missingSymbol);
		this.lineId = lineId;
		this.lineType = lineTypeFromLineId(lineId);
		this.rawData = { id: this.id, type: 'balance', data: { ...data } };

		const firstStep: HintStepIntermediate = {
			actionLabel: 'locate',
			index: 0,
			onNext: (ctx, { setHighlights }) => {
				const hl = createLineHighlightFromLineId(this.lineId, ctx.board, {
					colorId: 1,
					source: 'hint'
				})
				setHighlights([hl]);
			}
		}

		const secondStep: HintStepIntermediate = {
			actionLabel: 'next',
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
			onNext: (ctx, { setHighlights, currentHighlights }) => {
				const cellHighlights: CellHighlight[] = this.targets.map((tg) => {
					return createCellHighlight(tg, {
						colorId: 2,
						source: 'hint'
					})
				});
				setHighlights([...currentHighlights.value, ...cellHighlights]);
			}
		}

		const finalStep: HintStepFinal = {
			actionLabel: 'execute',
			index: 2,
			onShow: (ctx, { showHighlights }) => {
				showHighlights();
			},
			onPrev: (ctx, { currentHighlights }) => {
				currentHighlights.value = currentHighlights.value.filter(h => h.colorId === 1);
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
		console.log('validating stepped balance hint');
		if (board.hasIncorrectValues(solution).hasMistakes) return false;
		// A balance hint is all cells not in targets is correctly filled, and at least one of the target cells is empty.
		// TODO: might still be considered valid if the line has an empty value more than when the hint was created, and it is the same type as this.missingSymbol
		const boardLine = BoardLine.fromBoard(board, this.lineId);
		let validTargets = false;
		for (const cell of boardLine.eachCell()) {
			// if in targets, and empty, set validTargets to true
			const foundInTargets = this.targets.find(target => target.x === cell.x && target.y === cell.y);
			if (foundInTargets != null) {
				// if empty, validTargets is true. Else if not missingSymbol, it is the incorrect symbol
				if (cell.value === EMPTY) {
					validTargets = true;
				} else if (cell.value !== this.missingSymbol) {
					return false;
				}
			} else {
				// if not in targets, and not equal to solution, return false
				const solutionValue = solution.get(cell.x, cell.y);
				if (solutionValue !== cell.value) return false;
			}
		}
		if (!validTargets) return false;
		return true;
	}
}