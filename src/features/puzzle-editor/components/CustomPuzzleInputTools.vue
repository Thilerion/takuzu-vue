<template>
<div class="flex items-center gap-2 w-full">
	<div class="w-fit pr-2 mr-auto flex-none">
		<InputToggle
			id="toggle-input-mode-input"
			v-model="toggleInputMode"
			small
		>Use toggle input mode</InputToggle>
	</div>	
	<BaseButton
		icon-only
		class="h-10 w-10 items-center flex flex-none"
		@click="$emit('rotate', 'cw')"
	>
		<icon-material-symbols-rotate-90-degrees-cw />
	</BaseButton>

	<BaseButton
		icon-only
		class="h-10 w-10 items-center flex flex-none"
		@click="$emit('rotate', 'ccw')"
	>
		<icon-material-symbols-rotate-90-degrees-ccw />
	</BaseButton>
	
	<BaseButton class="h-10 text-sm flex-none" @click="$emit('clear')">{{ $t('PuzzleEditor.tools.clear-board') }}</BaseButton>
</div>
</template>

<script setup lang="ts">

const emit = defineEmits<{
	(e: 'clear'): void;
	(e: 'rotate', v: 'cw' | 'ccw'): void;
}>();

const toggleInputMode = defineModel<boolean>('toggleInputMode', { required: true });
</script>