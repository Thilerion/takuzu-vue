<template>
<PuzzleHintBase
	v-show="show"
	:step="stepIdx"
	@hide="$emit('hide')"
>
	<template #title>{{ $t(title, title) }}<span v-if="subtitle" class="mr-[0.5ch]">:</span><small v-if="subtitle" class="text-sm opacity-80">{{ $t(subtitle, subtitle) }}</small></template>
	<template #message>{{ stepMessage }}</template>
	<template #buttons>
		<button
			:disabled="isFirstStep"
			class="text-sm text-slate-700 bg-white dark:bg-slate-50/10 dark:text-slate-50 border-r dark:border-slate-500 min-w-fit w-24 py-1 flex-grow max-w-[27%] disabled:text-slate-400 disabled:bg-slate-50 dark:disabled:text-slate-300 dark:disabled:bg-slate-500/10"
			@click="prevStep"
		><span class="mr-[1ch]">&#x3C;</span>{{ t('Hints.common.actionLabel.back') }}</button>
		<div class="flex-1">
			<!-- Space for secondary actions, or [Learn more] button, etc -->
		</div>
		<button
			class="text-sm flex-grow text-slate-700 bg-white dark:bg-slate-50/10 dark:text-slate-50 border-l dark:border-slate-500 min-w-fit w-24 py-1 max-w-[27%]"
			@click="onAction"
		><transition name="stepchange" mode="out-in"><span :key="stepIdx">{{ primaryActionLabel }}<span v-if="!isFinalStep" class="ml-[1ch]">&#x3E;</span></span></transition></button>
	</template>
</PuzzleHintBase>
</template>

<script setup lang="ts">
import { computed, toRef, watch } from 'vue';
import { useStepThroughSteppedHint } from '@/features/hints/composables/step-through.js';
import { useDynamicPuzzleSymbolString } from '@/components/dynamic-symbols/useDynamicPuzzleSymbolString.js';
import { injectCellThemeData } from '@/components/gameboard/composables/useCellThemeProvider.js';
import { useSteppedHintMessage } from '@/features/hints/composables/stepped-hint-message.js';
import { useI18n } from 'vue-i18n';
import type { SteppedHint } from '@/features/hints/services/SteppedHint/types.js';

const emit = defineEmits<{
	(e: 'hide'): void;
	(e: 'done'): void;
}>();
const props = defineProps<{
	hint: SteppedHint,
	show: boolean,
}>()
const hint = toRef(props, 'hint');

const { stepIdx, curStep, isFirstStep, isFinalStep, nextStep, prevStep, resetStep, stepEvents } = useStepThroughSteppedHint(
	hint
);

const themeData = injectCellThemeData();
const { $p } = useDynamicPuzzleSymbolString(themeData.theme, themeData.type);

const { t } = useI18n();
const { message } = useSteppedHintMessage(hint, stepIdx, $p);

const stepMessage = computed((): string => {
	if (message.value != null && typeof message.value === 'string') {
		return message.value;
	} else if (message.value != null) {
		return t(message.value.messageKey, message.value.namedProperties ?? {})
	}
	console.error('UseSteppedHintMessage gave no message.');
	return '';
})

const primaryActionLabel = computed((): string => {
	const rawLabel = curStep.value.actionLabel;

	switch (rawLabel) {
		case 'apply': return t('Hints.common.actionLabel.apply', rawLabel);
		case 'locate': return t('Hints.common.actionLabel.locate', rawLabel);
		case 'execute': return t('Hints.common.actionLabel.execute', rawLabel);
		case 'fix': return t('Hints.common.actionLabel.fix', rawLabel);
		case 'next': return t('Hints.common.actionLabel.next', rawLabel);
		default: {
			const x: never = rawLabel;
			console.error(`Unknown primary action label for stepped hint: ${x}`);
			return t('Hints.common.actionLabel.next', rawLabel);
		}
	}
})

const subtitle = computed((): string | null => {
	const type = hint.value.type;
	switch(type) {
		case 'triples': {
			const subtype = hint.value.subType;
			if (subtype === 'double') {
				return 'Hints.Triples.pair';
			} else if (subtype === 'sandwich') {
				return 'Hints.Triples.sandwich';
			} else {
				const x2: never = subtype;
				console.warn(`Unexpected triples hint subtype: ${x2}`);
				return null;
			}
		}
		case 'eliminationGeneric': {
			return 'Hints.EliminationGeneric.generic';
		}
		case 'duplicateLineGeneric': {
			return 'Hints.DuplicateLineGeneric.generic';
		}
		case 'incorrectValues':
		case 'noHintsFound':
		case 'balance': {
			return null;
		}
		default: {
			const x: never = type;
			console.warn(`Unexpected stepped hint type ${x}`);
			return null;
		}
	}
})
const title = computed(() => {
	const type = hint.value.type;
	switch(type) {
		case 'triples': {
			return 'Hints.Triples.name';
		}
		case 'balance': {
			return 'Hints.Balance.name';
		}
		case 'incorrectValues': {
			return 'Hints.IncorrectValues.name';
		}
		case 'eliminationGeneric': {
			return 'Hints.EliminationGeneric.name';
		}
		case 'duplicateLineGeneric': {
			return 'Hints.DuplicateLineGeneric.name';
		}
		case 'noHintsFound': {
			return 'Hints.NoHintsFound.name';
		}
		default: {
			const x: never = type;
			console.warn(`Unexpected stepped hint type ${x}`);
			return 'Hint';
		}
	}
})

const onAction = () => {
	if (isFinalStep.value) {
		stepEvents.value.onFinish();
		// reset step, so when the actions are undone, and the hint is shown again, we start again at the first step
		resetStep();
	} else {
		nextStep();
	}
}

watch(() => props.show, (val, prev) => {
	if (val && !prev) {
		stepEvents.value.onShow();
	} else if (!val && prev) {
		// if hidden, which can also happen with onFinish(), also trigger onHide()
		stepEvents.value.onHide();
	}
}, { immediate: true });
</script>