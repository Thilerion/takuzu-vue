<template>
	<transition
		name="recap-outer"
		:duration="{enter: bannerEnterDuration, leave: outerLeaveDuration}"
		@after-enter="afterEnterOuter"
		@after-leave="afterLeaveOuter"
	>
		
	</transition>
</template>

<script setup>
import { computed, ref } from 'vue';

const outerEnterDuration = ref(400);
const bannerEnterDuration = ref(500);
const outerLeaveDuration = ref(200);
</script>

<style scoped>
.recap-outer-enter-active {
	transform: translateX(-100%);
  	animation: slideIn v-bind(outerEnterDuration)ms cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.recap-outer-enter-active .banner-container {
	transition: box-shadow v-bind(bannerEnterDuration)ms ease;
}

.recap-outer-enter-active .banner {
	opacity: 0;
  	animation: fadeInInner v-bind(bannerEnterDuration)ms cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.recap-outer-enter-from .banner-container {
	box-shadow: rgba(0, 0, 0, 0) 0px 54px 55px, rgba(0, 0, 0, 0) 0px -12px 30px, rgba(0, 0, 0, 0) 0px 4px 6px, rgba(0, 0, 0, 0) 0px 12px 13px, rgba(0, 0, 0, 0) 0px -3px 5px;
}

.recap-outer-leave-active {
	transition: opacity v-bind(outerLeaveDuration)ms ease;
}
.recap-outer-leave-to {
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
@keyframes fadeInInner {
	0% {
		opacity: 0;		
	}
	20% {
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