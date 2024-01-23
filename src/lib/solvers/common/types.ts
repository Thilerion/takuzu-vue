export type SolverStrategyNoneFound = { found: false };
export type SolverStrategyFound<FoundData> = { found: true, data: FoundData };

export type SolverStrategyResult<FoundData> = SolverStrategyNoneFound | SolverStrategyFound<FoundData>;