const getPuzzleSizeCountModifier = (count, base = 36) => count / base;

const PuzzleStat = (sizeName, cellCount, played, average) => ({
	sizeName, cellCount, played, average,
	totalTime: played * average
});
const puzzleStatsBySize = [
	PuzzleStat('6x6', 36, 143, 30),
	PuzzleStat('6x10', 60, 135, 67),
	PuzzleStat('8x8', 64, 122, 73),
	PuzzleStat('8x12', 96, 93, 115),
	PuzzleStat('10x10', 100, 95, 128),
	PuzzleStat('12x12', 144, 34, 201),
	PuzzleStat('14x14', 196, 27, 310)
];

const REL_MODIFIER_CALC = {
	sqrt: (cellCount) => Math.sqrt(cellCount / 100),
	sqrt90: cellCount => 0.9 * Math.sqrt(cellCount / 100) + 0.1,
	sqrt75: cellCount => 0.75 * Math.sqrt(cellCount / 100) + 0.25,
}

for (const sizeStat of puzzleStatsBySize) {
	sizeStat.modSqrt = REL_MODIFIER_CALC.sqrt(sizeStat.cellCount);
	sizeStat.modSqrt90 = REL_MODIFIER_CALC.sqrt90(sizeStat.cellCount);
	sizeStat.modSqrt75 = REL_MODIFIER_CALC.sqrt75(sizeStat.cellCount);

	sizeStat.scoreSqrt = Math.round(sizeStat.totalTime / sizeStat.modSqrt);
	sizeStat.scoreSqrt90 = Math.round(sizeStat.totalTime / sizeStat.modSqrt90);
	sizeStat.scoreSqrt75 = Math.round(sizeStat.totalTime / sizeStat.modSqrt75);
}

console.table(puzzleStatsBySize.map(sizeStat => {
	const { sizeName, scoreSqrt, scoreSqrt75, scoreSqrt90, totalTime } = sizeStat;
	return { sizeName, totalTime, scoreSqrt, scoreSqrt75, scoreSqrt90 };
}))


// RELATIVE BY 36 CELLS:
//sqrt:		10x10, 6x10, 8x8, 8x12, 6, 14, 12
//sqrt90:	10x10, 6x10, 8x8, 8x12, 6, 14, 12
//sqrt75:	10x10, 6x10, 8x12, 8x8, 6, 14, 12
//total:	10x10, 8x12, 6x10, 8x8, 14, 12, 6

// RELATIVE BY 100 CELLS:
//sqrt:		10x10, 6x10, 8x8, 8x12, 6, 14, 12
//sqrt90:	10x10, 6x10, 8x12, 8x8, 6, 14, 12
//sqrt75:	10x10, 6x10, 8x12, 8x8, 14, 6, 12
//total:	10x10, 8x12, 6x10, 8x8, 14, 12, 6



