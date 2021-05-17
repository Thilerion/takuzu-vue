<template>
	<nav class="bg-white h-16 w-full bg-opacity-90">
		<div class="flex justify-between h-full">
			<router-link
				class="nav-link"
				v-for="item in menuItems"
				:key="item.to"
				:to="item.to"
			>
				<span class="material-icons">
					{{item.icon}}
				</span>
				<span
					class="nav-link-text"
				>{{item.label}}</span>
			</router-link>
		</div>
	</nav>
</template>

<script>
export default {
	data() {
		return {
			menuItems: [
				{ label: 'Home', to: { name: 'MainMenu' }, icon: 'home' },
				// { label: 'Tools', to: '/tools', icon: 'construction' }, // TODO: Tools page
				{ label: 'Stats', to: '/stats', icon: 'leaderboard' },
				{ label: 'Settings', to: { name: 'Settings' }, icon: 'settings' },
				{ label: 'More', to: '/menu', icon: 'more_horiz' },
			]
		}
	},
};
</script>

<style lang="postcss" scoped>
.nav-link {
	@apply w-full h-full justify-center text-center py-2 flex flex-col items-center text-xs text-gray-700 font-medium;
}

@media (hover:hover) {
	.nav-link {
		@apply focus:text-teal-500 hover:text-teal-500;
	}
}
.nav-link.router-link-exact-active {
	@apply text-teal-700 font-semibold;
}
.nav-link > .material-icons {
	@apply mb-1 text-current opacity-80;
	font-size: 24px;
}
.nav-link {
	transition: color .1s ease;
}

nav {
	box-shadow: 0px 7px 15px rgba(0, 0, 0, 0.2);
	@apply bg-opacity-90;
}
@supports (backdrop-filter: blur(4px)) {
	nav {
		@apply bg-opacity-70 backdrop-filter backdrop-blur-sm;
	}
}
</style>