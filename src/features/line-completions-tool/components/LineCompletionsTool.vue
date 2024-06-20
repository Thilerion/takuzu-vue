<template>
<main class="pt-4 gap-y-6 grid bleed-grid-4 v-grid-bleed text-sm max-w-xl w-full mx-auto">
	<div class="bg-white rounded-xl shadow-md shadow-black/5 w-full px-6 pt-2 pb-4">
		<form
			class="flex items-start flex-col justify-center"
			novalidate
			@submit.prevent="onSubmit($event as SubmitEvent)"
		>
			<label class="pr-3 pb-2 pt-2 py font-bold text-gray-600 tracking-wide w-full" for="lineInput">{{ $t('LineAnalysisTool.input') }}</label>
			<div class="flex w-full gap-x-2">
				<input
					id="lineInput"
					ref="inputEl"
					v-model="lineInput"
					type="text"
					name="lineInput"
					class="flex-1 max-w-sm font-mono"
					required
					minlength="4"
					maxlength="20"
					pattern="[10.x_ \-]+"
					autocomplete="off"
					:title="$t('LineAnalysisTool.line-input-title-hint')"
				>
				<BaseButton type="submit">{{ $t('LineAnalysisTool.input-btn-label') }}</BaseButton>
			</div>

		</form>
		
	</div>

	<div>
		<BasicListHeader>{{ $t('LineAnalysisTool.details.title') }}</BasicListHeader>
		<BasicLinkList class="px-6 py-4 flex flex-col">
			<LineCompletionsLineDetails
				:line="validatedLine"
			>
				<template #fallback><LineCompletionsBlockFallbackSlot /></template>
			</LineCompletionsLineDetails>
		</BasicLinkList>
	</div>

	<div>
		<BasicListHeader>{{ $t('LineAnalysisTool.results.title') }}</BasicListHeader>
		<BasicLinkList class="px-6 py-4 flex flex-col">
			
			<LineCompletionsCombinedResult
				:input="validatedLine"
				:result="resultingLine"
			>
				<template #invalid><LineCompletionsBlockInvalidSlot /></template>
				<template #fallback><LineCompletionsBlockFallbackSlot /></template>
			</LineCompletionsCombinedResult>
		</BasicLinkList>
	</div>

	<div>
		<BasicListHeader>{{ $t('LineAnalysisTool.valid-line-completions') }}</BasicListHeader>
		<BasicLinkList class="px-6 py-4 flex flex-col">
			
			<LineCompletionsValidCompletions
				:input="validatedLine"
				:completions="completions"
				:result="resultingLine"
			>
				<template #invalid><LineCompletionsBlockInvalidSlot /></template>
				<template #fallback><LineCompletionsBlockFallbackSlot /></template>
			</LineCompletionsValidCompletions>
		</BasicLinkList>
	</div>
</main>
</template>

<script setup lang="ts">
import { isPuzzleValueLineStr } from '@/lib/utils/puzzle-line.utils.js';
import { ref } from 'vue';
import { useValidLineCompletions } from '../composables/valid-line-completions.js';
import type { PuzzleValueLineStr } from '@/lib/types.js';

const lineInput = ref('');
const validatedLine = ref<null | PuzzleValueLineStr>(null);

const { completions, resultingLine } = useValidLineCompletions(validatedLine);

const inputEl = ref<HTMLInputElement | null>(null);
const onSubmit = (e: SubmitEvent) => {
	const validity = (e.target as HTMLFormElement).checkValidity();

	if (!validity) {
		validatedLine.value = null;
		(e.target as HTMLFormElement).reportValidity();
		return;
	}

	const value = lineInput.value;
	// Replace characters [x_ \-] with a period
	const cleanedValue = value.replace(/[x_ -]/g, '.');
	lineInput.value = cleanedValue;
	// check if valid input html
	if (isPuzzleValueLineStr(cleanedValue)) {
		validatedLine.value = cleanedValue;
	} else {
		validatedLine.value = null;
	}
}
</script>