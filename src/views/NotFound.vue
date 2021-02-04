<template>
	<div>
		<PageHeader>Page not found</PageHeader>	
		<p>You will now be redirected to the main menu...</p>
	</div>
</template>

<script>
export default {
	data() {
		return {
			timeout: null
		}
	},
	mounted() {
		this.timeout = setTimeout(() => {
			this.timeout = null;
			this.$router.replace('/');
		}, 2000);
	},
	unmounted() {
		if (!this.timeout) return;

		console.warn('Redirect timeout still running while unmounted... cancelling');
		clearTimeout(this.timeout);
	}
};
</script>

<style lang="postcss" scoped>
	
</style>