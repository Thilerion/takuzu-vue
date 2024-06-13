<template>
<BaseDialog
	v-model="shown"
	class="backdrop:bg-black/30"
	content-classes="relative flex flex-col bg-white rounded shadow-lg text-gray-900 max-h-[70vh] backdrop:bg-black/30 p-0 w-full max-w-xl"
>
	<template #default="{ close }">
		<header class="flex items-center pr-0.5 pl-4 py-1 border-b bg-slate-50">
			<h2 class="font-medium">{{ $t('PuzzleEditor.import.title') }}</h2>
			<IconBtn class="ml-auto" @click="close">
				<icon-mdi-close />
			</IconBtn>
		</header>

		<div class="pt-3 px-4 pb-4">
			<input
				v-model="importString"
				type="text"
				class="w-full"
				:placeholder="$t('PuzzleEditor.import.placeholder')"
			>
			<div class="w-full flex justify-end mt-4 items-center">
				<div class="flex-1 leading-relaxed min-h-[1lh] text-red-700 tracking-wide">
					<span v-if="parseError">{{ parseError }}</span>
				</div>
				<BaseButton class="self-end" :disabled="!importString" @click="onLoad">{{ $t('PuzzleEditor.import.load') }}</BaseButton>
			</div>
		</div>
	</template>
</BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { importCustomPuzzleString, type ParsedCustomPuzzleString } from '@/features/puzzle-editor/services/string-conversions/import.js';
import { validateCustomPuzzleDimensions } from '../services/validate-dimensions.js';

const shown = defineModel<boolean>('show', { required: true });
const emit = defineEmits<{
	(e: 'parsed', v: ParsedCustomPuzzleString): void
}>();

const importString = ref('');
const parseError = ref<string | null>(null);

watch(importString, () => {
	if (parseError.value) {
		parseError.value = null;
	}
})

const onLoad = () => {
	const parseResult = importCustomPuzzleString(importString.value);
	if (!parseResult.success) {
		parseError.value = parseResult.error;
		return;
	}

	const dimValidatorResult = validateCustomPuzzleDimensions({
		width: parseResult.width,
		height: parseResult.height
	});
	if (!dimValidatorResult.valid) {
		parseError.value = 'Invalid dimensions';
		return;
	}

	importString.value = '';
	emit('parsed', parseResult);
}
</script>