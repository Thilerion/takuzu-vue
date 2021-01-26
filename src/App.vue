<template>
	<router-view v-slot="{ Component, route }">
		<transition :name="route.meta.transition || 'fade'" mode="out-in">
			<component :is="Component" :key="route.name" class="page" :class="{ 'has-bottom-nav': $route.meta.hasBottomNav }" />
		</transition>
	</router-view>
	<BottomNav v-if="$route.meta.hasBottomNav" />
</template>

<script>
export default {
	
}
</script>

<style lang="postcss">
#app {
	@apply relative text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-50;
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

.slide-enter-active,
.slide-leave-active {
	transition-property: opacity transform;
	transition-duration: .15s;
	transition-timing-function: ease;
}

.slide-leave-to {
	opacity: 0;
}
.slide-enter-from {
	opacity: 0;
	transform: scale(1.1);
}
</style>
