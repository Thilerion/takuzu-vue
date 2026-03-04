import type { SimpleBoard } from "@/lib/board/Board.js";
import { applyEliminationConstraintWithOpts } from "../constraint-solver/constraints/EliminationConstraint.js";
import { applyLineBalanceConstraintWithOpts } from "../constraint-solver/constraints/LineBalanceConstraint.js";
import { applyTriplesConstraintWithOpts } from "../constraint-solver/constraints/TriplesConstraint.js";
import {
	selectCellStrategies,
	selectValueStrategies,
	type SelectCellStrategyName,
	type SelectValueStrategyName,
} from "../constraint-solver/selection/index.js";
import type { ConstraintStrategy, ConstraintStrategyResult, SolverSelectCellFn, SolverSelectValueFn } from "./types.js";

export const DEFAULT_TIMEOUT_MS = 2000;

function adaptLegacyConstraintResult(result: { changed: boolean; error?: string | null }): ConstraintStrategyResult {
	if (result.error != null) {
		return {
			changed: false,
			invalid: true,
			message: result.error,
		};
	}
	if (result.changed) {
		return {
			changed: true,
		};
	}
	return {
		changed: false,
	};
}

function withErrorBoundary(fn: (board: SimpleBoard) => { changed: boolean; error?: string | null }): ConstraintStrategy {
	return (board: SimpleBoard) => {
		try {
			const res = fn(board);
			return adaptLegacyConstraintResult(res);
		} catch (error) {
			return {
				changed: false,
				error: error instanceof Error ? error : new Error(String(error)),
			};
		}
	};
}

export function getDefaultStrategies(): ReadonlyArray<ConstraintStrategy> {
	return [
		withErrorBoundary(applyTriplesConstraintWithOpts({ singleAction: false })),
		withErrorBoundary(applyLineBalanceConstraintWithOpts({ singleAction: false })),
		withErrorBoundary(applyEliminationConstraintWithOpts({ singleAction: true, leastRemainingRange: [1, 3], useDuplicateLines: true })),
	];
}

export function getFastSearchStrategies(): ReadonlyArray<ConstraintStrategy> {
	return [
		withErrorBoundary(
			applyEliminationConstraintWithOpts({
				singleAction: false,
				leastRemainingRange: [0, 10],
				maxEmptyCells: Infinity,
				useDuplicateLines: true,
			}),
		),
	];
}

export function resolveSelectCell(
	selectCell: SolverSelectCellFn | SelectCellStrategyName | undefined,
): SolverSelectCellFn {
	if (typeof selectCell === 'function') return selectCell;
	if (selectCell != null) return selectCellStrategies[selectCell];
	return selectCellStrategies.firstEmpty;
}

export function resolveSelectValue(
	selectValue: SolverSelectValueFn | SelectValueStrategyName | undefined,
): SolverSelectValueFn {
	if (typeof selectValue === 'function') return selectValue;
	if (selectValue != null) return selectValueStrategies[selectValue];
	return selectValueStrategies.leastConstraining;
}
