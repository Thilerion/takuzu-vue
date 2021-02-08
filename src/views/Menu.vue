<template>
	<div>
		<PageHeader>More...</PageHeader>
		<router-link custom to="/showcase" v-slot="{ navigate }">
			<BaseButton @click="navigate" element="a">Open component showcase</BaseButton>
		</router-link>
	</div>
</template>

<script>
export default {
	
};
</script>

<style lang="postcss" scoped>
	
</style>