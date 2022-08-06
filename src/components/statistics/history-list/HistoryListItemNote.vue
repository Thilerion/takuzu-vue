<template>
	<div>
		<div
			class="w-full flex items-end justify-start relative py-1 -ml-1"
			v-if="isEditing || hasNote || unsavedNote"
		>
			<div class="relative w-full">
				<div
					class="text-xs text-gray-600 w-full border-0 p-0 m-0 leading-loose max-w-full text-ellipsis overflow-x-hidden"
					@click="startEditing"
				><span v-if="noteStr">{{noteStr}}</span><div v-else class="opacity-0">Enter note here</div></div>
				<transition name="t-fade">
				<div
					v-if="isEditing"
					class="h-full absolute inset-y-0 -inset-x-2 pl-1 flex -mr-2 justify-between items-center"
				>
					<input
						type="text"
						v-model="unsavedNote"
						placeholder="Enter note here"
						class="w-full border-0 p-0 m-0 text-xs h-full focus:border-0 focus:outline-none ring-2 ring-slate-500/30 focus:ring-2 focus:ring-slate-500/50 leading-loose max-w-full pl-1 rounded-sm transition duration-150"
						ref="inputEl"
						@blur="stopEditingOnBlur"
						@keydown.enter="saveNote"
					>
					<IconBtn
						class="text-xxs active:hover-none:bg-gray-300/20 text-gray-800/70 h-8 w-8 flex-none ml-1"
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
import { useStatisticsStore } from '@/stores/statistics';
import { awaitRaf, awaitTimeout } from '@/utils/delay.utils';
import { computed, onMounted, ref, toRef, watch, type Ref } from 'vue';

const props = defineProps<{
	note?: string | null | undefined,
	id: string | number
}>();
const emit = defineEmits(['save-note']);

const unsavedNote = ref<string | null>();

const hasNote = computed(() => {
	if (props.note != null && props.note !== '') return true;
	return false;
})
const noteStr = computed(() => {
	if (unsavedNote.value !== props.note && !!(unsavedNote.value)) {
		// show unsaved note
		return unsavedNote.value as string;
	}
	if (!hasNote.value) return null;
	// show note from props
	return props.note as string;
})
const propsNote = computed(() => {
	return props?.note ?? undefined;
})
onMounted(() => {
	if (hasNote.value) {
		unsavedNote.value = noteStr.value;
	}
})
const inputEl = ref<HTMLInputElement | null>(null);

const statsStore = useStatisticsStore();
const editingNoteId = toRef(statsStore, 'editingNoteId') as Ref<string | number | null>;
const isEditing = computed({
	get() {
		return editingNoteId.value === props.id;
	},
	set(value: boolean) {
		if (!value && editingNoteId.value === props.id) {
			editingNoteId.value = null;
		} else if (value) {
			editingNoteId.value = props.id;
		}
	}
})
watch(isEditing, (value) => {
	if (value) {
		if (unsavedNote.value == null) {
			unsavedNote.value = '';
		}
		awaitTimeout(200).then(() => {
			inputEl.value?.focus?.();
		})
	} else if (!value) {
		awaitTimeout(200).then(() => {
			saveNote();
		})
	}
})

const startEditing = async () => {
	isEditing.value = true;
	await awaitRaf();
	inputEl.value?.focus?.();
}
const saveNote = async () => {
	isEditing.value = false;
	await awaitRaf();
	const hasValue = unsavedNote.value != null && unsavedNote.value !== '';
	emit('save-note', hasValue ? unsavedNote.value : undefined);
}
const stopEditingOnBlur = async () => {
	await awaitTimeout(250);
	if (!isEditing.value) return;
	isEditing.value = false;
	saveNote();
}
const clearNote = async () => {
	isEditing.value = false;
	unsavedNote.value = null;
	emit('save-note', null);
}
watch(propsNote, (value) => {
	unsavedNote.value = value;
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