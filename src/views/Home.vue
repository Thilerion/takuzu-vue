<template>
	<div class="main-menu h-full flex-1 flex flex-col items-center justify-center text-center">
		<h1 class="text-6xl font-extrabold pb-10">Takuzu</h1>
		<nav class="">
			<div class="routes main-routes flex flex-col">
				<router-link to="/play">Free play</router-link>
				<router-link to="/daily">Daily puzzles</router-link>
				<router-link to="/arcade">Arcade</router-link>
			</div>
			<div class="routes secondary-routes flex flex-col">
				<router-link to="/how-to-play">How to play</router-link>
			</div>				
		</nav>
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
.main-routes {
	@apply text-2xl tracking-wide;
	line-height: 3rem;
}
.secondary-routes {
	@apply text-lg pt-4;
	line-height: 2.25rem;
}
</style>
