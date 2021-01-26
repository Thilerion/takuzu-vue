<template>
	<div class="main-page">
		<router-view v-slot="{ Component, route }">
			<transition :name="transition" :mode="transitionMode">
				<component :is="Component" :key="route.name" class="page" :class="{ 'has-bottom-nav': $route.meta.hasBottomNav }" />
			</transition>
		</router-view>
		<BottomNav v-if="$route.meta.hasBottomNav" />
	</div>
</template>

<script>
export default {
	computed: {
		hasBottomNav() {
			return this.$route.meta.hasBottomNav;
		},
		transition() {
			return this.$route.meta.transitionName || 'fade';
		},
		transitionMode() {
			return this.$route.meta.transitionMode;
		}	
	}
}
</script>

<style lang="postcss">
#app {
	@apply relative text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-50;
}
.page {
	@apply bg-gray-50 dark:bg-gray-900;
}

.main-page {
	@apply relative h-full w-full;
}

.page.has-bottom-nav {
	@apply pb-16;
}

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
}
</style>
