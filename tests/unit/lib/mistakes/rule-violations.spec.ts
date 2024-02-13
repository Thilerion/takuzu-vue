import { SimpleBoard } from "@/lib/index.js";
import { findRuleViolations } from "@/lib/mistakes/rule-violations.js";

describe('findRuleViolations()', () => {
	it('finds nothing with a correct board', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const expected = {
			hasIncorrectValues: false,
			hasRuleViolations: false,
			results: []
		}
		// when equal to solution
		expect(findRuleViolations({ board: solution, solution })).toEqual(expected);
		// when board is empty
		expect(findRuleViolations({ 
			board: SimpleBoard.empty(4, 4),
			solution
		})).toEqual(expected);
		// when board is partially empty but correct
		expect(findRuleViolations({ 
			board: SimpleBoard.fromArrayOfLines([
				'..10',
				'0110',
				'1...',
				'.101'
			]),
			solution
		})).toEqual(expected);
	})

	it('finds that there are incorrect values, even though it is not directly related to a rule violation', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'....',
			'....',
			'....',
			'1010',
		]);
		const result = findRuleViolations({ board, solution });
		const expected = {
			hasIncorrectValues: true,
			hasRuleViolations: false,
			results: []
		}
		expect(result).toEqual(expected);
	})

	it('finds combinations of different rule violations', () => {
		const solution = SimpleBoard.fromArrayOfLines([
			'1010',
			'0110',
			'1001',
			'0101'
		]);
		const board = SimpleBoard.fromArrayOfLines([
			'111.', // maxConsecutive & balance
			'0110',
			'....',
			'0110', // uniqueLines
			// also: imbalanced columns 2 & 3
		]);
		const result = findRuleViolations({ board, solution });
		expect(result.hasIncorrectValues).toBe(true);
		expect(result.hasRuleViolations).toBe(true);
		const violations = result.results;
		expect(violations).toHaveLength(1 + 1 + 1 + 2);

		const maxConsViolations = violations.filter(v => v.type === 'maxConsecutive');
		expect(maxConsViolations).toHaveLength(1);

		const balanceViolations = violations.filter(v => v.type === 'balancedLines');
		expect(balanceViolations).toHaveLength(3);

		const uniqueLinesViolations = violations.filter(v => v.type === 'uniqueLines');
		expect(uniqueLinesViolations).toHaveLength(1);
	})
})