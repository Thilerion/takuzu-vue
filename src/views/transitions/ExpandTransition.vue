<template>
	<transition
		name="t-expand"
		@enter="(el) => enter(el as HTMLElement)"
		@after-enter="(el) => afterEnter(el as HTMLElement)"
		@leave="(el) => leave(el as HTMLElement)"
		@after-leave="afterLeave"
	><template v-if="show"><slot /></template></transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
	duration?: number,
	durationPer100Px?: number,
	maxDuration?: number,
	show?: boolean
}>(), {
	duration: 500,
	maxDuration: 1000,
	show: true
})

const emit = defineEmits(['after-enter', 'after-leave']);

const baseHeight = ref(0);

const duration = computed(() => {
	const baseDuration = (props.durationPer100Px != null && baseHeight.value > 0) ? baseHeight.value / 100 * props.durationPer100Px : props.duration;
	return Math.round(Math.min(baseDuration, props.maxDuration));
})

function enter(el: HTMLElement) {
	const rect = el.getBoundingClientRect();	
	el.style.width = rect.width + 'px';
	el.style.position = 'absolute';
	el.style.visibility = 'hidden'; // TODO: typo fixed, was visbility, does it still work? 12-1-24
	el.style.height = 'auto';

	const height = getComputedStyle(el).height;
	baseHeight.value = parseFloat(height.slice(0, -2));
	el.style.width = '';
	el.style.position = '';
	el.style.visibility = ''; // TODO: typo fixed, was visbility, does it still work? 12-1-24
	el.style.height = '0';

	// force repaint
	getComputedStyle(el).height;

	el.style.height = height;
}
function afterEnter(el: HTMLElement) {
	el.style.height = 'auto';
	emit('after-enter');
}
function leave(el: HTMLElement) {
	const rect = el.getBoundingClientRect();
	baseHeight.value = rect.height;

	el.style.height = rect.height + 'px';

	// force repaint
	getComputedStyle(el).height;

	el.style.height = '0px';
}
function afterLeave() {
	emit('after-leave');
}
</script>

<style>
.t-expand-enter-active,
.t-expand-leave-active {
  transition: height calc(v-bind(duration) * 1ms) ease-in-out;
  overflow: hidden;
}

.t-expand-enter-active > * {
	transition: opacity calc(v-bind(duration) * 0.4ms) ease-in-out calc(v-bind(duration) * 0.1ms);
}
.t-expand-leave-active > * {
	transition: opacity calc(v-bind(duration) * 0.4ms) ease-out calc(v-bind(duration) * 0.1ms);
}
.t-expand-enter-from > *,
.t-expand-leave-to > * {
	opacity: 0!important;
}
.t-expand-enter > *,
.t-expand-leave > * {
	opacity: 1!important;
}

.t-expand-enter-from,
.t-expand-leave-to {
  height: 0;
}
</style>

<style scoped>
:slotted(div) {
	@apply transform-gpu will-change-[height];
}
</style>