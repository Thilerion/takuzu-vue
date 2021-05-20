export class PuzzleData {
	constructor(data) {
		if (data == null) throw new Error('No data in PuzzleData constructor.');
		if (typeof data.initialBoard !== 'string') {
			throw new Error('InitialBoard and SolutionBoard must both be strings. Convert them first before creating puzzleData. Should probably use PuzzleData.fromGameState');
		}
		this.width = data.width;
		this.height = data.height;

		this.difficulty = data.difficulty;
		this.initialBoard = data.initialBoard;
		this.solution = data.solution;

		this.date = data.date;
		this.timeElapsed = data.timeElapsed;
	}

	static fromGameState(gameState) {
		if (gameState == null || gameState.timeElapsedUnmount == null) {
			throw new Error('Invalid gameState; cannot turn this into a PuzzleData entry');
		}

		const timeElapsed = gameState.timeElapsedUnmount;
		const date = Date.now();

		const { width, height, difficulty } = gameState;
		const initialBoard = gameState.initialBoard.toBoardString();
		const solution = gameState.solution.toBoardString();

		return new PuzzleData({
			width, height, difficulty, initialBoard, solution, timeElapsed, date
		});
	}
}