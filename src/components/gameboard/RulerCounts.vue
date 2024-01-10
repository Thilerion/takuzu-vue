<template>
	<div class="ruler counts" :class="{ 'ruler-rows': lineType === 'rows', 'ruler-columns': lineType === 'columns' }"
		@pointerdown="handlePointerdown">
		<div class="ruler-cell" v-for="(lineCount, lineIdx) in debouncedCounts" :key="lineIdx"
			@pointerenter="handlePointerover($event, lineIdx)"
			:class="{ 'complete-single': completeCounts[lineIdx][0] || completeCounts[lineIdx][1], 'complete-both': completeCounts[lineIdx][0] && completeCounts[lineIdx][1] }">

			<div class="count-wrapper zero" :class="{
				'count-error': errorCounts[lineIdx][0],
				'count-complete': completeCounts[lineIdx][0]
			}">
				<div class="count zero">{{ lineCount[0] }}
				</div>
			</div>
			<div class="count-wrapper one" :class="{
				'count-error': errorCounts[lineIdx][1],
				'count-complete': completeCounts[lineIdx][1]
			}">
				<div class="count one">{{ lineCount[1] }}
				</div>
			</div>
			<div class="divider-wrapper">
				<div class="divider"></div>
			</div>
		</div>
	</div>
</template>

<script>
import { COLUMN, ONE, ROW, ZERO } from '@/lib/constants';
import { computed, ref, watch } from 'vue';
import { usePuzzleStore } from '@/stores/puzzle';
import { useDebounceFn } from '@vueuse/core';
export default {
	props: {
		lineType: {
			type: String,
			required: true
		},
		counts: {
			type: Array,
			required: true
		},
		rulerType: {
			validator(value) {
				return ['count-remaining', 'count-current'].includes(value);
			},
			required: true,
		}
	},
	emits: ['select-line'],
	setup() {
		const numRequired = ref(null);
		const puzzleStore = usePuzzleStore();
		const board = computed(() => puzzleStore?.board);

		watch(board, (value) => {
			if (value != null) {
				numRequired.value = value.numRequired;
			}
		}, { immediate: true });

		return { numRequired };
	},
	data() {
		return {
			debouncedCounts: [],
		}
	},
	beforeMount() {
		this.setDebouncedCounts();
	},
	methods: {
		handlePointerdown(e) {
			e.target.releasePointerCapture(e.pointerId);
		},
		handlePointerover(ev, lineIdx = 'line') {
			ev.preventDefault();
			console.log(`${this.lineType}: ${lineIdx}`);
			const type = this.lineType === 'rows' ? ROW : COLUMN;
			this.$emit('select-line', { type, index: lineIdx });
		},
		transformLineCount(l) {
			const zero = l[ZERO];
			const one = l[ONE];
			return [zero, one];
		},
		setDebouncedCounts() {
			const counts = this.counts.map(l => this.transformLineCount(l));
			if (this.rulerType === 'count-current') {
				this.debouncedCounts = counts;
			} else {
				const lineType = this.lineType === 'rows' ? ROW : COLUMN;
				const req = this.numRequired[lineType];
				this.debouncedCounts = counts.map(val => {
					const zero = req[ZERO] - val[0];
					const one = req[ONE] - val[1];
					return [zero, one];
				})
			}
		},
		checkCountError(amount) {
			if (amount < 0 && this.rulerType === 'count-remaining') return true;
			return false;
		},
		checkCountComplete(amount) {
			if (amount === 0 && this.rulerType === 'count-remaining') return true;
			return false;
		}
	},
	computed: {
		completeCounts() {
			if (this.rulerType !== 'count-remaining') {
				return Array(this.debouncedCounts.length).fill(null).map(() => [false, false]);
			}
			return this.debouncedCounts.map(([a, b]) => {
				return [a === 0, b === 0];
			})
		},
		errorCounts() {
			if (this.rulerType !== 'count-remaining') {
				return Array(this.debouncedCounts.length).fill(null).map(() => [false, false]);
			}
			return this.debouncedCounts.map(([a, b]) => {
				return [a < 0, b < 0];
			})
		}
	},
	created() {
		this.updateCounts = useDebounceFn(this.setDebouncedCounts, 195, { maxWait: 400 });
	},
	watch: {
		counts: {
			handler() {
				this.updateCounts();
			},
			deep: true
		}
	}
};
</script>

<style scoped>

.ruler {
	@apply grid leading-none place-items-center;
	gap: var(--grid-gap);
	--ruler-cell-size: calc(var(--cell-size) - var(--grid-gap));
	--half-size: calc(var(--cell-size) / 4);
	--font-size: clamp(10px, var(--half-size), 2rem);
	font-size: var(--font-size);
}
.ruler-rows {
	width: var(--ruler-cell-size);
	@apply h-full flex-col;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: 1fr;
}
.ruler-columns {
	height: var(--ruler-cell-size);
	@apply w-full flex-row;
	grid-template-columns: repeat(var(--columns), 1fr);
	grid-template-rows: 1fr;
}

.ruler {
	pointer-events: none;
	touch-action: none;
}
.ruler-cell {
	touch-action: none;
	pointer-events: auto;
	grid-template-rows: repeat(3, 1fr);
	grid-template-columns: repeat(3, 1fr);

	padding: 15%;
	@apply grid leading-none overflow-hidden relative transition-colors font-sans justify-items-stretch items-stretch pointer-events-auto;
	width: var(--ruler-cell-size);
	height: var(--ruler-cell-size);

	--half-size: calc(var(--ruler-cell-size) * 0.3);
	--font-size: clamp(10px, var(--half-size), 2rem);
	font-size: var(--font-size);
}
.ruler-cell * {
	pointer-events: none;
	user-select: none;
}
.ruler-cell.complete-both .divider {
	@apply opacity-60;
}
.ruler-cell.complete-both {
	@apply opacity-60;
}
.ruler-cell.complete-single .divider {
	@apply opacity-80;
}
.count {
	@apply h-full opacity-80;
}

.count-wrapper {
	transform: translateX(0) rotateY(0deg);
	min-width: 1.5ch;
	@apply flex items-end justify-end;
}
.count-wrapper.zero {
	@apply text-right;
	grid-row: 1 / span 2;
	grid-column: 1 / span 2;
}
.count-wrapper.one {
	@apply text-right;
	grid-row: 2 / span 2;
	grid-column: 2 / span 2;
}
.paused .count {
	@apply after:absolute after:h-full after:right-0 after:w-[1.2ch] transition-none after:z-20 relative z-10 after:bg-gray-300 text-transparent;
}

.count-wrapper.one {
	@apply mt-auto ml-auto;
}
.count-wrapper.zero {
	@apply mb-auto mr-auto;
}

.count-error {
	/*
	when count becomes error, set color with a delay
	when becomes correct again, no transition
	*/
	transition: color .15s ease-out 1s;
	animation: headShake 1s ease-in-out 2s;
	animation-fill-mode: forwards;
	@apply text-red-700 dark:text-red-500;
}
.count-complete {
	transition: opacity .15s ease-out .5s;
	@apply opacity-30;
}
.paused .count-complete {
	@apply opacity-100 transition-none;
}

.divider-wrapper {
	@apply absolute w-full h-full opacity-50 pl-0.5 flex items-center justify-center;
}
.divider {
	transform-origin: 50% 50%;
	transform: rotate(50deg);
	@apply opacity-30 transition-opacity bg-black dark:bg-slate-300 dark:opacity-100 w-px h-1/2 dark:h-2/5;
}

.animate__headShake {
	animation-timing-function: ease-in-out;
	animation-name: headShake;
}
@keyframes headShake {
	0% {
		transform: translateX(0);
		font-weight: normal;
	}

	6.5% {
		transform: translateX(-1.5px) rotateY(-9deg);
	}

	18.5% {
		transform: translateX(1px) rotateY(7deg);
		font-weight: 600;
	}

	31.5% {
		transform: translateX(-0.75px) rotateY(-5deg);

	}

	43.5% {
		transform: translateX(0.6px) rotateY(3deg);
	}

	50% {
		transform: translateX(0);
	}

	100% {
		transform: translateX(0) rotateY(0deg);
		font-weight: 600;
	}
}
</style>