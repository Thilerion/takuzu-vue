import type { PuzzleSymbol } from "../constants.js";
import type { LineId, Target, Vec } from "../types.js";

export type FoundIncorrectValue = Vec & {
	current: PuzzleSymbol;
	correctValue: PuzzleSymbol;
};

export type RuleViolationType = 'maxConsecutive' | 'balancedLines' | 'uniqueLines';
export type MaxConsecutiveRuleViolation = {
	type: 'maxConsecutive';
	cells: Target[];
	incorrectCells: FoundIncorrectValue[];
}
export type BalancedLinesRuleViolation = {
	type: 'balancedLines';
	lineId: LineId;
	incorrectCells: FoundIncorrectValue[];
	symbol: PuzzleSymbol;
	amountOver: number;
}
export type UniqueLinesRuleViolation = {
	type: 'uniqueLines';
	correctLine: LineId; // the line that is correctly filled
	incorrectLines: LineId[]; // the lines that are (incorrectly) filled the same as the correctLine
	lines: LineId[]; // combination of correctLine and incorrectLines
	incorrectCells: FoundIncorrectValue[];
}
export type RuleViolation = MaxConsecutiveRuleViolation | BalancedLinesRuleViolation | UniqueLinesRuleViolation;
