<template>
	<div class="ruler counts" :class="{'ruler-rows': lineType === 'rows', 'ruler-columns': lineType === 'columns'}" @pointerdown="handlePointerdown">
		<div class="ruler-cell" v-for="(lineCount, lineIdx) in debouncedCounts" :key="lineIdx" @pointerenter="handlePointerover($event, lineIdx)">

			<div class="count-wrapper zero" :class="{'count-error': checkCountError(lineCount[0]), 'count-complete': checkCountComplete(lineCount[0])}">
				<div class="count zero">
					{{lineCount[0]}}
				</div>
			</div>
			<div class="count-wrapper one" :class="{'count-error': checkCountError(lineCount[1]), 'count-complete': checkCountComplete(lineCount[1])}">
				<div class="count one">
					{{lineCount[1]}}
				</div>
			</div>
			<div class="divider-wrapper">
				<div class="divider"></div>
			</div>
		</div>
	</div>
</template>

<script>
import debounce from 'lodash.debounce';
import { COLUMN, ONE, ROW, ZERO } from '@/lib/constants.js';
import { computed, ref, watch } from 'vue';
import { usePuzzleStore } from '@/stores/puzzle-old';
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
	created() {
		this.updateCounts = debounce(this.setDebouncedCounts, 195, {
			leading: false,
		});
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
.count {
	@apply w-full h-full overflow-hidden opacity-80;
}

.count-wrapper {
	transform: translateX(0) rotateY(0deg);
	min-width: 1.5ch;
	@apply flex;
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

.one {
	@apply mt-auto ml-auto;
}
.zero {
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
	@apply text-red-700;
}
.count-complete {
	transition: opacity .15s ease-out .5s;
	@apply opacity-50;
}

.divider-wrapper {
	@apply absolute w-full h-full opacity-50;
	display: flex;
	align-items: center;
	justify-content: center;
	padding-left: 2px;
}
.divider {
	transform-origin: 50% 50%;
	transform: rotate(50deg);
	@apply opacity-30 transition-opacity bg-black;
	width: 1px;
	height: 50%;
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