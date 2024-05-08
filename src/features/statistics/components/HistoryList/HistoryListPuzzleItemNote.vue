<template>
<div>
	<div
		v-if="isEditingCurrent || hasNote || placeholderWhileSavingNote"
		class="w-full flex items-end justify-start relative py-1 -ml-1"
	>
		<div class="relative w-full">
			<div
				class="text-xs text-gray-600 w-full border-0 p-0 m-0 leading-loose max-w-full text-ellipsis overflow-x-hidden"
				@click="startEditing"
			>
				<span v-if="placeholderWhileSavingNote">{{ placeholderWhileSavingNote }}</span>
				<span v-else-if="note">{{ note }}</span>
				<div v-else class="opacity-0">Enter note here</div>
			</div>

			<transition name="t-fade">
				<div
					v-if="isEditingCurrent"
					class="h-full absolute inset-y-0 -inset-x-2 pl-1 flex -mr-2 justify-between items-center"
				>
					<input
						ref="inputEl"
						v-model="unsavedNote"
						type="text"
						placeholder="Enter note here"
						class="w-full border-0 p-0 m-0 text-xs h-full focus:border-0 focus:outline-none ring-2 ring-slate-500/30 focus:ring-2 focus:ring-slate-500/50 leading-loose max-w-full pl-1 rounded-sm transition duration-150"
						@blur="saveNoteOnBlur"
						@keydown.enter="saveNote"
					>
				</div>
			</transition>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { useNoteEditing } from '@/features/statistics/composables/note-editing.js';
import { awaitRaf, awaitTimeout } from '@/utils/delay.utils.js';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
	note: string | undefined,
	id: number
}>();

const {
	isEditingNote,
	editingNoteId,
	startEditing: _startEditing,
	unsavedNote,
	saveUpdatedNote,
} = useNoteEditing();

const hasNote = computed(() => props.note != null);
const isEditingCurrent = computed(() => isEditingNote.value && editingNoteId.value === props.id);

const placeholderWhileSavingNote = ref<string | null>(null);
const saveNote = async () => {
	if (!isEditingCurrent.value) return;
	placeholderWhileSavingNote.value = unsavedNote.value;
	await saveUpdatedNote();
	placeholderWhileSavingNote.value = null;
}
const saveNoteOnBlur = async () => {
	await awaitTimeout(150);
	if (!isEditingCurrent.value) return;
	saveNote();
}

const inputEl = ref<HTMLInputElement | null>(null);

const startEditing = async () => {
	_startEditing(props.id);
	await awaitRaf();
	if (inputEl.value) {
		inputEl.value.focus();
	}
}

watch(isEditingCurrent, (val, prev) => {
	if (val && !prev) {
		awaitRaf().then(() => {
			inputEl.value?.focus();
		})
	}
})
</script>

<style scoped>
.t-fade-leave-active {
	transition: opacity 0.1s ease;
}
.t-fade-leave-to {
	opacity: 0;
}
</style>