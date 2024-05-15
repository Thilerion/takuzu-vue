<template>
<div>
	<div
		v-if="isEditing || displayedNote != null"
		class="w-full flex items-end justify-start relative py-1 -ml-1"
	>
		<div class="h-6 relative w-full">
			<div
				v-if="!isEditing"
				class="text-xs text-gray-600 dark:text-slate-100 w-full border-0 p-0 m-0 leading-loose max-w-full text-ellipsis overflow-x-hidden"
				@click="startEditing"
			>
				<span v-if="displayedNote">{{ displayedNote }}</span>
				<div v-else class="opacity-0">Enter note here</div>
			</div>

			<transition name="t-fade">
				<div
					v-if="isEditing"
					class="h-full absolute inset-y-0 -inset-x-2 pl-2 flex -mr-2 justify-between items-center"
				>
					<input
						ref="inputEl"
						v-model="unsavedNote"
						type="text"
						placeholder="Enter note here"
						class="flex-1 border-0 py-0 px-1 m-0 text-xs h-full focus:border-0 focus:outline-none ring-2 ring-slate-500/30 focus:ring-2 focus:ring-slate-500/50 leading-loose max-w-full rounded-sm transition duration-150 dark:bg-slate-600 dark:text-slate-200 dark:placeholder:text-slate-300"
						@blur="saveNoteOnBlur"
						@keydown.enter="saveNote"
					>
					<IconBtn
						class="text-xxs active:hover-none:bg-gray-300/20 text-gray-800/70 dark:text-slate-200 h-8 w-8 flex-shrink-0 ml-1"
						scale="0.875"
						@click="clearNote"
					><icon-ic-baseline-close /></IconBtn>
				</div>
			</transition>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { awaitRaf, awaitTimeout } from '@/utils/delay.utils.js';
import { computed, nextTick, ref, watch } from 'vue';
import { useStatisticsNextStore } from '../../store.js';

const props = defineProps<{
	note: string | undefined,
	id: number
}>();

const isEditing = defineModel<boolean>('editing', { required: true });
const unsavedNote = ref('');

const statsNextStore = useStatisticsNextStore();

const saveUpdatedNote = async () => {
	const trimmed = unsavedNote.value.trim();
	if (trimmed === "") {
		// Remove note if unsaved value is empty
		console.log('removing note', { trimmed });
		await statsNextStore.updateNote(props.id, undefined);
	} else if (trimmed !== props.note) {
		console.log('updating note', { trimmed });
		await statsNextStore.updateNote(props.id, trimmed);
	} else {
		console.log('note unchanged', { trimmed, prev: props.note })
	}
	isEditing.value = false;
	unsavedNote.value = '';
}

const placeholderWhileSavingNote = ref<string | null>(null);
const displayedNote = computed(() => placeholderWhileSavingNote.value ?? props.note);

const saveNote = async () => {
	placeholderWhileSavingNote.value = unsavedNote.value;
	await saveUpdatedNote();
	placeholderWhileSavingNote.value = null;
}
const saveNoteOnBlur = async () => {
	// Check for isEditing; the blur might have happened because saving was finished, and the input was removed
	if (!isEditing.value) return;
	await awaitTimeout(150);
	saveNote();
}

const inputEl = ref<HTMLInputElement | null>(null);

const startEditing = async () => {
	isEditing.value = true;
	unsavedNote.value = props.note ?? '';
	await awaitRaf();
	if (inputEl.value) {
		inputEl.value.focus();
	}
}
const clearNote = () => {
	unsavedNote.value = '';
	saveNote();
}

watch(isEditing, async (val, prev) => {
	// If we begin editing, set the unsavedNote to the current note if there is one
	// Then, after a delay, focus the input
	if (val && !prev) {
		unsavedNote.value = props.note ?? '';
		await nextTick();
		if (inputEl.value) {
			inputEl.value.focus();
		}
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