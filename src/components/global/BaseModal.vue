<template>
	<transition name="fade-scale" appear>
		<div
			class="modal"
			v-if="isActive"
			role="dialog"
			@keydown.esc="keyClose"
		>

			<div class="modal-background" @click="backdropClose" tabindex="-1"></div>

			<div class="modal-content" ref="modalContent" tabindex="-1">
				<slot :close="close" :open="open" />
			</div>

		</div>
	</transition>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch, nextTick } from 'vue';

const isActive = ref(false);
const prevFocus = ref<null | HTMLElement>(null);

const props = defineProps<{
	preventClose?: boolean,
	autoOpen?: boolean
}>();
const emit = defineEmits<{
	(e: 'close'): void,
	(e: 'open'): void
}>();

const close = () => {
	if (isActive.value) {
		isActive.value = false;
		emit('close');
	}
}
const open = () => {
	if (!isActive.value) {
		isActive.value = true;
		emit('open');
	}
}
const backdropClose = () => {
	if (props.preventClose) return;
	close();
}
const keyClose = () => {
	if (props.preventClose || !isActive.value) return;
	close();
}

onBeforeMount(() => {
	if (props.autoOpen) open();
})

const modalContent = ref<HTMLElement | null>(null);

watch(isActive, (cur, prev) => {
	if (cur && !prev) {
		prevFocus.value = document.activeElement as HTMLElement;
		nextTick(() => {
			try {
				modalContent.value!.focus();
			} catch (e) {
				console.warn('Could not focus modalContent.');
				console.warn(e);
			}
		})
	} else if (!cur && prev && prevFocus.value != null) {
		try {
			prevFocus.value!.focus();
		} catch (e) {
			console.warn('Could not focus previously focused element.');
			console.warn({ e, prevFocus: prevFocus.value });
		}
		prevFocus.value = null;
			}
})

defineExpose({
	open, close, isActive
})
</script>

<style>
.modal {
	@apply overflow-hidden fixed inset-0 z-20 flex items-center flex-col justify-center h-full w-full;
}
.modal-background {
	@apply bg-gray-600 bg-opacity-80 absolute inset-0;
}

.modal-content {
	@apply overflow-auto max-w-2xl w-full max-h-full relative p-6 rounded focus:outline-none;
}

.fade-scale-enter-active {
	transition: opacity .4s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-scale-leave-active {
	transition: opacity .15s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-scale-enter-active .modal-box {
	transition: all .4s ease;
	transition-property: opacity transform;
}
.fade-scale-leave-active .modal-box {
	transition: all .15s cubic-bezier(0.22, 1, 0.36, 1);
	transition-property: opacity transform;
}

.fade-scale-enter-from, .fade-scale-leave-to {
	opacity: 0;
}
.fade-scale-enter-from .modal-box {
	transform: scale(0.87);
	opacity: 0.5;
}
.fade-scale-leave-to .modal-box {
	transform: scale(1.15);
	opacity: 0.75;
}
</style>