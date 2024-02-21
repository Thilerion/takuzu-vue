import { SimpleBoard } from "@/lib";
import { createHint } from "./helpers";
import { HINT_TYPE, Hint } from "./Hint";
import { humanSolveDuplicateLine, humanSolveElimination } from "@/lib/human-solver";
import { TriplesSteppedHint } from "./stepped-hint/TriplesHint.js";
import type { SteppedHint } from "./stepped-hint/types.js";
import { BalanceSteppedHint } from "./stepped-hint/BalanceHint.js";
import { humanBalanceTechnique } from "@/lib/solvers/human-solver/techniques/BalanceTechnique.js";
import { humanTriplesTechnique } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";

export const searchForHint = (
	board: SimpleBoard,
	solution: SimpleBoard,
): Hint | SteppedHint | null => {

	// Step 1: check for incorrect values
	const mistakeHint = searchForMistakesHint(board, solution);
	if (mistakeHint) return mistakeHint;

	// Step 2: run HumanSolver to find possible moves to make right now.
	// Start with the easiest strategy and return early.
	const humanStrategyHint = searchForHumanStrategyHint(board);
	if (humanStrategyHint) return humanStrategyHint;

	// Step 3: TODO: more advanced strategies, or random value from solution, or backtracking search
	console.warn("SHOULD RUN DEEPER SEARCH FOR HINTS NOW, BUT NOT IMPLEMENTED YET.");
	return null;
}

function searchForMistakesHint(board: SimpleBoard, solution: SimpleBoard): Hint | null {
	// TODO: better to compare incorrect values AND rule violations, but for now, just check incorrect values
		// 1: check if there are incorrect values
		// 1a: if yes, check if there are rule violations
		// 1b: is all incorrect values are due to rule violations, show ruleViolation hint
		// 1c: if not all incorrect due to RV, are no RV at all, show IncorrectValue hint
	const {
		hasMistakes,
		result: incorrectValues
	} = board.hasIncorrectValues(solution);

	if (hasMistakes) {
		const hint = createHint(HINT_TYPE.MISTAKE, incorrectValues);
		return hint;
	}
	return null;
}

function searchForHumanStrategyHint(board: SimpleBoard) {
	// TRIPLES STRATEGY
	const triplesHumanResult = humanTriplesTechnique({ board });
	if (triplesHumanResult && triplesHumanResult.length) {
		const triplesHints = triplesHumanResult.map(triplesResult => {
			return new TriplesSteppedHint(triplesResult);
		})
		
		const sortedHints = triplesHints.sort((a, b) => {
			const { subType: typeA } = a;
			const { subType: typeB } = b;
			if (typeA === 'double' && typeB === 'sandwich') return -1;
			if (typeA === 'sandwich' && typeB === 'double') return 1;
			return b.targets.length - a.targets.length;
		})
		const hint = sortedHints[0];
		return hint;
	}
	// BALANCE HINT
	const balanceHintResult = humanBalanceTechnique({ board });
	if (balanceHintResult && balanceHintResult.length) {
		const hint = new BalanceSteppedHint(balanceHintResult[0]);
		return hint;
	}
	// ELIMINATION HINT
	const eliminationHintResult = humanSolveElimination({ board });
	if (!Array.isArray(eliminationHintResult)) {
		const err = eliminationHintResult.error;
		throw new Error(`Elimination Technique returned an error, but the mistakes checker found none. This should not be possible. Error: ${err}`);
	}
	if (eliminationHintResult.length) {
		const sorted = [...eliminationHintResult].sort((a, b) => {
			if (a.elimType === b.elimType) {
				return 0;
			} else if (a.elimType > b.elimType) {
				return 1;
			} else return -1;
		})
		const hint = createHint(HINT_TYPE.ELIMINATION, sorted[0]);
		return hint;
	}

	// ELIMINATION/DUPE HINT
	const dupeHintResult = humanSolveDuplicateLine({ board });
	if (!Array.isArray(dupeHintResult)) {
		const err = dupeHintResult.error;
		throw new Error(`DuplicateLine Technique returned an error, but the mistakes checker found none. This should not be possible. Error: ${err}`);
	}
	if (dupeHintResult.length) {
		const sorted = [...dupeHintResult].sort((a, b) => {
			if (a.elimType === b.elimType) {
				return 0;
			} else if (a.elimType > b.elimType) {
				return 1;
			} else return -1;
		})
		const hint = createHint(HINT_TYPE.ELIM_DUPE, sorted[0]);
		return hint;
	}

	return null;
}