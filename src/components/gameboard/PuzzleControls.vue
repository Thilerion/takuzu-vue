<template>
	<div class="puzzle-controls">
		<div class="control-btns">

			<IconBtnText
				@click="$emit('undo')"
				:disabled="!canUndo || paused"
				size="26"
				icon="undo"
				vertical
			>Undo</IconBtnText>

			<IconBtnText
				@click="$emit('restart')"
				size="26"
				icon="replay"
				vertical
				:disabled="!canUndo || paused"
			>Restart</IconBtnText>

			<IconBtnText
				size="26"
				icon="done"
				vertical
				@click="$emit('check')"
				v-if="checkButtonEnabled"
				:disabled="paused"
			>Check</IconBtnText>

			<IconBtnText
				size="26"
				icon="emoji_objects"
				vertical
				@click="$emit('get-hint')"
				:disabled="paused"
			>Hint</IconBtnText>

		</div>
	</div>
</template>

<script>
import IconBtnText from '@/components/base-layout/IconBtnText';

export default {
	components: {
		IconBtnText,
	},
	emits: ['undo', 'restart', 'check', 'get-hint'],
	props: {
		canUndo: Boolean,
		board: {
			type: Object,
			// required: true,
		},
		paused: Boolean,
	},
	computed: {
		// settings
		checkButtonEnabled() {
			return this.$store.state.settings.checkButton !== 'disabled';
		},
	},
};
</script>

<style lang="postcss" scoped>
.puzzle-controls {
	@apply flex-none flex text-sm text-center h-24 overflow-hidden;
	
	@apply bg-none dark:bg-gray-800 dark:bg-opacity-30;
	@apply text-gray-900 text-opacity-80 dark:text-white dark:text-opacity-80;
}
.puzzle-paused .puzzle-controls, .puzzle-finished .puzzle-controls {
	@apply pointer-events-none;
}

.control-btns {
	@apply h-20;
	@apply flex flex-row items-center justify-center mt-auto w-full space-x-2 px-6;
	box-shadow: 0 -12px 14px -16px rgba(0,0,0,.2);
}
.control-btns > * {
	@apply text-xs flex-auto;
}
</style>