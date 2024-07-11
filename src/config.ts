import type { BasicPuzzleConfig, BoardShape, DifficultyKey, DimensionStr } from "./lib/types.js";

export const boardTypes = {
	NORMAL: 'Normal',
	RECT: 'Rectangular',
	ODD: 'Odd',
} as const;
export type BoardType = typeof boardTypes[keyof typeof boardTypes];

export class BoardPreset {
	readonly type: BoardType;

	constructor(
		public width: number,
		public height: number,
		public maxDifficulty: DifficultyKey
	) {
		this.type = dimensionsToBoardType(width, height);
	}

	static fromShape({ width, height }: BoardShape, maxDifficulty: DifficultyKey) {
		return new BoardPreset(width, height, maxDifficulty);
	}

	get isRect() {
		return this.type === boardTypes.RECT;
	}
	get isOdd() {
		return this.type === boardTypes.ODD;
	}
	get isNormal() {
		return this.type === boardTypes.NORMAL;
	}

	get numCells(): number {
		return this.width * this.height;
	}

	isCompatibleWithDifficulty(difficulty: DifficultyKey): boolean {
		return difficulty <= this.maxDifficulty;
	}
}

export const dimensionsToBoardType = (w: number, h = w): BoardType => {
	if (w !== h) return boardTypes.RECT;
	if (w % 2 === 1) return boardTypes.ODD;
	return boardTypes.NORMAL;
}

export const PRESET_BOARD_SIZES = [
	// normal / square boards
	new BoardPreset(6, 6, 3),
	new BoardPreset(8, 8, 4),
	new BoardPreset(10, 10, 4),
	new BoardPreset(12, 12, 5),
	new BoardPreset(14, 14, 5),

	// rectangular boards
	new BoardPreset(6, 10, 3),
	new BoardPreset(8, 12, 4),
	new BoardPreset(10, 14, 5),
	new BoardPreset(12, 16, 5),

	// odd-sized boards
	new BoardPreset(7, 7, 3),
	new BoardPreset(9, 9, 4),
	new BoardPreset(11, 11, 5),
	new BoardPreset(13, 13, 5),
]

// translatable with i18n, using these labels as keys, and the label itself as fallback
export const DIFFICULTY_LABELS = {
	1: 'Beginner',
	2: 'Normal',
	3: 'Hard',
	4: 'Very Hard',
	5: 'Extreme',
} as const satisfies Record<DifficultyKey, string>;
export const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_LABELS).map(str => parseInt(str)) as DifficultyKey[];

export const MIN_DIFFICULTY_KEY: DifficultyKey = Math.min(...DIFFICULTY_KEYS) as DifficultyKey;
export const MAX_DIFFICULTY_KEY: DifficultyKey = Math.max(...DIFFICULTY_KEYS) as DifficultyKey;

export const getAllDifficultyValues = () => {
	return Object.keys(DIFFICULTY_LABELS);
}
export const isDifficultyKey = (val: unknown): val is DifficultyKey => {
	return typeof val === 'number' && (DIFFICULTY_KEYS as number[]).includes(val);
}
export const getAllBoardPresetSizes = (): BoardShape[] => {
	return PRESET_BOARD_SIZES.map(val => {
		return { width: val.width, height: val.height };
	})
}
export const isDimensionStr = (val: string): val is DimensionStr => {
	return /^\d+x\d+$/.test(val);
}

export const getAllPresetSizeDifficultyCombinations = (
	presets: BoardPreset[] = PRESET_BOARD_SIZES
) => {
	const result: BasicPuzzleConfig[] = [];
	for (const preset of presets) {
		const { width, height } = preset;
		for (const difficulty of iterateOverDifficultyKeys(
			MIN_DIFFICULTY_KEY,
			preset.maxDifficulty
		)) {
			result.push({ width, height, difficulty });
		}
	}
	return result;
}

export function iterateOverDifficultyKeys(
	from: DifficultyKey,
	to: DifficultyKey
): DifficultyKey[] {
	const result: DifficultyKey[] = [];
	for (let i = from; i <= to; i++) {
		if (!isDifficultyKey(i)) throw new Error(`Invalid difficulty key: ${i}`);
		result.push(i);
	}
	return result;
}