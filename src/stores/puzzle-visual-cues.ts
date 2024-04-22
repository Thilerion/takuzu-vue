import type { PuzzleBoardHighlight, PuzzleBoardCellMark, ErrorMark } from "@/helpers/puzzle-visual-cues.js";
import type { Vec } from "@/lib/types.js";
import { defineStore } from "pinia";
import { ref } from "vue";

export const usePuzzleVisualCuesStore = defineStore('puzzleVisualCues', () => {
	// state
	const highlightsVisible = ref(false);
	const highlights = ref<PuzzleBoardHighlight[]>([]);
	const cellMarks = ref<PuzzleBoardCellMark[]>([]);

	// clear/reset actions
	const clearHighlights = () => highlights.value = [];
	const clearMarks = () => cellMarks.value = [];
	const clearAll = () => {
		clearHighlights();
		clearMarks();
	}
	// specific clear/remove actions for highlights
	const clearHighlightsFromHints = () => {
		highlights.value = highlights.value.filter(highlight => highlight.source !== 'hint');
	}
	const clearHighlightsFromRuleViolations = () => {
		highlights.value = highlights.value.filter(highlight => highlight.source !== 'ruleViolationCheck');
	}
	// specific clear/remove actions for marks
	const clearErrorMarks = () => {
		cellMarks.value = cellMarks.value.filter(mark => mark.errorType !== 'incorrectValue');
	}
	const removeCellMarkAtCell = (cell: Vec) => {
		cellMarks.value = cellMarks.value.filter(mark => {
			const { x, y } = mark.cell;
			return !(cell.x === x && cell.y === y);
		});
	}

	// add/set actions
	const addErrorMarks = (marks: ErrorMark[]) => {
		cellMarks.value = [...cellMarks.value, ...marks];
	}
	const addErrorMarksFromCells = (type: ErrorMark['errorType'], cells: Vec[]) => {
		const marks: ErrorMark[] = cells.map(({ x, y }): ErrorMark => ({
			type: 'error',
			cell: { x, y }, // don't simply add the cell, it needs to be cloned at the least
			errorType: type,
			id: `${x},${y}`
		})).filter(mark => {
			// don't add duplicates
			return !cellMarks.value.some(existingMark => existingMark.id === mark.id);
		})
		addErrorMarks(marks);
	}
	const addHintHighlights = (values: PuzzleBoardHighlight[]) => {
		highlights.value = [...highlights.value, ...values];
	}
	const setHintHighlights = (
		values: PuzzleBoardHighlight[],
		{ setVisible }: { setVisible: boolean } = { setVisible: true }
	) => {
		clearHighlightsFromHints();
		
		if (values.length > 0) {
			addHintHighlights(values);
			if (setVisible) showHighlights();
		} else {
			if (setVisible) hideHighlights();
		}
	}
	const setRuleViolationHighlights = (
		values: PuzzleBoardHighlight[],
		{ setVisible }: { setVisible: boolean } = { setVisible: true }
	) => {
		clearHighlightsFromRuleViolations();
		
		if (values.length > 0) {
			addHintHighlights(values);
			if (setVisible) showHighlights();
		} else {
			if (setVisible) hideHighlights();
		}
	}
	
	// highlights visibility state
	const toggleHighlightsVisibility = () => {
		highlightsVisible.value = !highlightsVisible.value;
	}
	const showHighlights = () => {
		highlightsVisible.value = true;
	}
	const hideHighlights = () => highlightsVisible.value = false;

	return {
		// state
		highlights,
		cellMarks,

		// reset/clear/remove actions
		clearHighlights,
		clearMarks,
		clearAll,
		reset: clearAll,

		// clear all of a specific type actions
		clearHighlightsFromHints, // to remove all highlights with source 'hint'
		clearHighlightsFromRuleViolations, // to remove all highlights with source 'ruleViolationCheck'
		clearErrorMarks, // to remove all marks with type 'error'

		// remove/filter some of a specific type actions
		removeCellMarkAtCell,

		// add/set actions
		addErrorMarks,
		addErrorMarksFromCells,		
		addHintHighlights,
		setHintHighlights, // replaces all highlights with source 'hint' with different highlights with source 'hint'
		setRuleViolationHighlights,

		// visibility state of highlights
		highlightsVisible,
		toggleHighlightsVisibility,
		showHighlights,
		hideHighlights,
	}
})