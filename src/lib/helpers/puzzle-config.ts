import { isDifficultyKey } from "@/config.js";
import type { BasicPuzzleConfig, PuzzleConfigKey } from "../types.js";

export const toPuzzleConfigKey = ({
	width, height, difficulty
}: BasicPuzzleConfig): PuzzleConfigKey => {
	return `${width}x${height}-${difficulty}`;
}

export const parsePuzzleConfigKey = (key: PuzzleConfigKey): BasicPuzzleConfig => {
	const [width, height, difficulty] = key.split(/x|-/).map(Number);
	if (!isDifficultyKey(difficulty)) throw new Error(`Invalid difficulty key: ${difficulty}`);
	return { width, height, difficulty };
}