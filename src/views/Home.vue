<template>
	<div class="home p-4 h-full flex flex-col items-stretch justify-center">
		<div class="main-menu">
			<h1 class="text-6xl font-extrabold pb-10">Takuzu</h1>
			<nav class="flex flex-col">
				<router-link to="/play">Free play</router-link>
				<router-link to="/daily">Daily puzzles</router-link>
				<router-link to="/arcade">Arcade</router-link>
				<router-link to="/help">How to play</router-link>
				<router-link to="/tools">Tools</router-link>
				<router-link to="/settings">Settings</router-link>
			</nav>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MainMenu',
	components: {
		
	}
}
</script>

<style lang="postcss" scoped>
nav > * {
	@apply text-2xl leading-loose tracking-wide;
}
.main-menu {
	padding-bottom: 10vh;
}
</style>
