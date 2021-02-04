<template>
	<!-- <div class="home p-4 flex flex-col items-stretch justify-center text-center"> -->
		<div class="main-menu h-full flex-1 flex flex-col items-center justify-center">
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
		<!-- <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum ut doloremque sit tempore fugit. Magnam consequatur animi pariatur vel saepe illo ad neque, debitis amet fugit porro! Fugiat, suscipit saepe error, eius ab ipsam dolorem accusamus, ratione nihil itaque doloribus rerum obcaecati voluptatum recusandae aliquam culpa magni deserunt non? Odio.</div> -->
		<!-- <div>Facere maxime corporis nostrum non obcaecati qui minima ducimus eveniet eius sequi. Optio natus libero nostrum incidunt. Fugiat labore ducimus itaque doloribus nisi rerum aperiam! Perspiciatis molestiae hic repellendus voluptas debitis dolor dignissimos fugit est necessitatibus, minima ratione rem provident nostrum pariatur recusandae porro dicta aperiam ad. Eveniet, cum sit.</div> -->
		<!-- <div>Dolore neque odit explicabo nesciunt sunt maiores ullam rem maxime. Sit harum, ratione, nesciunt dignissimos repudiandae suscipit eos saepe tempora cupiditate officia, soluta quae voluptatum? Officia quod beatae aut laboriosam culpa odio illum iure adipisci iusto. Vitae id veritatis, voluptate perspiciatis voluptas, suscipit recusandae error, reiciendis fugiat impedit provident quam?</div> -->
	<!-- </div> -->
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

.main-menu {
	padding-bottom: 5vh;
}
</style>
