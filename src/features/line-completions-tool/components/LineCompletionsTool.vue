<template>
<FullWidthCardLayout class="text-sm max-w-xl mx-auto">
	<FullWidthCardBlock>
		<FullWidthCardContent>
			<form
				class="flex items-start flex-col justify-center"
				novalidate
				@submit.prevent="onSubmit($event as SubmitEvent)"
			>
				<FullWidthCardHeading
					tag="label"
					class="pr-3 pb-1 font-bold text-gray-600 tracking-wide w-full"
					for="lineInput"
				>{{ $t('LineAnalysisTool.input') }}</FullWidthCardHeading>
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
		</FullWidthCardContent>
	</FullWidthCardBlock>

	<FullWidthCardBlock>
		<template #heading>
			<FullWidthCardHeading>{{ $t('LineAnalysisTool.details.title') }}</FullWidthCardHeading>
		</template>
		<FullWidthCardContent>
			<LineCompletionsLineDetails
				:line="validatedLine"
			>
				<template #fallback><LineCompletionsBlockFallbackSlot /></template>
			</LineCompletionsLineDetails>
		</FullWidthCardContent>
	</FullWidthCardBlock>

	<FullWidthCardBlock>
		<template #heading>
			<FullWidthCardHeading>{{ $t('LineAnalysisTool.results.title') }}</FullWidthCardHeading>
		</template>
		<FullWidthCardContent>
			<LineCompletionsCombinedResult
				:input="validatedLine"
				:result="resultingLine"
			>
				<template #invalid><LineCompletionsBlockInvalidSlot /></template>
				<template #fallback><LineCompletionsBlockFallbackSlot /></template>
			</LineCompletionsCombinedResult>
		</FullWidthCardContent>
	</FullWidthCardBlock>

	<FullWidthCardBlock>
		<template #heading>
			<FullWidthCardHeading>{{ $t('LineAnalysisTool.valid-line-completions') }}</FullWidthCardHeading>
		</template>
		<FullWidthCardContent>
			<LineCompletionsValidCompletions
				:input="validatedLine"
				:completions="completions"
				:result="resultingLine"
			>
				<template #invalid><LineCompletionsBlockInvalidSlot /></template>
				<template #fallback><LineCompletionsBlockFallbackSlot /></template>
			</LineCompletionsValidCompletions>
		</FullWidthCardContent>
	</FullWidthCardBlock>
</FullWidthCardLayout>
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