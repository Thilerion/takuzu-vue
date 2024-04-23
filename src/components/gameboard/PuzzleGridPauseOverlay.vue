<template>
	<transition name="fade-pause">
		<div class="pause-overlay text-center" v-show="paused">
			<div class="flex flex-col h-full px-2 pt-8 pb-6 max-w-full items-stretch">
				<button
					class="flex-auto mx-auto w-full flex justify-center pause-icon-wrapper place-items-center py-4 pointer-events-auto focus-visible:outline-black"
					@click="$emit('resume')"
				><icon-grommet-icons-pause-fill class="opacity-80" /></button>
				<div class="pause-label-wrapper uppercase mb-2 py-2 break-all inline-block overflow-hidden">{{ pausedMessage }}</div>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from "vue-i18n";

defineProps<{
	paused: boolean
}>();

defineEmits<{
	(e: 'resume'): void
}>();

const { t } = useI18n();
const pausedMessage = computed(() => {
	return t('PlayPuzzle.paused');
})
// English: paused, Dutch: gepauzeerd. Use the amount of characters to approximate a correct font-size.
const pauseLabelChars = computed(() => {
	return pausedMessage.value.length;
})
</script>

<style scoped>
.pause-overlay {
	@apply relative z-10 pointer-events-none bg-gray-100 text-gray-400 grid place-items-center text-4xl;
	border-radius: var(--cell-rounding);
	@apply dark:bg-slate-800 dark:text-slate-200;
	container: pauseoverlay / inline-size;
}
.fade-pause-enter-active,
.fade-pause-leave-active {
	transition: opacity .3s ease;
}

.fade-pause-enter-from,
.fade-pause-leave-to {
	opacity: 0;
}

.pause-icon-wrapper {
	font-size: clamp(20px, 25cqw, 90px);
}
.pause-label-wrapper {
	@apply opacity-80 font-light;
	letter-spacing: 0.15em;
	font-size: clamp(20px, 100cqw / v-bind(pauseLabelChars), 60px);
}
</style>