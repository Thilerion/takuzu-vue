<template>
	<div class="ruler counts" :class="{'ruler-rows': lineType === 'rows', 'ruler-columns': lineType === 'columns'}">
		<div class="ruler-cell" v-for="(lineCount, lineIdx) in debouncedCounts" :key="lineIdx">

			<div class="count-wrapper zero" :class="{'count-error': lineCount[0] < 0}">
				<div class="count zero">
					{{lineCount[0]}}
				</div>
			</div>
			<div class="count-wrapper one" :class="{'count-error': lineCount[1] < 0}">
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
export default {
	props: {
		lineType: {
			type: String,
			required: true
		},
		counts: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			debouncedCounts: []
		}
	},
	beforeMount() {
		this.debouncedCounts = this.counts;
	},
	methods: {
		setDebouncedCounts() {
			this.debouncedCounts = this.counts;
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
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
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

.ruler-cell {
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