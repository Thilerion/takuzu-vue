<template>
	<div
		class="cell-wrapper select-none"
		:class="{'locked': isLocked, 'incorrect': isIncorrectValue}"
		@click="clickedCell(false)"
		@touchstart="touchedCell"
		ref="cell"
	>
		<div class="cell">
			<span class="cell-value">{{value}}</span>
		</div>
	</div>
</template>

<script>
import { lengthToPwmPattern } from '../../services/vibration';

export default {
	components: {
	},
	props: {
		value: {
			required: true
		},
		x: {
			type: Number,
			required: true
		},
		y: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			touchTimer: null,
		}
	},
	computed: {
		cellId() {
			return `${this.x},${this.y}`;
		},
		isLocked() {
			return this.$store.getters.lockedCells.includes(this.cellId);
		},
		incorrectValues() {
			return this.$store.state.game.markedIncorrectValues;
		},
		isIncorrectValue() {
			return this.incorrectValues && this.incorrectValues.includes(this.cellId);
		},
		vibrateOnTap() {
			return this.$store.getters['settings/gameVibrationEnabled'];
		},
		vibrationIntensity() {
			return this.$store.state.settings.vibrationIntensity;
		}
	},
	methods: {
		clickedCell(long = false) {
			if (this.isLocked) return;
			const payload = { value: this.value, x: this.x, y: this.y, longTouch: long };
			this.$emit('clicked', payload);
		},
		touchedCell(e) {
			if (this.isLocked) return;
			e.preventDefault();
			this.touchStart = performance.now();
			this.touchTimer = setTimeout(() => {
				this.$refs.cell.removeEventListener('touchend', this.touchEnd);
				this.clickedCell(true);
				this.vibrate(true);
			}, 400);
			this.$refs.cell.addEventListener('touchend', this.touchEnd);
		},
		touchEnd() {
			clearTimeout(this.touchTimer);
			this.clickedCell(false);
			this.vibrate(false);
		},
		vibrate(long = false) {
			if (!this.vibrateOnTap) return;
			const length = long ? 140 : 40;
			const vibrationPattern = lengthToPwmPattern(length, this.vibrationIntensity);
			
			window.navigator.vibrate(vibrationPattern);
		}
	}
};
</script>

<style lang="postcss" scoped>
.cell-wrapper {
	--size: clamp(1.25rem, calc(var(--cell-size)), 4rem);
	width: var(--size);
	height: var(--size);
	@apply bg-truegray-200 dark:bg-gray-800 rounded-sm relative;
}
.cell-wrapper.locked {
	@apply bg-truegray-300 dark:bg-gray-700;
}
.cell-wrapper.incorrect {
	@apply bg-red-300 dark:bg-red-900;
}

.cell {
	@apply flex relative w-full h-full;
}

.cell-value {
	@apply m-auto inline-block text-gray-700;
	font-size: var(--cell-font-size);
	line-height: calc(var(--size) * 1.1);
}
.cell-wrapper.incorrect .cell-value {
	@apply text-red-900 dark:text-red-400;
}
</style>