<template>
<textarea
	:id="id"
	ref="textarea"
	v-model="mv"
	:spellcheck="spellcheck"
	class="base-textarea resize-none py-4 overscroll-y-auto"
	:rows="rows"
>
</textarea>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue';

const mv = defineModel<string>({ required: true });

const props = defineProps<{
	enableSpellCheck?: boolean,
	rows?: number | string,
	id: string,
	autoresize?: boolean,
}>();

const spellcheck = computed(() => {
	if (props.enableSpellCheck == null) return undefined;
	return !!props.enableSpellCheck;
})

const styleTarget = props.rows == null ? 'height' : 'minHeight';
const textarea = ref<HTMLTextAreaElement>();

function autoResize(tg: HTMLTextAreaElement) {
	// For some reason, this offset is needed and is why VueUse's auto resize doesn't work
	const offset = tg.offsetHeight - tg.clientHeight;

	tg.style[styleTarget] = 'auto';
	tg.style[styleTarget] = `${tg.scrollHeight + offset}px`;
}

// Whenever the element changes, or its value changes, resize it.
// This also applies on mount (immediate: true)
watch([textarea, mv], ([el]) => {
	if (!props.autoresize) return;
	if (el != null) {
		autoResize(el);
	}
}, { immediate: true });
watch(() => props.autoresize, (enabled, prev) => {
	if (prev && !enabled && textarea.value != null) {
		textarea.value.style[styleTarget] = "";
	}
})
</script>

<style scoped>
.base-textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.base-textarea::-webkit-scrollbar {
  display: none;
}

/* Default, overwritable styling */
textarea:where(.base-textarea) {
	@apply rounded border-gray-400;
}
</style>