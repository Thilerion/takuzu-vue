import type { SimpleBoard } from "@/lib/board/Board.js";
import type { ConstraintStrategy } from "./types.js";

export type ConstraintLoopResult = {
	outcome: 'stable';
	changed: boolean;
} | {
	outcome: 'invalid';
	message?: string;
} | {
	outcome: 'error';
	error: Error;
};

function normalizeUnknownError(error: unknown): Error {
	if (error instanceof Error) return error;
	return new Error(String(error));
}

export function runConstraintsUntilStable(
	board: SimpleBoard,
	strategies: ReadonlyArray<ConstraintStrategy>,
): ConstraintLoopResult {
	if (strategies.length === 0) {
		return { outcome: 'stable', changed: false };
	}

	let hasChanged = false;

	for (;;) {
		let changedThisPass = false;

		for (const strategy of strategies) {
			let result: ReturnType<typeof strategy>;
			try {
				result = strategy(board);
			} catch (error) {
				return { outcome: 'error', error: normalizeUnknownError(error) };
			}

			if ('error' in result) {
				return {
					outcome: 'error',
					error: result.error instanceof Error ? result.error : new Error(result.error),
				};
			}
			if ('invalid' in result && result.invalid) {
				return { outcome: 'invalid', message: result.message };
			}
			if (result.changed) {
				hasChanged = true;
				changedThisPass = true;
				break;
			}
		}

		if (!changedThisPass) {
			return {
				outcome: 'stable',
				changed: hasChanged,
			};
		}
	}
}
