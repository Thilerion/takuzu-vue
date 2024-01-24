export type SolverStrategyNoneFound = { found: false };
export type SolverStrategyFound<FoundData> = { found: true, data: FoundData };
export type SolverStrategyInvalidError = { found: false, error: string, invalid: true };

export type SolverStrategyResult<FoundData> = SolverStrategyNoneFound | SolverStrategyInvalidError | SolverStrategyFound<FoundData>;