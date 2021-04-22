<template>
	<div class="mt-2 flex items-center">
		<label class="flex items-center cell-theme-box" :class="{selected: cellTheme === 'binary'}">
			<div class="example cell-theme-01">
				<div class="zero">0</div>
				<div class="one">1</div>
			</div>
			<input
				class="radio"
				type="radio"
				name="radio-cell-theme"
				v-model="cellTheme"
				value="binary"
			>
			<span
				class="label"
			>Binary</span>
		</label>
		<label class="flex items-center cell-theme-box" :class="{selected: cellTheme === 'tictactoe'}">
			<input
				class="radio"
				type="radio"
				name="radio-cell-theme"
				v-model="cellTheme"
				value="tictactoe"
			>
			<span
				class="label"
			>Tic-tac-toe</span>
			<div class="example cell-theme-OX">
				<div class="zero">O</div>
				<div class="one">X</div>
			</div>
		</label>
		<label class="flex items-center cell-theme-box" :class="{selected: cellTheme === 'colored'}">
			<input
				class="radio"
				type="radio"
				name="radio-cell-theme"
				v-model="cellTheme"
				value="colored"
			>
			<span
				class="label"
			>Colored</span>
			<div class="example cell-theme-colored">
				<div class="zero"></div>
				<div class="one"></div>
			</div>
		</label>
	</div>
</template>

<script>
export default {
	props: {
		modelValue: {
			type: String,
			required: true
		}
	},
	emits: ['update:modelValue'],
	data() {
		return {
			cellThemeOptions: [
				{ label: 'Binary', value: 'binary' },
				{ label: 'Tic-tac-toe', value: 'tictactoe' },
				{ label: 'Colored', value: 'colored' },
			],
		}
	},
	computed: {
		cellTheme: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit('update:modelValue', value);
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
.cell-theme-box {
	grid-template-areas: "cell cell"
						"radio label";
	grid-template-rows: auto 2rem;
	grid-template-columns: 2rem auto;
	@apply rounded bg-white ring-1 ring-gray-400 ring-opacity-40 grid items-center justify-items-stretch mr-2 px-0 pt-2 flex-1;
	row-gap: 0.25rem;
}
.cell-theme-box.selected {
	@apply ring-2 ring-blue-800 ring-opacity-60;
}
.cell-theme-box:not(.selected) {
	@apply bg-opacity-50 text-gray-500;
}

.cell-theme-box > .example {
	grid-area: cell;
	@apply flex mx-auto;
}
.example > .one, .example > .zero {
	@apply w-6 h-6 justify-center items-center text-center my-1 rounded bg-gray-50 overflow-hidden;
}
.zero {
	@apply border mr-1;
}
.one {
	@apply border;
}

.cell-theme-box > .radio {
	grid-area: radio;
	@apply mx-auto focus:outline-none;
	box-shadow: none!important;
}
.cell-theme-box > .label {
	grid-area: label;
	@apply text-xs text-gray-800 mr-2;
}

.cell-theme-01 {
	@apply font-number;
}
.cell-theme-OX {
	@apply font-sans font-bold;
}
.cell-theme-colored {
	@apply text-transparent;
}
.cell-theme-colored .one {
	@apply dark:bg-one-dark bg-one-primary border-0;
}
.cell-theme-colored .zero {
	@apply dark:bg-zero-dark bg-zero-primary border-0;
}
</style>