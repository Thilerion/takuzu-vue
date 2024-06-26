<template>
<nav class="bg-white w-full bg-opacity-90 dark:bg-slate-800 dark:border-t dark:border-slate-700 relative bottom-0">
	<div class="flex justify-evenly h-full max-w-lg mx-auto">
		<router-link
			v-for="item in menuItems"
			:key="item.label"
			v-slot="{ isExactActive, href, navigate }"
			:to="item.to"
			custom
		>
			<a
				:href="href"
				:class="{
					'router-link-active': currentActive ? currentActive === item : isExactActive,
				}"
				class="nav-link"
				@click="navigate"
			>
				<span class="nav-icon">
					<BottomNavIcon :icon="item.icon" />
				</span>
				<span
					class="nav-link-text"
				>{{ item.label }}</span>
			</a>
		</router-link>
	</div>
</nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, type RouteLocationNormalizedLoaded } from "vue-router";
import type { BottomNavIconNames } from "./BottomNavIcon.vue";
import { useI18n } from "vue-i18n";

type ActiveWhenCheckFn = (args: RouteLocationNormalizedLoaded) => boolean;
type Item = { label: string, icon: BottomNavIconNames, to: string | { name: string }, activeWhen: ActiveWhenCheckFn };

const { t } = useI18n();

const menuItems = computed((): Item[] => [
	{
		label: t('routeButton.home'), to: { name: 'Home' }, icon: 'home',
		activeWhen: ({ name }) => name === 'Home'
	},
	{
		label: t('routeButton.stats'), to: '/stats', icon: 'stats',
		activeWhen: ({ path }) => path.startsWith('/stats')
	},
	{
		label: t('routeButton.settings'), to: { name: 'Settings' }, icon: 'settings',
		activeWhen: ({ name }) => name === 'Settings'
	},
	{
		label: t('routeButton.tools'), to: '/tools', icon: 'tools',
		activeWhen: ({ path }) => path.startsWith('/tools')
	},
]);

const route = useRoute();

const currentActive = computed(() => {
	return menuItems.value.find(item => {
		return item.activeWhen(route);
	})
})
</script>

<style scoped>
nav {
	@apply pt-1 bg-opacity-90;
	box-shadow: 0px 7px 15px rgba(0, 0, 0, 0.2);
	padding-bottom: max(env(safe-area-inset-bottom), 0.25rem);
}
@supports (backdrop-filter: blur(4px)) {
	nav {
		@apply bg-opacity-70 backdrop-filter backdrop-blur-sm;
	}
}
.nav-link {
	@apply h-full max-w-[6rem] flex-1 justify-center text-center flex flex-col items-center text-xs text-gray-700 font-medium py-2;
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
</style>