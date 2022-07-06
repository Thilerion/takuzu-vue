<template>
	<div>
		<div
			class="w-full flex items-end justify-start relative pr-2 py-1 -ml-1"
			v-if="isEditing || hasNote || unsavedNote"
		>
			<div class="relative w-full">
				<div
					class="text-xs text-gray-600 w-full border-0 p-0 m-0 leading-loose max-w-full text-ellipsis overflow-x-hidden"
					@click="startEditing"
				>{{noteStr}}</div>
				<input
					type="text"
					v-model="unsavedNote"
					class="w-full border-0 p-0 m-0 text-xs h-full absolute inset-0 focus:border-0 focus:outline-none focus:ring-2 focus:ring-slate-500/50 leading-loose max-w-full"
					ref="inputEl"
					v-if="isEditing"
					@blur="saveNote"
					@keydown.enter="saveNote"
				>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useStatisticsStore } from '@/stores/statistics';
import { awaitRaf } from '@/utils/delay.utils';
import { computed, onMounted, ref, toRef, watch, watchEffect, type Ref } from 'vue';

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
		console.log('Showing unsaved note');
		return unsavedNote.value as string;
	}
	if (!hasNote.value) return null;
	console.log('showing propsNote');
	return props.note as string;
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
		editingNoteId.value = value ? props.id : null;
	}
})
watchEffect(() => {
	if (isEditing.value) {
		console.log(isEditing.value)		
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

const propsNote = computed(() => {
	return props?.note ?? undefined;
})
watch(propsNote, (value) => {
	unsavedNote.value = value;
})
</script>

<style scoped>

</style>