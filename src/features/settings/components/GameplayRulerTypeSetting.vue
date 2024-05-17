<template>
<div>
	<h3>{{ $t('Settings.rulers.board-rulers') }}</h3>
	<div class="text-xs text-gray-500 dark:text-slate-400">{{
		$t('Settings.rulers.description-choose-the-information-displayed-within') }}</div>
	<div class="mt-2">
		<select v-model="rulerTypeModel" class="block w-full mt-1">
			<option
				v-for="opt in rulerTypeOptions"
				:key="opt.value"
				:value="opt.value"
			>{{ opt.label }}
			</option>
		</select>
	</div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RulerType } from '../types.js';
import { rulerType } from '../options.js';

const rulerTypeModel = defineModel<RulerType>({ required: true });

const { t } = useI18n();
const rulerTypeOptions = computed(() => [
	{ label: t('disabled'), value: rulerType.NONE },
	{ label: t('Settings.rulers.line-coordinates'), value: rulerType.COORDS },
	{ label: t('Settings.rulers.remaining-values-in-line'), value: rulerType.COUNT_REMAINING },
	{ label: t('Settings.rulers.current-values-in-line'), value: rulerType.COUNT_CURRENT }
])
</script>