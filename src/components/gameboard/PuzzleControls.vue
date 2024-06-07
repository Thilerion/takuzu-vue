<template>
<div class="control-btns">

	<div class="grid grid-flow-col mt-auto w-full gap-x-2 px-6 max-w-screen-sm mx-auto">
		<IconBtnText
			:disabled="!canUndo || paused"
			scale="1.125"
			icon="md-undo"
			vertical
			@click="$emit('undo')"
		>
			<template #default><span class="text-xs whitespace-normal">{{ $t('PlayPuzzle.controls.undo') }}</span></template>
			<template #icon>
				<icon-ic-baseline-undo />
			</template>
		</IconBtnText>

		<IconBtnText
			scale="1.125"
			icon="md-replay"
			vertical
			:disabled="!canRestart"
			@click="$emit('restart')"
		>
			<template #default><span class="text-xs">{{ $t('PlayPuzzle.controls.restart') }}</span></template>
			<template #icon>
				<icon-ic-baseline-replay />
			</template>
		</IconBtnText>

		<IconBtnText
			v-if="checkButtonEnabled"
			scale="1.125"
			icon="md-done"
			vertical
			:disabled="paused"
			@click="$emit('check')"
		>
			<template #default><span class="text-xs">{{ $t('PlayPuzzle.controls.check') }}</span></template>
			<template #icon>
				<icon-ic-baseline-done />
			</template>
		</IconBtnText>

		<IconBtnText
			scale="1.125"
			icon="his-light-bulb"
			vertical
			:disabled="paused"
			@click="$emit('get-hint')"
		>
			<template #default><span class="text-xs">{{ $t('PlayPuzzle.controls.hint') }}</span></template>
			<template #icon>
				<icon-his-light-bulb />
			</template>
		</IconBtnText>
	</div>
</div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { useSettingsStore } from '@/features/settings/store.js';

defineProps<{
	canUndo: boolean,
	canRestart: boolean,
	paused: boolean
}>();

const emit = defineEmits<{
	(e: 'undo'): void,
	(e: 'restart'): void,
	(e: 'check'): void,
	(e: 'get-hint'): void,
}>();

const settingsStore = useSettingsStore();
const checkButtonEnabled = toRef(settingsStore, 'checkButtonEnabled');
</script>

<style scoped>
[data-play-state="paused"] .control-btns, [data-play-state="finished"] .control-btns {
	@apply pointer-events-none text-gray-700/60 dark:text-slate-200/50;
}

.control-btns {
	@apply mt-auto w-full text-sm text-center bg-transparent;
	padding-bottom: max(env(safe-area-inset-bottom) + 4px, 0.5rem);
	padding-top: 0.25rem;
	box-shadow: 0 -12px 14px -16px rgba(0,0,0,.2);
	@apply dark:bg-gray-800 dark:bg-opacity-30;
	@apply text-gray-900/80 dark:text-slate-200/90;
}

.control-btns button {
	@apply text-xs flex-auto;
}
.control-btns > .grid {
	grid-auto-columns: 1fr;
}
</style>