<template>
<transition
	name="t-banner"
	:duration="{enter: enterDuration, leave: leaveDuration}"
	appear
	@after-enter="afterEnter"
	@after-leave="afterLeave"
>
	<div
		v-show="show"
		class="banner-container bg-black dark:bg-slate-800 dark:text-slate-50 text-white w-full my-auto flex justify-center items-center relative py-1"
	>
		<div
			class="banner min-h-[2rem] px-4 py-6"
			@click="emit('close')"
		>
			<div class="text-xl">
				<slot>{{ $t(bannerText, $t('Recap.fallbackCompliment')) }}</slot>
			</div>
		</div>
	</div>
</transition>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from 'vue';

const NUM_BANNER_STRINGS = 15;

const emit = defineEmits<{
	close: [],
	'banner-after-enter': [],
	'banner-after-leave': []
}>();
const props = withDefaults(defineProps<{
	show: boolean,
	enterDuration?: number,
	leaveDuration?: number
}>(), {
	enterDuration: 400,
	leaveDuration: 200
})

const { enterDuration, leaveDuration } = toRefs(props);
const enterDurMs = computed(() => enterDuration.value + 'ms');
const leaveDurMs = computed(() => leaveDuration.value + 'ms');
const bannerEnterDurMs = computed(() => {
	const ms = Math.floor(enterDuration.value * 0.25);
	return Math.max(ms, 100) + 'ms';
})

const afterEnter = () => {
	emit('banner-after-enter');
}
const afterLeave = () => {
	emit('banner-after-leave');
}

const rndIndx = Math.floor(Math.random() * NUM_BANNER_STRINGS);
const bannerText = ref(`Recap.compliments[${rndIndx}]`);
</script>

<style scoped>
[data-base-theme="light"] .banner-container {
	--container-shadow: rgba(0, 0, 0, 0.35) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
	--container-shadow-hidden: rgba(0, 0, 0, 0.35) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}
[data-base-theme="dark"] .banner-container {
	--c35: theme(colors.slate.600/35%);
	--c12: theme(colors.slate.700/12%);
	--c17: theme(colors.slate.700/17%);
	--c9: theme(colors.slate.800/9%);
	--c0: theme(colors.slate.800/0%);
	--container-shadow: var(--c35) 0px 54px 55px, var(--c12) 0px -12px 30px, var(--c12) 0px 4px 6px, var(--c17) 0px 12px 13px, var(--c9) 0px -3px 5px;
	--container-shadow-hidden: var(--c0) 0px 54px 55px, var(--c0) 0px -12px 30px, var(--c0) 0px 4px 6px, var(--c0) 0px 12px 13px, var(--c0) 0px -3px 5px;
}

.banner-container {
	box-shadow: var(--container-shadow);
}

.t-banner-enter-active {
	transform: translateX(-100%);
	animation: slideIn v-bind(enterDurMs) cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
.t-banner-enter-active .banner {
	opacity: 0;
	animation: fadeIn v-bind(enterDurMs) cubic-bezier(0.165, 0.84, 0.44, 1) forwards v-bind(bannerEnterDurMs);
}
.t-banner-enter-active .banner-container {
	transition: box-shadow v-bind(enterDurMs) ease;
}
.t-banner-enter-from .banner-container {
	box-shadow: var(--container-shadow-hidden);
}

.t-banner-leave-active {
	transition: opacity v-bind(leaveDurMs) ease;
}
.t-banner-leave-to {
	opacity: 0;
}
</style>

<style>
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes fadeIn {
	0% {
		opacity: 0;		
	}
	100% {
		opacity: 1;		
	}
}
@keyframes fadeOut {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
</style>