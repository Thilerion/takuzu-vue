<template>
<div class="flex items-center">
	<InputToggle
		id="wakeLockToggle"
		v-model="isEnabled"
		class="!m-0"
		small
	>{{
		$t('Settings.wake-lock')
	}}</InputToggle>
</div>
</template>

<script setup lang="ts">
const isEnabled = defineModel<boolean>({ required: true });
</script>