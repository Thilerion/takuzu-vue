<template>
	<component :is="el">
		<span>{{  label }}</span>
		<div class="flex flex-col gap-y-1">
			<slot name="examples"></slot>
		</div>
		<p
			v-if="$slots.explanation"
		><slot name="explanation"></slot></p>
	</component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	label?: string,
	el?: string
}>(), {
	label: 'Correct: ',
	el: 'li'
});
</script>

<style scoped>

</style>