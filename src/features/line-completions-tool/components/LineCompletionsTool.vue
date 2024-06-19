<template>
<main class="pt-4 gap-y-4 grid bleed-grid-4 v-grid-bleed text-sm">
	<div class="bg-white rounded-xl shadow-md shadow-black/5 w-full px-6 pt-2 pb-4">
		<form
			class="flex items-start flex-col justify-center"
			novalidate
			@submit.prevent="onSubmit($event as SubmitEvent)"
		>
			<label class="pr-3 pb-2 pt-2 py font-bold text-gray-600 tracking-wide w-full" for="lineInput">
				Input
			</label>
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
					title="A line with '1's, '0's, and '.'s only."
				>
				<BaseButton type="submit">Check</BaseButton>
			</div>

		</form>
		
	</div>

	<div class="bg-white rounded-xl shadow-md shadow-black/5 w-full px-6 pt-2 pb-4">
		<h3 class="pr-3 pb-2 pt-2 py font-bold text-gray-600 tracking-wide w-full">
			Details
		</h3>
		<LineCompletionsLineDetails
			:line="validatedLine"
		>
			<template #fallback><pre>&lt;no result&gt;</pre></template>
		</LineCompletionsLineDetails>
	</div>

	<div class="bg-white rounded-xl shadow-md shadow-black/5 w-full px-6 pt-2 pb-4">
		<h3 class="pr-3 pb-2 pt-2 py font-bold text-gray-600 tracking-wide w-full">
			Result
		</h3>
		<LineCompletionsCombinedResult
			:input="validatedLine"
			:result="resultingLine"
		>
			<template #invalid><pre>Invalid: no completions found</pre></template>
			<template #fallback><pre>&lt;no result&gt;</pre></template>
		</LineCompletionsCombinedResult>
	</div>

	<div class="bg-white rounded-xl shadow-md shadow-black/5 w-full px-6 pt-2 pb-4">
		<h3 class="pr-3 pb-2 pt-2 py font-bold text-gray-600 tracking-wide w-full">
			Valid line completions
		</h3>
		<LineCompletionsValidCompletions
			:input="validatedLine"
			:completions="completions"
			:result="resultingLine"
		>
			<template #invalid><pre>Invalid: no completions found</pre></template>
			<template #fallback><pre>&lt;no result&gt;</pre></template>
		</LineCompletionsValidCompletions>
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