<template>
<div>
	<h3>{{ $t('Settings.input-mode.label') }}</h3>
	<span class="text-xs inline-block leading-snug text-gray-500 dark:text-slate-400">{{ $t('Settings.input-mode.description') }}</span>

	<div class="mt-2">
		<label class="flex items-center">
			<input
				v-model="toggleMode"
				type="radio"
				name="radio-toggle-mode"
				value="0"
			>
			<i18n-t 
				keypath="Settings.input-mode.toggle-symbol-first"
				tag="span"
				class="ml-2"
				scope="global"
			>
				<template #symbol>
					<PuzzleSymbolDisplay :v="ZERO" />
				</template>
			</i18n-t>
			<span class="text-xs opacity-50 ml-2">({{ $t('default') }})</span>
		</label>
	</div>
	<div class="mt-2">
		<label class="flex items-center">
			<input
				v-model="toggleMode"
				type="radio"
				name="radio-toggle-mode"
				value="1"
			>
			<i18n-t 
				keypath="Settings.input-mode.toggle-symbol-first"
				tag="span"
				class="ml-2"
				scope="global"
			>
				<template #symbol>
					<PuzzleSymbolDisplay :v="ONE" />
				</template>
			</i18n-t>
		</label>
	</div>
</div>
</template>

<script setup lang="ts">
import { ONE, ZERO, type PuzzleSymbol } from '@/lib/constants.js';

const toggleMode = defineModel<PuzzleSymbol>({ required: true });
</script>