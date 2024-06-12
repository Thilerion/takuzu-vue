import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import { computed } from "vue";
import type { BoardShape, PuzzleGrid } from "@/lib/types.js";

export const useCustomPuzzleInputGrid = createSharedComposable(() => {
	const config = useLocalStorage<{
		width: number, height: number, forceSquareGrid: boolean
	}>('takuzu_puzzle-input-config', {
		width: 10,
		height: 10,
		forceSquareGrid: false
	}, {
		deep: true,
		writeDefaults: true,
	});

	const puzzleGridBase = useLocalStorage<null | PuzzleGrid>('takuzu_custom-puzzle-input-grid', [], {
		deep: true,
		writeDefaults: false,
		serializer: {
			read(v) {
				if (!v) return null;
				try {
					const parsed = JSON.parse(v);
	
					if (!Array.isArray(parsed) || !Array.isArray(parsed?.[0])) {
						return null;
					}
					const flat = parsed.flat().join('');
					if (!flat.includes('1') && !flat.includes('0')) {
						return null;
					}
					return parsed;
				} catch (e) {
					console.warn(e);
					console.warn('Could not read input grid from storage');
					return null;
				}
			},
			write(v) {
				if (!Array.isArray(v)) return "";
				const height = v?.length
				const width = v?.[0]?.length;
				if (!height || !width) return "";
				return JSON.stringify(v);
			}
		}
	})

	if (puzzleGridBase.value != null) {
		const pWidth = puzzleGridBase.value[0].length;
		const pHeight = puzzleGridBase.value.length;
		if (pWidth !== config.value.width || pHeight !== config.value.height) {
			puzzleGridBase.value = null;
		}
	}

	const dimensions = computed((): BoardShape => {
		return {
			width: config.value.width,
			height: config.value.height
		}
	})

	

	// Create new grid (empty) with dimensions from config
	const reset = () => {
		const { width, height } = dimensions.value;
		puzzleGridBase.value = createEmptyGrid(width, height);	
	}

	// Expand or shrink grid with dimensions, while keeping existing values
	const update = () => {
		if (puzzleGridBase.value == null) return reset();
		const { width, height } = dimensions.value;
		const base = puzzleGridBase.value;
		let baseCopy = base.map(r => [...r]);

		const diffHeight = height - base.length;
		if (diffHeight < 0) {
			baseCopy.splice(diffHeight, -diffHeight);
		} else if (diffHeight > 0) {
			baseCopy.push(...Array(diffHeight).fill('.').map(() => Array(width).fill('.')));
		}

		baseCopy = baseCopy.map(row => {
			if (!Array.isArray(row)) {
				return Array(width).fill('.');
			}
			const rowWidth = row.length;
			if (rowWidth > width) {
				return row.slice(0, width);
			} else if (rowWidth < width) {
				return [...row, ...Array(width - rowWidth).fill('.')]
			} else return [...row];
		})

		puzzleGridBase.value = baseCopy;
	}

	return { reset, config, update, puzzleGridBase }
})

function createEmptyGrid(width: number, height: number) {
	return Array(height).fill(null).map(() => Array(width).fill('.'));
}