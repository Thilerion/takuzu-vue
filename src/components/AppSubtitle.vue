<template>
<div class="flex" @click="resetAnimation">
	<div
		v-for="(char, idx) in maskedLineDisplay"
		:key="`${char}-${idx}`"
		class="line-char text-center w-[1.2ch] tracking-widest text-sm font-sans dark:font-normal font-bold"
		:class="{
			'prefilled': static || originalMaskedLine[idx] === char,
			'fade-in': char !== ' ' && originalMaskedLine[idx] !== char && !static,
		}"
	>{{ char }}</div>
</div>
</template>

<script setup lang="ts">
import type { PuzzleValueLine } from '@/lib/types.js';
import { splitLine } from '@/lib/utils/puzzle-line.utils.js';
import { isPuzzleSymbol } from '@/lib/utils/puzzle-value.utils.js';
import { pickRandom, randomBetween } from '@/utils/random.utils.js';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps<{ static?: boolean }>();

// Define type for animation order configuration
type FillOrder = { index: number, delay: number };
// Define type for line configurations including filled line, initial masked line, and animation order
type LineConfig = {
	filled: PuzzleValueLine,
	masked: PuzzleValueLine,
	fillOrder: FillOrder[],
};

// Utility functions for generating random delay times for animation
const getRandomDelayShort = () => randomBetween(500, 700);
const getRandomDelayLong = () => randomBetween(1000, 1700);

const lineConfigurations: LineConfig[] = [
	{
		filled: splitLine('110010110010'),
		masked: splitLine('1.00..1.00..'),
		fillOrder: [
			{ index: 10, delay: getRandomDelayShort() + 400 },
			{ index: 7, delay: getRandomDelayShort() },
			{ index: 1, delay: getRandomDelayLong() },
			{ index: 11, delay: getRandomDelayLong() },
			{ index: 4, delay: getRandomDelayLong() - 100 },
			{ index: 5, delay: getRandomDelayShort() },
		],
	},
	{
		filled: splitLine('101100101100'),
		masked: splitLine('1.1.00..11.0'),
		fillOrder: [
			{ index: 10, delay: getRandomDelayShort() + 400 },
			{ index: 7, delay: getRandomDelayShort() },
			{ index: 3, delay: getRandomDelayLong() + 100 },
			{ index: 6, delay: getRandomDelayShort() },
			{ index: 1, delay: getRandomDelayLong() + 200 },
		]
	}
]

// Randomly select one of the line configurations
const selectedConfig = ref(pickRandom(lineConfigurations));

const filledLine = computed(() => selectedConfig.value.filled);
const originalMaskedLine = computed(() => selectedConfig.value.masked);
const maskedLine = ref<PuzzleValueLine>([...originalMaskedLine.value]);
const maskedLineDisplay = computed(() => maskedLine.value.map(v => isPuzzleSymbol(v) ? v : ' '));

let timeoutId: ReturnType<typeof setTimeout> | null = null;
const fillNextValue = (index: number, delay: number) => {
	timeoutId = setTimeout(() => {
		maskedLine.value[index] = filledLine.value[index];
		const nextIndex = selectedConfig.value.fillOrder.findIndex(x => x.index === index) + 1;
		if (nextIndex < selectedConfig.value.fillOrder.length) {
			const nextItem = selectedConfig.value.fillOrder[nextIndex];
			fillNextValue(nextItem.index, nextItem.delay);
		}
		timeoutId = null;
	}, delay);
}

// Start animation on mount (if not static)
onMounted(() => {
	if (!props.static) {
		const firstItem = selectedConfig.value.fillOrder[0];
		fillNextValue(firstItem.index, firstItem.delay);
	}
});

// Clear timeout on unmount
onBeforeUnmount(() => {
	if (timeoutId != null) {
		clearTimeout(timeoutId);
	}
});

// Reset animation on click
function resetAnimation() {
	if (timeoutId != null) {
		clearTimeout(timeoutId);
	}
	maskedLine.value = [...originalMaskedLine.value];
	if (!props.static) {
		const firstItem = selectedConfig.value.fillOrder[0];
		fillNextValue(firstItem.index, firstItem.delay);
	}
}
</script>

<style scoped>
html.dark .line-char {
	--base-opacity: 0.65;
}

html.light .line-char {
	--base-opacity: 0.45;
}

.line-char {
	opacity: var(--base-opacity);
}

.line-char.fade-in {
	animation: fadeIn 1s forwards;
}

@keyframes fadeIn {
	0% {
		opacity: 0;
	}

	20% {
		opacity: 1;
	}

	100% {
		opacity: var(--base-opacity);
	}
}
</style>