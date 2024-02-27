import { EMPTY, ONE, ZERO, type PuzzleSymbol, type PuzzleValue } from "@/lib/constants";
import { useSettingsStore } from "@/stores/settings/store"
import { createSharedComposable } from "@vueuse/core";
import { computed, toRef } from "vue";

type ToggleOrder = [typeof EMPTY, PuzzleSymbol, PuzzleSymbol];

const orderZeroFirst: ToggleOrder = [EMPTY, ZERO, ONE];
const orderOneFirst: ToggleOrder = [EMPTY, ONE, ZERO];
const toggleOrders = {
  [ZERO]: orderZeroFirst,
  [ONE]: orderOneFirst,
};

const nextInOrder = (order: ToggleOrder, idx: number): PuzzleValue => {
  return order[(idx + 1) % 3];
};
const nextValue = (order: ToggleOrder, current: PuzzleValue): PuzzleValue => {
  const curIdx = order.indexOf(current);
  return nextInOrder(order, curIdx);
};

export const usePuzzleToggle = () => {
	const settingsStore = useSettingsStore();
	const mode = toRef(settingsStore, 'toggleMode');
	const selectedOrder = computed(() => toggleOrders[mode.value]);

	return {
		toggle: (currentValue: PuzzleValue) =>
			nextValue(selectedOrder.value, currentValue),
	};
};

export const useSharedPuzzleToggle = createSharedComposable(usePuzzleToggle);