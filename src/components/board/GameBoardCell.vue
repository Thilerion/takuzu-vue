<template>
	<div
		class="cell-wrapper select-none pointer-events-auto"
		:class="[
			{
				'locked': isLocked,
				'incorrect': isIncorrectValue,
				'is-active': isActive,
				'last-active-cell': cellId === lastCellId
			},
			cellThemeClass,
		]"
		:style="{
			'--click-anim-dur': '.05s',
		}"
		ref="cell"
	>

		<GameBoardCellValue
			class="cell pointer-events-none"
			:theme="cellTheme"
			:value="value"
		/>
	</div>
</template>

<script>
import { lengthToPwmPattern } from '../../services/vibration';
import { LONG_TOUCH_DURATION } from './config';
import GameBoardCellValue from './GameBoardCellValue';

export default {
	components: {
		GameBoardCellValue
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
		},
		active: Boolean,
	},
	data() {
		return {
			touchTimer: null,
		}
	},
	computed: {
		isActive() {
			return this.active;
		},
		cellId() {
			return `${this.x},${this.y}`;
		},
		lastCellId() {
			const lastCell = this.$store.getters.lastCell;
			if (lastCell == null) return null;
			return lastCell.cellId;
		},
		isLocked() {
			return this.$store.getters.lockedCells.includes(this.cellId);
		},
		incorrectValues() {
			return this.$store.getters['gameCheck/markedIncorrectValues'];
		},
		isIncorrectValue() {
			return this.incorrectValues && this.incorrectValues.includes(this.cellId);
		},
		vibrateOnTap() {
			return this.$store.getters['settings/gameVibrationEnabled'];
		},
		vibrationIntensity() {
			return this.$store.state.settings.vibrationIntensity;
		},

		cellTheme() {
			return this.$store.state.settings.cellTheme;
		},
		// TODO: cell theme class maybe on Board.vue?
		cellThemeClass() {
			let themeClass = 'cell-theme-';
			if (this.cellTheme === 'binary') return themeClass + '01';
			if (this.cellTheme === 'tictactoe') return themeClass + 'OX';
			if (this.cellTheme === 'colored') return themeClass + 'color';
			return null;
		},
	},
	methods: {
		emitClick(long = false) {
			const payload = { value: this.value, x: this.x, y: this.y, longTouch: long };
			this.$emit('clicked', payload);
		},
		clickedCell() {
			if (this.isLocked) return;
			this.emitClick(false);
		},
		emitCellChange(long = false) {
			if (this.isLocked) return;
			this.emitClick(long);
		},
		touchedCell() {
			if (this.isLocked) return;

			this.touchTimer = setTimeout(() => {
				this.$refs.cell.removeEventListener('touchend', this.touchEnd);
				this.emitCellChange(true);
				this.vibrate(true);
			}, LONG_TOUCH_DURATION);
			this.$refs.cell.addEventListener('touchend', this.touchEnd);
		},
		touchEnd() {
			clearTimeout(this.touchTimer);
			this.emitCellChange(false);
			this.vibrate(false);
		},
		vibrate(long = false) {
			if (!this.vibrateOnTap) return;
			const length = long ? 140 : 40;

			const vibrationPattern = lengthToPwmPattern(length, this.vibrationIntensity);	
			window.navigator.vibrate(vibrationPattern);
		},
	},
};
</script>

<style lang="postcss" scoped>
.cell-wrapper {
	--size: clamp(1.25rem, calc(var(--cell-size)), 6rem);
	width: var(--size);
	height: var(--size);
	@apply bg-truegray-200 dark:bg-gray-800 rounded-sm cursor-pointer relative overflow-hidden;
	touch-action: none;
}
.cell-wrapper.locked {
	@apply bg-truegray-300 dark:bg-gray-700 cursor-default;
}
.cell-wrapper.incorrect {
	@apply bg-red-300 dark:bg-red-900;
}

/* click animation ring */
.cell-wrapper {
	transition: box-shadow var(--click-anim-dur, .4s) cubic-bezier(1, 0, 0, 1);
	@apply ring-0 ring-black ring-opacity-50;
}
.cell-wrapper.is-active {
	transition: none;
	@apply ring-2 ring-opacity-50;
}
.cell-wrapper.last-active-cell, .cell-wrapper.is-active {
	@apply z-20;
}

.cell {
	@apply flex relative w-full h-full overflow-hidden;
}
.cell-wrapper.incorrect .cell-value {
	@apply text-red-900 dark:text-red-400;
}
</style>