<template>
	<main>
		<router-view v-slot="{ Component, route }">
			<transition name="main-fade" mode="out-in">
				<component :is="Component" :key="route.name" />
			</transition>
		</router-view>
	</main>
</template>

<script>
export default {
	
};
</script>

<style lang="postcss" scoped>
main {
	flex: 1;
	min-height: 100%;
	display: flex;
	flex-direction: column;
}
.main-fade-enter-active,
.main-fade-leave-active {
	transition: opacity .2s ease;
}

.main-fade-enter-from,
.main-fade-leave-to {
	opacity: 0;
}
</style>