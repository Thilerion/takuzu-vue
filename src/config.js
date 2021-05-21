import { dimensionsToBoardType } from "./utils/puzzle.utils.js";

class BoardPreset {
	constructor(w, h, maxDifficulty) {
		this.width = w;
		this.height = h;
		this.type = dimensionsToBoardType(w, h);
		this.maxDifficulty = maxDifficulty;
	}
}

export const boardTypes = {
	NORMAL: 'Normal',
	RECT: 'Rectangular',
	ODD: 'Odd',
};
export const PRESET_BOARD_SIZES = [
	// normal / square boards
	new BoardPreset(6, 6, 2),
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
	new BoardPreset(7, 7, 2),
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
}