<template>
<BaseDialog
	v-model="shown"
	class="backdrop:bg-black/30"
	content-classes="relative flex flex-col bg-white rounded shadow-lg text-gray-900 max-h-[70vh] backdrop:bg-black/30 p-0 w-full max-w-xl"
>
	<template #default="{ close }">
		<header class="flex items-center pr-0.5 pl-4 py-1 border-b bg-slate-50">
			<label for="import-puzzle-textarea" class="font-medium">{{ $t('PuzzleEditor.import.title') }}</label>
			<IconBtn class="ml-auto" @click="close">
				<icon-mdi-close />
			</IconBtn>
		</header>

		<form class="pt-3 px-2 sm:px-4 pb-4" @submit.prevent="onLoad">
			<InputTextArea
				id="import-puzzle-textarea"
				v-model="importString"
				class="w-full text-sm"
				autocomplete="off"
				autofocus
				rows="3"
				:placeholder="$t('PuzzleEditor.import.placeholder', ['5d5a1p', '4x4;1....0.1...1.01'])"
			/>
			<p
				class="my-1 text-xs text-gray-600 tracking-wide"
			>{{ $t('PuzzleEditor.import.inline-help-text') }}</p>

			<div class="w-full flex justify-end mt-4 items-center">
				<div class="flex-1 text-xs min-h-[1lh] text-red-700 tracking-wide">
					<span v-if="parseError">{{ parseError }}</span>
				</div>
				<BaseButton
					type="submit"
					class="self-end"
					:disabled="!importString"
				>{{ $t('PuzzleEditor.import.load') }}</BaseButton>
			</div>
		</form>
	</template>
</BaseDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { importCustomPuzzleString, type ParsedCustomPuzzleString, type CustomPuzzleStringParserError } from '@/features/puzzle-editor/services/string-conversions/import.js';
import { validateCustomPuzzleDimensions } from '../services/validate-dimensions.js';
import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();
const setParseError = (errKey: CustomPuzzleStringParserError['error'] | 'Invalid dimensions' | null) => {
	if (errKey == null) {
		parseError.value = null;
		return;
	}

	switch(errKey) {
		case 'Invalid dimensions': {
			const value = t('PuzzleEditor.import.error.invalid-dimensions');
			parseError.value = value;
			return;
		}
		case 'Generic: Invalid string': {
			const value = t('PuzzleEditor.import.error.invalid-string-generic');
			parseError.value = value;
			return;
		}
		case 'RLE error': {
			const value = t('PuzzleEditor.import.error.rle-error');
			parseError.value = value;
			return;
		}
		default: {
			const x: never = errKey;
			console.warn('Unknown error key', x);
			const value = t('PuzzleEditor.import.error.unknown-generic');
			parseError.value = value;
			return;
		}
	}
}

const onLoad = () => {
	const parseResult = importCustomPuzzleString(importString.value);
	if (!parseResult.success) {
		const errKey = parseResult.error;
		return setParseError(errKey);
	}

	const dimValidatorResult = validateCustomPuzzleDimensions({
		width: parseResult.width,
		height: parseResult.height
	});
	if (!dimValidatorResult.valid) {
		return setParseError('Invalid dimensions');
	} else {
		setParseError(null);
	}

	importString.value = '';
	emit('parsed', parseResult);
}
</script>