<template>
<dialog
	ref="dialog"
	class="dialog"
	@close="onDialogClose"
	@click="onBackdropClick"
	@cancel="onCancel"
>
	<div
		class="dialog-contents overscroll-contain"
		:class="contentClasses"
		@click.stop
	>
		<slot :close="onDialogClose" />
	</div>
</dialog>
</template>

<script setup lang="ts">
import { ref, watchEffect, nextTick } from 'vue';

const shown = defineModel<boolean>({ required: true });
const props = defineProps<{
	nonModal?: boolean;
	disableBackdropClose?: boolean;
	preventCancel?: boolean;
	contentClasses?: string;
}>();
const emit = defineEmits<{
	(e: 'open'): void;
}>();

const dialog = ref<HTMLDialogElement>();

const onDialogClose = () => {
	shown.value = false;
}
const show = () => {
	if (!props.nonModal) {
		dialog.value?.showModal();
	} else dialog.value?.show();
}
watchEffect(() => {
	if (shown.value) {
		show();
		nextTick(() => emit('open'));
	} else if (dialog.value?.open) {
		dialog.value?.close();
	}
})

function onBackdropClick() {
	if (props.disableBackdropClose || props.preventCancel) return;
	shown.value = false;
}
function onCancel(e: Event) {
	if (props.preventCancel) {
		e.preventDefault();
		return;
	}
}
</script>

<style scoped>
:global(body:has(.dialog[open])) {
	overflow: hidden;
	scrollbar-gutter: stable;
}

/* Use :where for lowest specificity, so parent component can easily override */
:where(.dialog) {
	@apply m-auto fixed inset-0 p-4 bg-transparent w-full h-full overflow-hidden grid content-center;
}
:where(.dialog:not([open])) {
	@apply hidden;
}
:where(.dialog > .dialog-contents) {
	@apply bg-white rounded-lg shadow-lg p-4 overflow-auto max-w-full max-h-full m-auto;
}

</style>