import { describe, expect, test } from "vitest";
import { SimpleBoard } from "@/lib";
import { validateBoard, findRuleConflicts } from '@/lib/validate/board';
import { ruleConflictTypes } from "@/lib/validate/types";
import type { BoardExportString } from "@/lib/types.js";

describe('validate board functions', () => {
	test('incomplete square valid board', () => {
		const b = SimpleBoard.import("6x6;0..0..10.1101..1010.1.01..01101..0.1" as BoardExportString);
		expect(validateBoard(b, true)).toBe(true);
	})

	test('complete rectangular valid board', () => {
		const b = SimpleBoard.import("6x10;101010110010010101101001100110010110011001101100010011001101" as BoardExportString);
		expect(validateBoard(b, true)).toBe(true);
	})

	test('incomplete square invalid board with duplicate row', () => {
		const b = SimpleBoard.import("4x4;1010........1010" as BoardExportString);
		expect(validateBoard(b, true)).toBe(false);
		expect(validateBoard(b, false)).toBe(true);
	})

	test('incomplete square valid board where a row is the same as a column', () => {
		const grid = [
			"1...",
			"0...",
			"0...",
			"1001"
		]
		const str = `4x4;${grid.join('')}` as BoardExportString;
		const b = SimpleBoard.import(str);
		expect(validateBoard(b, true)).toBe(true);
		expect(validateBoard(b, false)).toBe(true);
	})

	test('invalid because of max consecutive violation', () => {
		const gridA = [
			'..11..',
			'.....1',
			'11....',
			'......'
		].join('');
		const gridB = [
			'11....',
			'......',
			'111...',
			'......'
		].join('');
		const strA = `6x4;${gridA}` as BoardExportString;
		const strB = `6x4;${gridB}` as BoardExportString;
		expect(validateBoard(SimpleBoard.import(strA))).toBe(true);
		expect(validateBoard(SimpleBoard.import(strB))).toBe(false);
	})

	test('invalid because of max per line violation', () => {
		const str = '4x4;.0.......0...0..' as BoardExportString;
		expect(validateBoard(SimpleBoard.import(str))).toBe(false);
	})

	test('invalid because a line matches more than 1 other line', () => {
		const str = '6x6;101010......101010............101010' as BoardExportString;
		expect(validateBoard(SimpleBoard.import(str))).toBe(false);
	})
})

describe('findRuleConflicts()', () => {
	test('finds max consecutive violation', () => {
		const grid = [
			'11....',
			'......',
			'111...',
			'......'
		].join('');
		const str = `6x4;${grid}` as BoardExportString;
		const b = SimpleBoard.import(str);
		expect(findRuleConflicts(b, true)).toMatchInlineSnapshot(`
			[
			  RuleConflict {
			    "cells": [
			      {
			        "x": 0,
			        "y": 2,
			      },
			      {
			        "x": 1,
			        "y": 2,
			      },
			      {
			        "x": 2,
			        "y": 2,
			      },
			    ],
			    "lineIds": null,
			    "type": "three in a row",
			  },
			]
		`);
	})

	test('finds symbol count violation', () => {
		const str = '4x4;.0.......0...0..' as BoardExportString;
		const b = SimpleBoard.import(str);
		expect(findRuleConflicts(b, true)).toMatchInlineSnapshot(`
			[
			  RuleConflict {
			    "cells": null,
			    "lineIds": [
			      "2",
			    ],
			    "type": "imbalanced",
			  },
			]
		`);
	})

	test('finds duplicate line violation if enabled', () => {
		const b = SimpleBoard.import("4x4;1010........1010" as BoardExportString);
		expect(findRuleConflicts(b, false)).toEqual([]);
		expect(findRuleConflicts(b, true)).toMatchInlineSnapshot(`
			[
			  RuleConflict {
			    "cells": null,
			    "lineIds": [
			      "A",
			      "D",
			    ],
			    "type": "duplicate line",
			  },
			]
		`);
	})

	test('finds no violations when row is equal to column', () => {
		const grid = [
			"1...",
			"0...",
			"0...",
			"1001"
		]
		const str = `4x4;${grid.join('')}` as BoardExportString;
		const b = SimpleBoard.import(str);
		expect(findRuleConflicts(b, true)).toEqual([]);
	})

	test('can find multiple types of rule violations', () => {
		const b = SimpleBoard.import("6x6;......110010....0.00..00....0.110010" as BoardExportString);
		const result = findRuleConflicts(b, true);
		for (const conflictType of ruleConflictTypes) {
			expect(result.find(c => c.type === conflictType)).toBeTruthy();
		}
		expect(result).toHaveLength(3);
		expect(Array.isArray(result)).toBe(true);
		expect(findRuleConflicts(b, true)).toMatchInlineSnapshot(`
			[
			  RuleConflict {
			    "cells": null,
			    "lineIds": [
			      "D",
			    ],
			    "type": "imbalanced",
			  },
			  RuleConflict {
			    "cells": [
			      {
			        "x": 4,
			        "y": 2,
			      },
			      {
			        "x": 4,
			        "y": 3,
			      },
			      {
			        "x": 4,
			        "y": 4,
			      },
			    ],
			    "lineIds": null,
			    "type": "three in a row",
			  },
			  RuleConflict {
			    "cells": null,
			    "lineIds": [
			      "B",
			      "F",
			    ],
			    "type": "duplicate line",
			  },
			]
		`);
	})

	test('can find violation where a row is duplicated more than once', () => {
		const str = '6x6;101010......101010............101010' as BoardExportString;
		const b = SimpleBoard.import(str);
		const result = findRuleConflicts(b, true);
		expect(result).toHaveLength(1);
		expect(result).toMatchInlineSnapshot(`
			[
			  RuleConflict {
			    "cells": null,
			    "lineIds": [
			      "A",
			      "C",
			      "F",
			    ],
			    "type": "duplicate line",
			  },
			]
		`);
	})
})