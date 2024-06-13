<template>
<div>
	<h3 class="font-bold text-xs uppercase text-gray-600 ml-1 mb-1">{{ label }}</h3>
	<div class="max-w-full w-full min-w-0 min-h-14 flex items-center text-sm gap-x-2 pr-1 pl-4 py-2 bg-gray-100 rounded mb-2 relative">
		<p class="break-words font-mono min-w-0">{{ value }}</p>
		<BaseButton
			class="flex-initial ml-auto mr-2 mb-0.5 px-2 py-2 my-auto rounded border min-w-max w-24"
			@click="copyValue"
		>{{ copySuccess ? $t('PuzzleEditor.puzzle-strings.copy-success') : $t('PuzzleEditor.puzzle-strings.copy-btn-text') }}</BaseButton>
	</div>
</div>
</template>

<script setup lang="ts">
import { refAutoReset } from '@vueuse/core';

const props = defineProps<{
	value: string;
	label: string;
}>();

const copySuccess = refAutoReset(false, 4500);

const copyValue = async () => {
	try {
		await navigator.clipboard.writeText(props.value);
		copySuccess.value = true;
	} catch (e) {
		console.warn(e);
		copySuccess.value = false;
	}
}
</script>