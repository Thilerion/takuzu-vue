<template>
<div class="editor-tools">
	<div class="min-w-fit pr-2 flex-none toggle-input text-xs">
		<InputToggle
			id="toggle-input-mode-input"
			v-model="toggleInputMode"
			small
		>Use toggle input mode</InputToggle>
		<InputToggle
			id="show-solution-input"
			v-model="showSolution"
			small
		>Show solution</InputToggle>
	</div>
	<div class="btns flex gap-2 w-fit ml-auto">
		<BaseButton
			icon-only
			class="h-8 w-8 items-center flex flex-none rotate-cw-btn text-xs"
			@click="$emit('rotate', 'cw')"
		>
			<icon-material-symbols-rotate-90-degrees-cw />
		</BaseButton>

		<BaseButton
			icon-only
			class="h-8 w-8 items-center flex flex-none rotate-ccw-btn text-xs"
			@click="$emit('rotate', 'ccw')"
		>
			<icon-material-symbols-rotate-90-degrees-ccw />
		</BaseButton>
		
		<BaseButton class="h-8 text-xs flex-none clear-btn" @click="$emit('clear')">{{ $t('PuzzleEditor.tools.clear-board') }}</BaseButton>
	</div>
</div>
</template>

<script setup lang="ts">

const emit = defineEmits<{
	(e: 'clear'): void;
	(e: 'rotate', v: 'cw' | 'ccw'): void;
}>();

const toggleInputMode = defineModel<boolean>('toggleInputMode', { required: true });
const showSolution = defineModel<boolean>('showSolution', { required: true });
</script>

<style scoped>
.editor-tools {
	@apply flex items-center gap-2 w-full flex-wrap max-w-full;
}
</style>