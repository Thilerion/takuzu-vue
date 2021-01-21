<template>
	<div class="container">
		<h1 class="text-4xl font-extrabold py-6">Page not found</h1>
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