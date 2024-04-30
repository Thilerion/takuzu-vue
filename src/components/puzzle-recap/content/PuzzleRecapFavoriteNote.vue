<template>
<div class="flex w-full pl-0 items-center justify-end">
	<div class="text-white flex-1 h-full">
		<input
			v-if="isEditing"
			ref="inputEl"
			v-model="unsavedNote"
			type="text"
			class="w-full self-center p-0 m-0 text-sm placeholder:text-white/50 rounded px-2 py-1 h-full border-0 focus:ring-2 ring-2 ring-white/20 focus:outline-none focus:ring-white/70 bg-slate-900/20 focus:bg-slate-900/70 transition"
			:placeholder="$t('Recap.set-note')"
			@keydown.enter="saveNote"
			@blur="saveNoteOnBlur"
		>
		<div v-else-if="note != null" class="w-full h-full px-2 py-1 border-0 rounded-t opacity-70">{{ note }}</div>
	</div>

	<PuzzleRecapNoteControls
		:is-editing="isEditing"
		@save="saveNote"
		@clear="clearNote"
		@edit="startEditing"
	/>

</div>
</template>

<script setup lang="ts">
import { awaitImmediate } from '@/utils/delay.utils';
import { nextTick, onBeforeMount, ref } from 'vue';

const props = defineProps<{
	favorite: boolean,
	note?: string | null | undefined
}>();
const emit = defineEmits<{
	(e: 'save-note', note: string | null | undefined): void
}>();
const inputEl = ref<HTMLInputElement | undefined>();

const isEditing = ref(false);
const startEditing = () => {
	isEditing.value = true;
	nextTick(() => {
		inputEl.value?.focus();
	})
}
const clearNote = () => {
	isEditing.value = false;
	unsavedNote.value = '';
	saveNote();
}

const unsavedNote = ref('');

onBeforeMount(() => {
	if (props.note != null) {
		unsavedNote.value = props.note;
	}
})

const saveNote = () => {
	if (isEditing.value === false) return;
	isEditing.value = false;
	if (unsavedNote.value === props.note) {
		return;
	}
	if (unsavedNote.value) {
		emit('save-note', unsavedNote.value);
	} else {
		emit('save-note', undefined);
	}
}
const saveNoteOnBlur = async () => {
	// wait a bit, in case blurred because "clear" button was clicked
	await awaitImmediate();
	saveNote();
}
</script>