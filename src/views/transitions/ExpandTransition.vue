<template>
	<transition
		name="t-expand"
		@enter="enter"
		@after-enter="afterEnter"
		@leave="leave"
		@after-leave="afterLeave"
	><slot /></transition>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
	duration: {
		type: Number,
		default: 500
	},
	durationPer100Px: {
		type: Number,
	},
	maxDuration: {
		type: Number,
		default: 1000
	},
})

const emit = defineEmits(['after-enter', 'after-leave']);

const baseHeight = ref(0);

const duration = computed(() => {
	const baseDuration = (props.durationPer100Px != null && baseHeight.value > 0) ? baseHeight.value / 100 * props.durationPer100Px : props.duration;
	return Math.round(Math.min(baseDuration, props.maxDuration));
})

function enter(el) {
	const rect = el.getBoundingClientRect();	
	el.style.width = rect.width + 'px';
	el.style.position = 'absolute';
	el.style.visibilty = 'hidden';
	el.style.height = 'auto';

	const height = getComputedStyle(el).height;
	baseHeight.value = height.slice(0, -2) * 1;
	el.style.width = null;
	el.style.position = null;
	el.style.visibilty = null;
	el.style.height = 0;

	// force repaint
	getComputedStyle(el).height;

	el.style.height = height;
}
function afterEnter(el) {
	el.style.height = 'auto';
	emit('after-enter');
}
function leave(el) {
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