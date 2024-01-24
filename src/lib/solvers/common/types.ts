export type SolverStrategyNoneFound = { found: false, invalid?: false };
export type SolverStrategyFound<FoundData> = { found: true, data: FoundData, invalid?: false };
export type SolverStrategyInvalidError = { found: false, error: string, invalid: true };

export type SolverStrategyResult<FoundData> = SolverStrategyNoneFound | SolverStrategyInvalidError | SolverStrategyFound<FoundData>;