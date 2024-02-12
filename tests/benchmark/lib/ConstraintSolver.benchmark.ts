import { SimpleBoard } from '@/lib';
import { ONE, ZERO } from '@/lib/constants';
import { ConstraintSolver } from '@/lib/solvers/constraint-solver/ConstraintSolver.js';
import { applyEliminationConstraintWithOpts } from '@/lib/solvers/constraint-solver/constraints/EliminationConstraint.js';
import type { BoardExportString } from '@/lib/types';
import { bench } from 'vitest';

const getBoardSmall = () => {
	const board = SimpleBoard.empty(6, 6);
	board.assign(0, 1, ONE);
	board.assign(2, 3, ZERO);
	return board;
}
const getMediumBoard = () => {
	return SimpleBoard.import('10x10;1..00...........................100.1....1......00..........10...0..1.............11..10..1.........' as BoardExportString);
}

describe('find 200 solutions', () => {
	describe('with a small 6x6 board', () => {
		bench('using only DFS', () => {
			const board = getBoardSmall();
			const res = ConstraintSolver.run(
				board,
				{
					constraints: [],
					maxSolutions: 200,
					dfs: {
						enabled: true,
						throwAfterTimeout: true,
						timeout: 400
					}
				}
			)
			if (res.numSolutions < 200) throw new Error('Invalid benchmark; did not find 200 solutions');
		}, { time: 1000 })
		bench('using elimination and DFS', () => {
			const board = getBoardSmall();
			const res = ConstraintSolver.run(
				board,
				{
					constraints: [
						applyEliminationConstraintWithOpts(
							{singleAction: false, leastRemainingRange: [0, 10], maxEmptyCells: Infinity}
						)
					],
					maxSolutions: 200,
					dfs: {
						enabled: true,
						throwAfterTimeout: true,
						timeout: 400
					}
				}
			)
			if (res.numSolutions < 200) throw new Error('Invalid benchmark; did not find 200 solutions');
		}, { time: 1000 })
		bench('using all constraints and DFS', () => {
			const board = getBoardSmall();
			const res = ConstraintSolver.run(
				board,
				{
					maxSolutions: 200,
					dfs: {
						enabled: true,
						throwAfterTimeout: true,
						timeout: 400
					}
				}
			)
			if (res.numSolutions < 200) throw new Error('Invalid benchmark; did not find 200 solutions');
		}, { time: 1000 })
	})

	describe('with a medium 10x10 board', () => {
		bench('using only DFS', () => {
			const board = getMediumBoard();
			const res = ConstraintSolver.run(
				board,
				{
					constraints: [],
					maxSolutions: 200,
					dfs: {
						enabled: true,
						throwAfterTimeout: false,
						timeout: 5000
					}
				}
			)
			if (res.numSolutions < 200) throw new Error('Invalid benchmark; did not find 200 solutions');
		}, { time: 3000 })
		bench('using elimination and DFS', () => {
			const board = getMediumBoard();
			const res = ConstraintSolver.run(
				board,
				{
					constraints: [
						applyEliminationConstraintWithOpts(
							{singleAction: false, leastRemainingRange: [0, 10], maxEmptyCells: Infinity}
						)
					],
					maxSolutions: 200,
					dfs: {
						enabled: true,
						throwAfterTimeout: false,
						timeout: 5000
					}
				}
			)
			if (res.numSolutions < 200) throw new Error('Invalid benchmark; did not find 200 solutions');
		}, { time: 3000 })
		bench('using all constraints and DFS', () => {
			const board = getMediumBoard();
			const res = ConstraintSolver.run(
				board,
				{
					maxSolutions: 200,
					dfs: {
						enabled: true,
						throwAfterTimeout: false,
						timeout: 5000
					}
				}
			)
			if (res.numSolutions < 200) throw new Error('Invalid benchmark; did not find 200 solutions');
		}, { time: 3000 })
	})
})