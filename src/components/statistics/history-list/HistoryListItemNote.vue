<template>
	<div>
		<div
			class="w-full flex items-end justify-start relative pr-2 py-1 text-ellipsis overflow-x-hidden -ml-1"
			v-if="isEditing || hasNote || unsavedNote"
		>
			<div class="relative w-full">
				<div
					class="text-xs text-gray-600 w-full border-0 p-0 m-0 leading-loose"
					@click="startEditing"
				>{{noteStr}}</div>
				<input
					type="text"
					v-model="unsavedNote"
					class="w-full border-0 p-0 m-0 text-xs h-full absolute inset-0 focus:border-0 focus:outline-none focus:ring-2 focus:ring-slate-500/50 leading-loose"
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
import { awaitRaf } from '@/utils/delay.utils';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps<{
	note?: string | null | undefined
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

const isEditing = ref(false);
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