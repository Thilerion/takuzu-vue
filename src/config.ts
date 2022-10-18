export const boardTypes = {
	NORMAL: 'Normal',
	RECT: 'Rectangular',
	ODD: 'Odd',
} as const;
export type BoardType = typeof boardTypes[keyof typeof boardTypes];
interface IsBoardType<T extends BoardType> { type: T }

export class BoardPreset {
	type: BoardType;

	constructor(public width: number, public height: number, public maxDifficulty: number) {
		this.type = dimensionsToBoardType(width, height);
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
	isOddBoardType(): this is BoardPreset & IsBoardType<'Odd'> {
		return this.isOdd;
	}
	isRectBoardType(): this is BoardPreset & IsBoardType<'Rectangular'> {
		return this.isRect;
	}
	isNormalBoardType(): this is BoardPreset & IsBoardType<'Normal'> {
		return this.isNormal;
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

export const DIFFICULTY_LABELS = {
	1: 'Beginner',
	2: 'Normal',
	3: 'Hard',
	4: 'Very Hard',
	5: 'Extreme',
} as const;

export const getAllDifficultyValues = () => {
	return Object.keys(DIFFICULTY_LABELS);
}
export const getAllBoardPresetSizes = () => {
	return PRESET_BOARD_SIZES.map(val => {
		return { width: val.width, height: val.height };
	})
}
export const getAllBoardPresetSizesAsStr = () => {
	return PRESET_BOARD_SIZES.map(val => {
		return `${val.width}x${val.height}`;
	})
}
export const getAllSizeDifficultyCombinations = () => {
	const result = [];
	const difficulties = getAllDifficultyValues();
	const sizes = getAllBoardPresetSizes();
	for (const difficulty of difficulties) {
		for (const size of sizes) {
			const { width, height } = size;
			result.push({ width, height, difficulty });
		}
	}
	return result;
}

export const getAllPresetSizeDifficultyCombinations = () => {
	const result = [];
	for (const preset of PRESET_BOARD_SIZES) {
		const { width, height } = preset;
		for (let i = 1; i <= preset.maxDifficulty; i++) {
			result.push({ width, height, difficulty: i });
		}
	}
	return result;
}