<template>
	<router-view v-slot="{ Component, route }">
		<transition :name="route.meta.transition || 'fade'" mode="out-in">
			<component :is="Component" :key="route.name" />
		</transition>
	</router-view>
</template>

<script>
export default {
	
}
</script>

<style lang="postcss">
#app {
	@apply relative text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-50;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity .15s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
