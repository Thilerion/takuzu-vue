<template>
	<div class="puzzle-controls">
		<div class="control-btns">

			<IconBtnText
				@click="$emit('undo')"
				:disabled="!canUndo || paused"
				scale="1.25"
				icon="md-undo"
				vertical
			>
				<template v-slot:default>Undo</template>
				<template v-slot:icon>
					<icon-ic-baseline-undo/>
				</template>
			</IconBtnText>

			<IconBtnText
				@click="$emit('restart')"
				scale="1.25"
				icon="md-replay"
				vertical
				:disabled="!canUndo || paused"
			>
				<template v-slot:default>Restart</template>
				<template v-slot:icon>
					<icon-ic-baseline-replay/>
				</template>
			</IconBtnText>

			<IconBtnText
				scale="1.25"
				icon="md-done"
				vertical
				@click="$emit('check')"
				v-if="checkButtonEnabled"
				:disabled="paused"
			>
				<template v-slot:default>Check</template>
				<template v-slot:icon>
					<icon-ic-baseline-done/>
				</template>
			</IconBtnText>

			<IconBtnText
				scale="1.25"
				icon="his-light-bulb"
				vertical
				@click="$emit('get-hint')"
				:disabled="paused"
			>
				<template v-slot:default>Hint</template>
				<template v-slot:icon>
					<icon-his-light-bulb/>
				</template>
			</IconBtnText>

		</div>
	</div>
</template>

<script>
import { useSettingsStore } from '@/stores/settings.js';
import { computed, watchEffect } from 'vue';

export default {
	emits: ['undo', 'restart', 'check', 'get-hint'],
	props: {
		canUndo: Boolean,
		board: {
			type: Object,
			// required: true,
		},
		paused: Boolean,
	},
	setup() {
		const settingsStore = useSettingsStore();
		const checkButtonEnabled = computed(() => settingsStore.checkButton !== 'disabled');
		return { checkButtonEnabled };
	},
};
</script>

<style scoped>
.puzzle-controls {
	@apply flex-none flex text-sm text-center h-full overflow-hidden;
	
	@apply bg-none dark:bg-gray-800 dark:bg-opacity-30;
	@apply text-gray-900/80 dark:text-white/90;
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