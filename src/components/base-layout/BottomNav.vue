<template>
	<nav class="block fixed inset-x-0 bottom-0 z-10 bg-white border-t border-truegray-200 h-16 shadow-xl">
		<div class="flex justify-between h-full">
			<router-link class="nav-link" to="/"><span class="nav-link-text">Home</span></router-link>
			<router-link class="nav-link" to="/tools"><span class="nav-link-text">Tools</span></router-link>
			<router-link class="nav-link" to="/stats"><span class="nav-link-text">Statistics</span></router-link>
			<router-link class="nav-link" to="/settings"><span class="nav-link-text">Settings</span></router-link>
			<router-link class="nav-link" to="/more"><span class="nav-link-text">More</span></router-link>
		</div>
	</nav>
</template>

<script>
export default {
	
};
</script>

<style lang="postcss" scoped>
.nav-link {
	@apply w-full h-full focus:text-teal-500 hover:text-teal-500 justify-center text-center py-2 inline-flex items-center text-xs;
}
.nav-link.router-link-active {
	@apply text-teal-700 font-semibold;
}
</style>