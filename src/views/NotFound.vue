<template>
	<div class="fixed inset-0 overflow-auto flex flex-col">
		<PageHeader>Page not found</PageHeader>	
		<p>You will now be redirected to the main menu...</p>
	</div>
</template>

<script>
export default {
	mounted() {
		setTimeout(() => {
			this.$router.replace('/');
		}, 2000);
	}
};
</script>

<style lang="postcss" scoped>
	
</style>