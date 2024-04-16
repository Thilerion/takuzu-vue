import { SimpleBoard } from "@/lib";
import { TriplesSteppedHint } from "./stepped-hint/TriplesHint.js";
import type { SteppedHint } from "./stepped-hint/types.js";
import { BalanceSteppedHint } from "./stepped-hint/BalanceHint.js";
import { humanBalanceTechnique } from "@/lib/solvers/human-solver/techniques/BalanceTechnique.js";
import { humanTriplesTechnique } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";
import { findRuleViolations } from "@/lib/mistakes/rule-violations";
import { findIncorrectValuesFromSolution } from "@/lib/mistakes/incorrect-values";
import type { FoundIncorrectValue, RuleViolation } from "@/lib/mistakes/types";
import type { XYKey } from "@/lib/types";
import { IncorrectValuesSteppedHint } from "./stepped-hint/IncorrectValuesHint.js";
import { genericEliminationTechnique } from "@/lib/solvers/human-solver/techniques/GenericEliminationTechnique.js";
import { NoHintsFoundSteppedHint } from "./stepped-hint/NoHintsFoundHint.js";
import { GenericEliminationSteppedHint } from "./stepped-hint/GenericEliminationHint.js";
import { genericDuplicateLineTechnique } from "@/lib/solvers/human-solver/techniques/GenericDuplicateLineTechnique.js";
import { GenericDuplicateLineSteppedHint } from "./stepped-hint/GenericDuplicateLineHint.js";

export const searchForHint = (
	board: SimpleBoard,
	solution: SimpleBoard,
): SteppedHint => {

	// Step 1: check for incorrect values
	const mistakeHint = searchForMistakesHint(board, solution);
	if (mistakeHint) return mistakeHint;

	// Step 2: run HumanSolver to find possible moves to make right now.
	// Start with the easiest strategy and return early.
	const humanStrategyHint = searchForHumanStrategyHint(board);
	if (humanStrategyHint) return humanStrategyHint;

	// Step 3: TODO: more advanced strategies, or backtracking search
	console.warn("SHOULD RUN DEEPER SEARCH FOR HINTS NOW, BUT NOT IMPLEMENTED YET.");

	// Step 4: TODO: use backtracking to find optimal random move to generate, or just give a random move from the solution
	return createNoHintsFoundHint(board, solution);
}

function searchForMistakesHint(board: SimpleBoard, solution: SimpleBoard): IncorrectValuesSteppedHint | null {
	// TODO: better to compare incorrect values AND rule violations, but for now, just check incorrect values
		// 1: check if there are incorrect values
		// 1a: if yes, check if there are rule violations
		// 1b: is all incorrect values are due to rule violations, show ruleViolation hint
		// 1c: if not all incorrect due to RV, are no RV at all, show IncorrectValue hint
	const {
		hasIncorrectValues,
		hasRuleViolations,
		results: ruleViolationResults,
	} = findRuleViolations({ board, solution });

	if (!hasIncorrectValues) return null;

	const { results: incorrectValues } = findIncorrectValuesFromSolution({ board, solution });

	if (!hasRuleViolations) {
		const incorrectValuesHint = new IncorrectValuesSteppedHint({ incorrectValues });
		return incorrectValuesHint;
	}
	// check if all incorrect values are due to rule violations
	return getRuleViolationOrIncorrectValueHint(incorrectValues, ruleViolationResults);
}

function getRuleViolationOrIncorrectValueHint(
	incorrectValues: FoundIncorrectValue[],
	ruleViolations: RuleViolation[],
): IncorrectValuesSteppedHint /* TODO: | RuleViolationSteppedHint */ {
	// if all incorrect values are due to rule violations, return rule violation hint
	// else, if any incorrect values are not due to rule violations, return incorrect value hint

	const ruleViolationIncorrectCells = new Set<XYKey>();

	for (const violation of ruleViolations) {
		for (const cell of violation.incorrectCells) {
			const key: XYKey = `${cell.x},${cell.y}`;
			ruleViolationIncorrectCells.add(key);
		}
	}

	if (incorrectValues.every(cell => {
		const key: XYKey = `${cell.x},${cell.y}`;
		return ruleViolationIncorrectCells.has(key);
	})) {
		// all incorrect values are due to rule violation, so return rule violation hint
		// TODO: implement RuleViolationHint
		console.warn('SHOULD RETURN RULE VIOLATION HINT NOW, BUT NOT IMPLEMENTED YET.');
		return new IncorrectValuesSteppedHint({ incorrectValues });
	} else {
		// TODO: this is double code, as in the searchForMistakesHint the same thing happens. Maybe this function should just return which type of hint must be created, and the creation of the hint should happen in the searchForMistakesHint function.
		const incorrectValuesHint = new IncorrectValuesSteppedHint({ incorrectValues });
		return incorrectValuesHint;
	}
}

function searchForHumanStrategyHint(board: SimpleBoard): SteppedHint | null {
	// TODO: maybe shuffle hints before sorting them and picking the first one?
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
		// TODO: sort balance hints in some way?
		const hint = new BalanceSteppedHint(balanceHintResult[0]);
		return hint;
	}

	// (GENERIC) ELIMINATION HINT
	try {
		const eliminationTechniqueResult = genericEliminationTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 16 });
		if (eliminationTechniqueResult.length > 0) {
			if (eliminationTechniqueResult.length > 1) {
				console.log({elim: eliminationTechniqueResult})
			}
			const sortedResults = [...eliminationTechniqueResult].sort((a, z) => {
				if (a.remainingCounts[0] !== z.remainingCounts[0]) {
					return a.remainingCounts[0] - z.remainingCounts[0]; // lowest leastRemaining: is easiest
				} else if (a.targets.length !== z.targets.length) {
					return z.targets.length - a.targets.length; // use the one with the most targets
				} else {
					return a.remainingCounts[1] - z.remainingCounts[1]; // lowest mostRemaining: not necessarily indicative of hint difficulty but sometimes is
				}
			})
			const hint = new GenericEliminationSteppedHint(sortedResults[0]);
			return hint;
		}
	} catch(err) {
		// TODO: handle different error types, only catch UnsolvableBoardLineError I think?
		throw new Error(`Elimination Technique returned an error, but the mistakes checker found none. This should not be possible. Error message: ${(err as Error).message}`, { cause: err });
	}
 
	// (GENERIC) DUPLICATE LINE HINT
	try {
		const duplicateLineTechniqueResult = genericDuplicateLineTechnique({ board }, { leastRemaining: [1, 10], maxEmptyCells: 16 });
		if (duplicateLineTechniqueResult.length > 0) {
			if (duplicateLineTechniqueResult.length > 1) {
				console.log({dupeLine: duplicateLineTechniqueResult})
			}
			const sortedResults = [...duplicateLineTechniqueResult].sort((a, z) => {
				if (a.remainingCounts[0] !== z.remainingCounts[0]) {
					return a.remainingCounts[0] - z.remainingCounts[0]; // lowest leastRemaining: is easiest
				} else if (a.targets.length !== z.targets.length) {
					return z.targets.length - a.targets.length; // use the one with the most targets
				} else {
					return a.remainingCounts[1] - z.remainingCounts[1]; // lowest mostRemaining: not necessarily indicative of hint difficulty but sometimes is
				}
			})
			const hint = new GenericDuplicateLineSteppedHint(sortedResults[0]);
			return hint;
		}
	} catch(err) {
		// TODO: handle different error types, only catch UnsolvableBoardLineError I think?
		throw new Error(`Duplicate Line Technique returned an error, but the mistakes checker found none. This should not be possible. Error message: ${(err as Error).message}`, { cause: err });
	}

	return null;
}

function createNoHintsFoundHint(board: SimpleBoard, solution: SimpleBoard): NoHintsFoundSteppedHint {
	/* TODO: find a better target than randomly selecting a cell
	// for instance, by finding out which move generates the most new *true* hints, or
	// finding a move that allows for the largest part of the puzzle to be solved using
	// regular hints, or at the least finding a move that generates at least 1 path */

	// get all empty cells, in random order, and take the first one
	const boardCellsNext = board
		.cells({ shuffled: true, skipFilled: true })
		.next();

	if (boardCellsNext.done) {
		throw new Error('No empty cells found, but no hints found either. This should not be possible.');
	}
	const { x, y } = boardCellsNext.value;
	const value = solution.get(x, y);

	const hint = new NoHintsFoundSteppedHint({ target: { x, y, value }});
	return hint;
}