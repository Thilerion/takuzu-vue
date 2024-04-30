<template>
<div
	class="inline-flex min-w-max items-end justify-end"
>
	<IconBtn
		v-if="isEditing"
		class="text-xxs active:hover-none:bg-gray-300/20 text-gray-150/70"
		scale="0.875"
		@click="$emit('clear')"
	><icon-ic-baseline-close /></IconBtn>

	<IconBtn
		class="text-xxs active:hover-none:bg-gray-300/20 text-gray-150/70"
		scale="0.875"
		@click="saveOrEdit"
	>
		<icon-ic-check v-if="isEditing" />
		<icon-mdi-pencil v-else-if="!isEditing" />

	</IconBtn>
</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	isEditing: boolean
}>();
const emit = defineEmits<{
	save: [],
	clear: [],
	edit: []
}>();

const saveOrEdit = () => {
	if (props.isEditing) {
		emit('save');
	} else {
		emit('edit');
	}
}
</script>