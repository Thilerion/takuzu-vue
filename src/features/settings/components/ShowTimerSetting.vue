<template>
<div class="flex items-center">
	<InputToggle
		id="timerToggle"
		v-model="isEnabled"
		class="!m-0"
		small
	>{{ $t('Settings.show-timer') }}
	</InputToggle>
</div>
</template>
	
<script setup lang="ts">
const isEnabled = defineModel<boolean>({ required: true });
</script>