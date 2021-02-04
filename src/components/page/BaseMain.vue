<template>
	<main>
		<router-view v-slot="{ Component, route }">
			<transition>
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
	
</style>