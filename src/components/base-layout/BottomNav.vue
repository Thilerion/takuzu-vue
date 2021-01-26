<template>
	<nav class="block fixed inset-x-0 bottom-0 z-10 bg-white border-t border-truegray-200 h-16 shadow-xl">
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
				{ label: 'Home', to: '/', icon: 'home' },
				{ label: 'Tools', to: '/tools', icon: 'construction' },
				{ label: 'Stats', to: '/stats', icon: 'leaderboard' },
				{ label: 'Settings', to: '/settings', icon: 'settings' },
				{ label: 'More', to: '/menu', icon: 'more_horiz' },
			]
		}
	}
};
</script>

<style lang="postcss" scoped>
.nav-link {
	@apply w-full h-full focus:text-teal-500 hover:text-teal-500 justify-center text-center py-2 flex flex-col items-center text-xs text-gray-700 font-medium;
}
.nav-link.router-link-active {
	@apply text-teal-700 font-semibold;
}
.nav-link > .material-icons {
	@apply mb-1 text-gray-600;
	font-size: 24px;
}
.router-link-active > .material-icons {
	@apply text-teal-700;
}

.nav-link, .nav-link > .material-icons {
	transition: color .1s ease;
}
</style>