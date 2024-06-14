import { SimpleBoard } from "@/lib/board/Board.js";
import { ThreesUnit } from "@/lib/board/ThreesUnit.js";
import { ONE, EMPTY, ZERO } from "@/lib/constants.js";
import { humanTriplesTechnique } from "@/lib/solvers/human-solver/techniques/TriplesTechnique.js";

describe('Human Solver HumanTriplesTechnique', () => {
	it('finds a all sandwiches in the supplied ThreesUnits', () => {
		const units = [
			new ThreesUnit(0, 0, 'row', [ONE, EMPTY, ONE]),
			new ThreesUnit(1, 0, 'row', [EMPTY, ONE, EMPTY]),
			new ThreesUnit(2, 0, 'row', [ONE, EMPTY, ONE]),
		]
		const result = humanTriplesTechnique({
			board: {
				threesUnits: () => units
			}
		})
		expect(result).toHaveLength(2);
		expect(result).toMatchInlineSnapshot(`
			[
			  {
			    "origin": [
			      {
			        "x": 0,
			        "y": 0,
			      },
			      {
			        "x": 2,
			        "y": 0,
			      },
			    ],
			    "targets": [
			      {
			        "value": "0",
			        "x": 1,
			        "y": 0,
			      },
			    ],
			    "technique": "triples",
			    "type": "sandwich",
			  },
			  {
			    "origin": [
			      {
			        "x": 2,
			        "y": 0,
			      },
			      {
			        "x": 4,
			        "y": 0,
			      },
			    ],
			    "targets": [
			      {
			        "value": "0",
			        "x": 3,
			        "y": 0,
			      },
			    ],
			    "technique": "triples",
			    "type": "sandwich",
			  },
			]
		`);
	})

	it('finds the targets for a double and correctly combines the targets', () => {
		const board = SimpleBoard.empty(4, 4);
		board.assign(1, 0, ZERO);
		board.assign(2, 0, ZERO);
		// first row is ".00.", so two targets resulting from one pattern (the 00 in the middle)
		const result = humanTriplesTechnique({ board });
		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			technique: 'triples',
			type: 'double',
			origin: [{ x: 1, y: 0 }, { x: 2, y: 0 }],
			targets: [
				{ value: ONE, x: 0, y: 0 },
				{ value: ONE, x: 3, y: 0 }
			]
		})
	})

	it('makes no changes on the board', () => {
		const board = SimpleBoard.empty(4, 4);
		board.assign(1, 0, ZERO);
		board.assign(2, 0, ZERO);
		const boardStr = board.export();

		const result = humanTriplesTechnique({ board });
		expect(result).toHaveLength(1);

		expect(board.export()).toBe(boardStr);
	})
})