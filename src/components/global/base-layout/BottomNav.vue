<template>
	<nav class="bg-white h-16 w-full bg-opacity-90 dark:bg-slate-800 dark:border-t dark:border-slate-700">
		<div class="flex justify-between h-full">
			<router-link
				v-for="item in menuItems"
				:key="item.to"
				:to="item.to"
				v-slot="{ isExactActive, href, navigate }"
				custom
			>
				<a
					:href="href"
					@click="navigate"
					:class="{
						'router-link-active': currentActive ? currentActive === item : isExactActive,
					}"
					class="nav-link"
				>
					<span class="nav-icon">
						<BottomNavIcon :icon="item.icon" />
					</span>
					<span
						class="nav-link-text"
					>{{item.label}}</span>
				</a>
			</router-link>
		</div>
	</nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import BottomNavIcon from "./BottomNavIcon.vue";

const menuItems = [
	{
		label: 'Home', to: { name: 'Home' }, icon: 'home',
		activeWhen: ({ name }) => name === 'Home'
	},
	{
		label: 'Stats', to: '/stats', icon: 'stats',
		activeWhen: ({ path }) => path.startsWith('/stats')
	},
	{
		label: 'Settings', to: { name: 'Settings' }, icon: 'settings',
		activeWhen: ({ name }) => name === 'Settings'
	},
	{
		label: 'More', to: '/menu', icon: 'more',
		activeWhen: ({ path }) => path.startsWith('/menu')
	}
];

const route = useRoute();

const currentActive = computed(() => {
	return menuItems.find(item => {
		return item.activeWhen(route);
	})
})
</script>

<style scoped>
.nav-link {
	@apply w-full h-full justify-center text-center py-2 flex flex-col items-center text-xs text-gray-700 font-medium;
	@apply dark:text-gray-100 transition-all duration-100;
	@apply opacity-90;

	@apply hover-hover:focus:text-teal-500 hover-hover:hover:text-teal-500;
}

.router-link-active, .router-link-nested-active {
	@apply text-teal-600 font-semibold opacity-100 scale-110;
	@apply dark:text-teal-300;
}
.nav-link > .nav-icon {
	@apply mb-1 text-current opacity-60;
	font-size: 24px;
}
.router-link-active > .nav-icon, .router-link-nested-active > .nav-icon {
	@apply opacity-80;
}
.nav-link {
	/* transition: color .1s ease; */
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