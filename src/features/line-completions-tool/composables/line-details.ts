import { BoardLine } from "@/lib/board/BoardLine.js";
import type { PuzzleSymbolCount, PuzzleValueCount, PuzzleValueLineStr } from "@/lib/types.js";
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";
import { computed, reactive, toRefs, watchEffect, type Ref } from "vue";

export type PuzzleLineDetails = {
	required: PuzzleSymbolCount | null,
	counts: PuzzleValueCount | null,
	remaining: PuzzleSymbolCount | null,
	length: number | null,
}

export const usePuzzleLineDetails = (line: Ref<PuzzleValueLineStr | null>) => {
	const details: PuzzleLineDetails = reactive({
		required: null,
		counts: null,
		remaining: null,
		length: null,
	})

	const reset = () => {
		details.required = null;
		details.counts = null;
		details.remaining = null;
		details.length = null;
	}

	const lineArr = computed(() => splitLine(line.value ?? '' as PuzzleValueLineStr));

	watchEffect(() => {
		if (line.value == null) {
			reset();
			return;
		}
		const bl = BoardLine.fromValues(lineArr.value, 'A');
		const length = bl.length
		const counts = bl.counts;
		const required = bl.numRequired;
		const remaining = bl.countRemaining;
		details.required = required;
		details.counts = counts;
		details.remaining = remaining;
		details.length = length;
	})

	return {
		...toRefs(details),
		lineArr,
	}
}