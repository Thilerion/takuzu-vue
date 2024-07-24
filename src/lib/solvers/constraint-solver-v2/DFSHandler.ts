import type { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintsHandler } from "./ConstraintsHandler.js";
import { createTimeoutChecker, type TimeoutChecker } from "./helpers/timeout-check.js";
import type { SolverSelectCellFn, SolverSelectValueFn } from "./types.js";
import { getOppositeSymbol } from "@/lib/utils/puzzle-value.utils.js";
import type { PuzzleSymbol } from "@/lib/constants.js";

type DFSTerminationReason = 'timed_out' | 'max_solutions_reached';
type DFSDoneReason = DFSTerminationReason | 'finished';
type DFSStatus = {
	status: 'idle' | 'running'
} | {
	status: 'error',
	message: string | Error
} | {
	status: 'done',
	reason: DFSDoneReason
};
export type DFSResult = Extract<DFSStatus, { status: 'error' }> | (Extract<DFSStatus, { status: 'done' }> & { solutionsFound: number });

export interface DFSSelectionStrategies {
	selectCell: SolverSelectCellFn,
	selectValue: SolverSelectValueFn,
}
export interface DFSRunCallbacks {
	onSolutionFound: (solution: SimpleBoard) => void,
}

export class DFSHandler {
	private constraintsHandler: ConstraintsHandler;
	readonly timeoutChecker: TimeoutChecker | null;
	private selectCell: SolverSelectCellFn;
	private selectValue: SolverSelectValueFn;
	readonly maxSolutions: number;

	private solutionsFound: number = 0;
    private state: DFSStatus = {
		status: 'idle'
	}

	constructor(
		constraintsHandler: ConstraintsHandler,
		timeout: TimeoutChecker | number | null,
		{ selectCell, selectValue }: DFSSelectionStrategies,
		maxSolutions: number = Infinity
	) {
		this.constraintsHandler = constraintsHandler;
		this.timeoutChecker = timeout == null ? null : typeof timeout === 'number' ? createTimeoutChecker(timeout) : timeout;
		this.selectCell = selectCell;
		this.selectValue = selectValue;
		this.maxSolutions = maxSolutions;
	}

	performDFS(
		board: SimpleBoard,
		{ onSolutionFound }: DFSRunCallbacks
	): DFSResult {
		if (this.state.status !== 'idle') {
			// We cannot start if not idle, a new DFSHandler must be created
			if (this.isRunning()) {
				throw new Error('Cannot start a new DFSHandler while one is already running.');
			} else if (this.hasFinished()) {
				throw new Error('Cannot start a new DFSHandler after it has already finished.');
			} else {
				throw new Error('Unexpected status in DFSHandler.performDFS().');
			}
		}

		this.setRunningState();
		this.solutionsFound = 0;

		try {
            this.dfs(board, { onSolutionFound });
			this.setDoneState('finished');
        } catch (error) {
			this.setErrorState(typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error occurred during DFS')
        }
		return this.getResult();
	}

	private dfs(
		board: SimpleBoard,
		cbs: Pick<DFSRunCallbacks, 'onSolutionFound'>
	): void {
		if (this.shouldTerminate()) {
			return;
		}

		const boardStatus = this.constraintsHandler.getBoardStatus(board);
		if (boardStatus === 'invalid') {
			// This branch is invalid, backtrack and try another board
			return;
		} else if (boardStatus === 'solved') {
			// This branch is solved, so add to solutions (as copy)
			this.solutionsFound += 1;
			cbs.onSolutionFound(board.copy());
			return; // Continue searching for more solutions
		}

		// Board is valid but not solved, continue this branch
		const cell = this.selectCell(board);
        if (cell === null) {
            throw new Error("No empty cell found in an unsolved board");
        }

        const { x, y } = cell;
        const initialValue = this.selectValue(board, x, y);

        this.tryNextState(board, x, y, initialValue, cbs);
        if (this.state.status !== 'running') return;

        const oppositeValue = getOppositeSymbol(initialValue);
        this.tryNextState(board, x, y, oppositeValue, cbs);
    }

	private tryNextState(
		board: SimpleBoard,
		x: number,
		y: number,
		value: PuzzleSymbol,
		{ onSolutionFound }: Pick<DFSRunCallbacks, 'onSolutionFound'>
	): void {
		const nextBoard = this.getNextState(board, x, y, value);
        if (nextBoard) {
            this.dfs(nextBoard, { onSolutionFound });
        }
	}

    private shouldTerminate(): boolean {
		const status = this.state.status;
		switch(status) {
			case 'idle': {
				throw new Error('Cannot check termination before DFS has started.');
			}
			case 'error': {
				throw new Error('Cannot check termination after DFS has errored.');
			}
			case 'done': {
				throw new Error('Cannot check termination after DFS has finished.');
			}
			case 'running': {
				if (this.solutionsFound >= this.maxSolutions) {
					this.setDoneState('max_solutions_reached');
					return true;
				} else if (this.timeoutChecker?.isTimedOut()) {
					this.setDoneState('timed_out');
					return true;
				} else return false;
			}
			default: {
				const x: never = status;
				throw new Error(`Unexpected status in DFSHandler.shouldTerminate(): ${x}`);
			}
		}
    }

    private getNextState(board: SimpleBoard, x: number, y: number, value: PuzzleSymbol): SimpleBoard | null {
        const newBoard = board.copy();
        newBoard.assign(x, y, value);
        
        const constraintResult = this.constraintsHandler.applyConstraints(newBoard);
        if (constraintResult.error) {
            return null; // Invalid board after applying constraints
        }
        
        return newBoard;
    }

	private setErrorState(message: string | Error): void {
		this.state = {
			status: 'error',
			message
		}
	}
	private setDoneState(reason: DFSDoneReason): void {
		this.state = {
			status: 'done',
			reason
		}
	}
	private setRunningState(): void {
		this.state = {
			status: 'running'
		}
	}

	getResult(): DFSResult {
		const status = this.state.status;
		switch (status) {
			case 'idle': {
				throw new Error('Cannot get result from DFSHandler before it has started.');
			}
			case 'running': {
				throw new Error('Cannot get result from DFSHandler while it is still running.');
			}
			case 'error': {
				return { ...this.state };
			}
			case 'done': {
				return { ...this.state, solutionsFound: this.solutionsFound };
			}
			default: {
				const x: never = status;
				throw new Error(`Unexpected status in DFSHandler.getResult(): ${x}`);
			}
		}
	}

	getStatus(): DFSStatus {
		return { ...this.state };
	}

	getSolutionsFound(): number {
		return this.solutionsFound;
	}

	isRunning(): boolean {
		return this.state.status === 'running';
	}
	hasFinished(): boolean {
		return this.state.status === 'done' || this.state.status === 'error';
	}
}