import type { BalanceTechniqueResult } from "@/lib/solvers/human-solver/techniques/BalanceTechnique.js";
import type { BoardAndSolutionBoards, LineId, Target } from "@/lib/types.js";
import { BaseSteppedHint } from "./SteppedHint.js";
import type { HintStepIntermediate, HintStepFinal } from "./types.js";
import { OPPOSITE_SYMBOL_MAP, type LineType, type PuzzleSymbol, EMPTY } from "@/lib/constants.js";
import { lineTypeFromLineId } from "@/lib/utils.js";
import { HIGHLIGHT_LEVELS, createCellHighlight, createLineHighlight } from "../highlights/highlight.js";
import { BoardLine } from "@/lib/board/BoardLine.js";

export class BalanceSteppedHint extends BaseSteppedHint {
	readonly targets: Target[]; // the cells and values that are affected by this hint, that can be set
	readonly steps: [...HintStepIntermediate[], HintStepFinal];
	readonly type = 'balance' as const;

	readonly missingSymbol: PuzzleSymbol;
	readonly filledSymbol: PuzzleSymbol;
	readonly lineId: LineId;
	readonly lineType: LineType;

	constructor(data: BalanceTechniqueResult, id?: number) {
		const { targets, lineId } = data;

		super(id);		

		this.targets = [...targets];
		this.missingSymbol = targets[0].value;
		this.filledSymbol = OPPOSITE_SYMBOL_MAP[this.missingSymbol];
		this.lineId = lineId;
		this.lineType = lineTypeFromLineId(lineId);

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
			actionLabel: 'Next',
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
				makeMultipleMoves(moves, { historyAction: "commit" });
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