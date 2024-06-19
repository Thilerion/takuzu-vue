import { EMPTY } from "@/lib/constants.js";
import { getValidLineCompletions } from "@/lib/line-generation/memoized.js";
import type { PuzzleValueLine, PuzzleValueLineStr } from "@/lib/types.js";
import { splitLine } from "@/lib/utils/puzzle-line.utils.js";
import { computed, type Ref } from "vue";

export const useValidLineCompletions = (
	input: Ref<PuzzleValueLineStr | null>
) => {
	const arr = computed(() => input.value == null ? null : splitLine(input.value));
	const completions = computed(() => input.value == null ? null : getValidLineCompletions(arr.value!));

	const resultingLine = computed(() => {
		if (completions.value == null) return null;
		if (completions.value.length === 0) {
			// no ways to complete the line, so is invalid
			return null;
		}
		if (completions.value.length === 1) return [...completions.value[0]];

		const res: PuzzleValueLine = [...arr.value!];
		for (let i = 0; i < res.length; i++) {
			for (const solution of completions.value) {
				if (res[i] === EMPTY) {
					res[i] = solution[i];
					continue;
				}
				if (solution[i] !== res[i] && res[i] !== EMPTY) {
					res[i] = EMPTY;
					break;
				}
			}
		}
		return res;
	})

	return { completions, resultingLine };
}