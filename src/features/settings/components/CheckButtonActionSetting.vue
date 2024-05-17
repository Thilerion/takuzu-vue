<template>
<div>
	<h3>{{ $t('Settings.assistance.check-button-action') }}</h3>
	<div	
		class="text-xs text-gray-500 dark:text-slate-400"
	>{{ $t('Settings.assistance.check-button-description') }}</div>
	<select v-model="checkButton" class="block w-full mt-2">
		<option :value="checkButtonOptions.DISABLED">{{ $t('disabled') }}</option>
		<option :value="checkButtonOptions.RULE_VIOLATIONS">{{ $t('Game.mistake.rule-violation', 2) }}</option>
		<option :value="checkButtonOptions.INCORRECT_VALUES">{{ $t('Game.mistake.incorrect-value', 2) }}</option>
	</select>
</div>
</template>

<script setup lang="ts">
import { CheckButtonOption as checkButtonOptions } from '../options.js';
import type { CheckButtonOption } from '../types.js';

const checkButton = defineModel<CheckButtonOption>({ required: true });
</script>

