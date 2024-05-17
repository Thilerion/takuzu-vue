<template>
<div>
	<h3>{{ $t('Settings.language') }}</h3>
	<div class="mt-2">
		<select v-model="language" class="block w-full mt-1">
			<option
				v-for="opt in SUPPORTED_LOCALES"
				:key="opt"
				:value="opt"
			>{{ localeSettings[opt] }}
			</option>
		</select>
	</div>
</div>
</template>

<script setup lang="ts">
import { SUPPORTED_LOCALES, localeSettings, type SupportedLocale } from '@/i18n/constants.js';

const language = defineModel<SupportedLocale>({ required: true });
</script>