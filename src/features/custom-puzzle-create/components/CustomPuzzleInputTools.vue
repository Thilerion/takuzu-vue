<template>
<div class="flex items-center gap-2">
	<BaseButton
		icon-only
		class="h-10 w-10 items-center flex"
		@click="$emit('rotate', 'cw')"
	>
		<icon-material-symbols-rotate-90-degrees-cw />
	</BaseButton>

	<BaseButton
		icon-only
		class="h-10 w-10 items-center flex"
		@click="$emit('rotate', 'ccw')"
	>
		<icon-material-symbols-rotate-90-degrees-ccw />
	</BaseButton>
	
	<BaseButton class="h-10 text-sm" @click="$emit('clear')">{{ $t('CustomPuzzleInput.tools.clear-board') }}</BaseButton>
</div>
</template>

<script setup lang="ts">

const emit = defineEmits<{
	(e: 'clear'): void;
	(e: 'rotate', v: 'cw' | 'ccw'): void;
}>();
</script>