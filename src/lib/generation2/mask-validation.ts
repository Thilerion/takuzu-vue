import type { SimpleBoard } from "../board/Board.js";
import { ConstraintSolver, type ConstraintSolverOpts } from "../solvers/constraint-solver/ConstraintSolver.js";
import type { BasicPuzzleConfig, BoardShape } from "../types.js";
import { getDifficultyConfig, type MaskMaxDifficultyConfig, type MaskMinDifficultyConfig } from "./difficulty-settings.js";

export type CreateMaskValidatorsOpts = {
	/** MinDifficulty config is used to check that the puzzle is not too easy; the puzzle should not be solvable with this config. If null, this is skipped (for the easiest puzzles) */
	minDifficulty: MaskMinDifficultyConfig,
	/** MaxDifficulty config is used to check that the puzzle is not too hard; the puzzle should be solvable with this config */
	maxDifficulty: MaskMaxDifficultyConfig,
}

export class MaskDifficultyValidation {
	readonly boardShape: BoardShape;
	readonly minDifficultyCheckConfig: ConstraintSolverOpts | null;
	readonly maxDifficultyCheckConfig: ConstraintSolverOpts;

	constructor(
		boardShape: BoardShape,
		validatorConfigs: CreateMaskValidatorsOpts
	) {
		this.boardShape = boardShape;

		if (validatorConfigs.minDifficulty == null) {
			this.minDifficultyCheckConfig = null;
		} else {
			const { backtracking, constraints } = validatorConfigs.minDifficulty;
			this.minDifficultyCheckConfig = {
				maxSolutions: 1, // only 1, because if there is any solution, the minimum difficulty is too low
				dfs: {
					enabled: !!backtracking,
					timeout: 2000,
					throwAfterTimeout: false,
				},
				constraints: [...constraints], // to be set based on difficulty
			}
		}

		this.maxDifficultyCheckConfig = {
			maxSolutions: validatorConfigs.maxDifficulty.backtracking ? 2 : 1, // only applies if DFS is enabled, we just need to know if there is exactly 1 solution
			dfs: {
				enabled: validatorConfigs.maxDifficulty.backtracking,
				timeout: 2000,
				throwAfterTimeout: false,
			},
			constraints: [...validatorConfigs.maxDifficulty.constraints], // to be set based on difficulty
		}
	}

	/** Checks if a masked board has a unique solution, with a specific set of techniques/constraints determined by the difficulty setting */
	hasUniqueSolution(maskedBoard: SimpleBoard): boolean {
		const result = ConstraintSolver.run(maskedBoard, this.maxDifficultyCheckConfig);
		return result.numSolutions === 1;
	}

	/** Verifies that the board has a minimum difficulty. For instance, it requires certain techniques determined by the difficulty setting */
	verifyMinimumDifficulty(maskedBoard: SimpleBoard): boolean {
		if (this.minDifficultyCheckConfig == null) {
			// No minimum difficulty check, so it is always valid
			return true;
		}
		const result = ConstraintSolver.run(maskedBoard, this.minDifficultyCheckConfig);
		return result.numSolutions === 0;
	}

	static fromPuzzleConfig(puzzleConf: BasicPuzzleConfig) {
		const boardShape = { width: puzzleConf.width, height: puzzleConf.height };
		const { min, max } = getDifficultyConfig(puzzleConf);
		return new MaskDifficultyValidation(boardShape, {
			minDifficulty: min,
			maxDifficulty: max
		});
	}
}