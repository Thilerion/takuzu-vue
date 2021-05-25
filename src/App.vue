<template>
	<div
		class="root"
		:style="{
			'min-height': viewportHeight,
			'--vh-total': viewportHeight,
		}">
		<!-- TODO: transition for MainPage <-> OverlayPage -->
		<router-view v-slot="{ Component }">
			<overlay-page-transition>
				<component :is="Component" />
			</overlay-page-transition>
		</router-view>
		
		<!-- container for overlays, for use with <teleport> component -->
		<div id="overlay-wrapper">
			<div id="overlay-container"></div>
		</div>
	</div>
</template>

<script>
import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';
export default {
	components: {
		OverlayPageTransition,
	},
	data() {
		return {
			viewportHeight: '100%',
		}	
	},
	methods: {
		onResize() {
			const h = window.innerHeight;
			this.viewportHeight = h + 'px';
		}
	},
	beforeMount() {
		window.addEventListener('resize', this.onResize);
		this.onResize();
	},
	unmounted() {
		window.removeEventListener('resize', this.onResize);
	}
}
</script>

<style lang="postcss">
html {
	height: -webkit-fill-available;
}
body {
	min-height: 100vh;
	min-height: -webkit-fill-available;
	overscroll-behavior-y: none;
	@apply text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-50;
}
.root {
	@apply relative flex flex-col z-0;
}


#overlay-wrapper {
	height: var(--vh-total);
	@apply w-full pointer-events-none overscroll-contain fixed z-20;
}
#overlay-container {
	@apply h-full w-full flex pointer-events-none;
}
#overlay-container > * {
	@apply pointer-events-auto;
}

/*
.fade-enter-active,
.fade-leave-active {
	transition: opacity .15s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.slide-in-enter-active,
.slide-in-leave-active,
.slide-out-enter-active,
.slide-out-leave-active {
	transition: all .3s ease;
	@apply w-full h-full z-20;
}
.slide-out-enter-active {
	transition: all .3s ease;
}
.slide-out-enter-active {
	transition: all .2s ease .1s;
}

.slide-in-enter-from {
	opacity: 0;
	transform: scale(1.05);
}
.slide-in-leave-to {
	opacity: 0;
}

.slide-out-enter-from {
	opacity: 0;
}
.slide-out-leave-to {
	opacity: 0;
	transform: scale(1.05);
	z-index: 50;
} */
</style>
