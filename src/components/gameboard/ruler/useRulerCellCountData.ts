import { ONE, ZERO, type PuzzleSymbol } from "@/lib/constants.js";
import type { LineCounts, PuzzleSymbolCount } from "@/lib/types.js";
import { debouncedWatch } from "@vueuse/core";
import { ref, type Ref, type DeepReadonly, readonly } from "vue";

export type RulerPuzzleSymbolCountData = {
	current: number,
	remaining: number,
	error: boolean,
	complete: boolean
};
export type RulerLineCountData = {
	index: number,
	isComplete: boolean,
} & Record<PuzzleSymbol, RulerPuzzleSymbolCountData>;
export type RulerCountData = RulerLineCountData[];

export const useRulerCellCountData = (
	lineCounts: Ref<LineCounts | null>,
	requiredCount: Ref<PuzzleSymbolCount | undefined>,
	opts: {	debounceDelay: number, maxWait: number	}
): { data: DeepReadonly<Ref<RulerCountData | null>> } => {
	const data = ref(parseCellData(lineCounts.value, requiredCount.value));

	debouncedWatch([lineCounts, requiredCount], ([counts, required]) => {
		data.value = parseCellData(counts, required);
	}, { immediate: false, deep: true, debounce: opts.debounceDelay, maxWait: opts.maxWait });
	
	return {
		data: readonly(data),
	}
}

function parseCellData(
	counts: LineCounts | null,
	required: PuzzleSymbolCount | undefined
): RulerCountData | null {
	if (counts == null || required == null) return null;
	const {[ZERO]: reqZero, [ONE]: reqOne} = required;
	return counts.map((c, i) => {
		const {
			[ZERO]: zeroCur, [ONE]: oneCur
		} = c;
		const zeroRem = reqZero - zeroCur;
		const oneRem = reqOne - oneCur;
		const zero = {
			current: zeroCur,
			remaining: zeroRem,
			error: zeroCur > reqZero,
			complete: zeroRem === 0,
		};
		const one = {
			current: oneCur,
			remaining: oneRem,
			error: oneCur > reqOne,
			complete: oneRem === 0
		};
		const complete = zero.complete && one.complete;
		return { 
			[ZERO]: zero,
			[ONE]: one,
			isComplete: complete,
			index: i
		};
	});
}