export type ActivitySummary = {
	date: Date;
	localDateStr: string;
	puzzlesPlayed: number;
	totalCells: number;
	totalTime: number; // in ms
	puzzleTimes: number[]; // individual puzzle times in ms
};

export type ActivityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type WithScore<T> = T & { score: number };
export type WithLevel<T extends { score: number }> = T & { level: ActivityLevel };
export type ScoreFromSummaryFn = (summary: ActivitySummary) => number;
export type DetermineLevelFn = (summary: WithScore<ActivitySummary>) => ActivityLevel;

export type ActivitySummaryComplete = WithLevel<WithScore<ActivitySummary>>;