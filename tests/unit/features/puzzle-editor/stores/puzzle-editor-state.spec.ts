import { CUSTOM_PUZZLE_MIN_SIZE, CUSTOM_PUZZLE_MAX_SIZE } from "@/features/puzzle-editor/services/validate-dimensions.js";
import { PUZZLE_EDITOR_STATE_STORAGE_KEY, usePuzzleEditorStore } from "@/features/puzzle-editor/stores/puzzle-editor-state.js";
import { EMPTY } from "@/lib/constants.js";
import type { PuzzleValueLine } from "@/lib/types.js";
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";
import { createPinia, setActivePinia } from "pinia"
import { nextTick } from "vue";

describe('PuzzleEditorState store', () => {

	beforeEach(() => {
		localStorage.clear();
		setActivePinia(createPinia());
	})

	it('initializes with default values', () => {
		const store = usePuzzleEditorStore()
		expect(store.width).toBe(10)
		expect(store.height).toBe(10)
		expect(store.forceSquareGrid).toBe(false)
		expect(store.customPuzzleGrid).toBeNull()
	})

	it('correctly reads from localStorage', async () => {
		localStorage.setItem(PUZZLE_EDITOR_STATE_STORAGE_KEY, JSON.stringify({ width: 12, height: 12, forceSquareGrid: true, grid: null }));
		await nextTick();
		const store = usePuzzleEditorStore()
		expect(store.dimensions).toEqual({ width: 12, height: 12 });
		expect(store.forceSquareGrid).toBe(true);
		expect(store.customPuzzleGrid).toBeNull();
	})

	it('correctly writes to localStorage', async () => {
		const store = usePuzzleEditorStore();
		store.forceSquareGrid = false;
		store.width = 12;
		store.height = 8;
		store.customPuzzleGrid = null;
		await nextTick();

		const retrieved = JSON.parse(localStorage.getItem(PUZZLE_EDITOR_STATE_STORAGE_KEY) as string);
		expect(retrieved).toEqual({ width: 12, height: 8, forceSquareGrid: false, grid: null });
	})

	it('enforces square grid when forceSquareGrid is true', () => {
		const store = usePuzzleEditorStore();
		store.forceSquareGrid = true;

		store.width = 15;
		expect(store.dimensions).toEqual({ width: 15, height: 15 });

		store.height = 8;
		expect(store.dimensions).toEqual({ width: 8, height: 8 });
	})

	it('clamps width and height within allowed range', () => {
		const store = usePuzzleEditorStore()
		store.width = 2;
		expect(store.width).toBe(CUSTOM_PUZZLE_MIN_SIZE)

		store.width = 500;
		expect(store.width).toBe(CUSTOM_PUZZLE_MAX_SIZE)

		store.height = CUSTOM_PUZZLE_MIN_SIZE - 1
		expect(store.height).toBe(CUSTOM_PUZZLE_MIN_SIZE)

		store.height = CUSTOM_PUZZLE_MAX_SIZE + 1
		expect(store.height).toBe(CUSTOM_PUZZLE_MAX_SIZE)
	})

	test('editing forceSquareGrid also updates width and height', () => {
		const store = usePuzzleEditorStore();
		store.forceSquareGrid = false;

		store.width = 6;
		store.height = 12;
		expect(store.dimensions).toEqual({ width: 6, height: 12 });

		store.forceSquareGrid = true;
		expect(store.dimensions).toEqual({ width: 6, height: 6 });

		store.forceSquareGrid = false;
		expect(store.dimensions).toEqual({ width: 6, height: 6 });

		store.width = 8;
		expect(store.dimensions).toEqual({ width: 8, height: 6 });
	})

	describe('setting grid', () => {
		test('resetGrid resets grid according to dimensions', () => {
			const store = usePuzzleEditorStore();

			store.width = 6;
			store.height = 6;
			store.resetGrid();
			expect(store.customPuzzleGrid!.length).toBe(6);
			expect(store.customPuzzleGrid![0].length).toBe(6);
			expect(store.customPuzzleGrid!.flat().every(val => val === EMPTY)).toBe(true);
		})

		test('updateDimensions updates grid size according to dimensions', () => {
			const store = usePuzzleEditorStore();
			store.width = 4;
			store.height = 4;
			store.updateDimensions();
			expect(store.customPuzzleGrid!.length).toBe(4);
			expect(store.customPuzzleGrid![0].length).toBe(4);

			store.customPuzzleGrid = [
				['1', '0', '1', '0'],
				['0', '1', '0', '1'],
				['1', '0', '1', '0'],
				['0', '1', '0', '1'],
			]

			store.width = 6;
			store.updateDimensions();
			expect(store.customPuzzleGrid!.length).toBe(4);
			expect(store.customPuzzleGrid![0].length).toBe(6);

			expect(store.customPuzzleGrid).toEqual([
				['1', '0', '1', '0', '.', '.'],
				['0', '1', '0', '1', '.', '.'],
				['1', '0', '1', '0', '.', '.'],
				['0', '1', '0', '1', '.', '.'],
			])

			store.height = 8;
			store.updateDimensions();
			expect(store.customPuzzleGrid!.length).toBe(8);
			expect(store.customPuzzleGrid![0].length).toBe(6);

			store.width = 5;
			store.height = 5;
			store.updateDimensions();
			expect(store.customPuzzleGrid!.length).toBe(5);
			expect(store.customPuzzleGrid![0].length).toBe(5);
		})

		test('isValidGrid returns true if a grid is valid (according to the settings)', async () => {
			const store = usePuzzleEditorStore();
			store.width = 4;
			store.height = 4;
			store.resetGrid();

			await nextTick();
			expect(store.customPuzzleGrid).not.toBeNull();
			expect(store.isValidGrid).toBe(true);

			store.width = 6;
			await nextTick();
			expect(store.isValidGrid).toBe(false); // different dimensions

			store.height = 6;
			store.width = 4;
			await nextTick();
			expect(store.isValidGrid).toBe(false); // different dimensions

			store.height = 4;
			await nextTick();
			expect(store.isValidGrid).toBe(true);

			store.customPuzzleGrid = null;
			await nextTick();
			expect(store.isValidGrid).toBe(false); // is null
		})

		test('isValidGrid returns false if a grid has invalid characters', async () => {
			const store = usePuzzleEditorStore();
			store.width = 4;
			store.height = 4;
			store.resetGrid();
			store.customPuzzleGrid = [
				'....',
				'....',
				'....',
				'....',
			].map(r => splitLine(r) as PuzzleValueLine);

			await nextTick();
			expect(store.customPuzzleGrid).not.toBeNull();
			expect(store.isValidGrid).toBe(true);

			store.customPuzzleGrid[0][0] = 'x' as any;
			await nextTick();
			expect(store.isValidGrid).toBe(false);
		})

		test('rotateGrid rotates the grid according to the given direction', async () => {
			const store = usePuzzleEditorStore();
			store.width = 4;
			store.height = 4;
			store.resetGrid();
			store.customPuzzleGrid = [
				['1', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
			]

			await nextTick();
			expect(store.customPuzzleGrid).not.toBeNull();
			expect(store.isValidGrid).toBe(true);

			store.rotateGrid('cw');
			expect(store.customPuzzleGrid).toEqual([
				['.', '.', '.', '1'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
			])

			store.rotateGrid('ccw');
			expect(store.customPuzzleGrid).toEqual([
				['1', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
			])
		})

		test('rotateGrid also updates width and height', async () => {
			const store = usePuzzleEditorStore();
			store.width = 4;
			store.height = 6;
			store.resetGrid();
			store.customPuzzleGrid = [
				['1', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
				['.', '.', '.', '.'],
			]

			store.rotateGrid('cw');
			await nextTick();
			expect(store.customPuzzleGrid).toEqual([
				['.', '.', '.', '.', '.', '1'],
				['.', '.', '.', '.', '.', '.'],
				['.', '.', '.', '.', '.', '.'],
				['.', '.', '.', '.', '.', '.'],
			])
			expect(store.isValidGrid).toBe(true);
			expect(store.width).toBe(6);
			expect(store.height).toBe(4);
		})
	})

})