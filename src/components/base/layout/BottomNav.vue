<template>
	<nav class="bg-white w-full bg-opacity-90 dark:bg-slate-800 dark:border-t dark:border-slate-700 relative bottom-0">
		<div class="flex justify-evenly h-full">
			<router-link
				v-for="item in menuItems"
				:key="item.label"
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

<script setup lang="ts">
import { useMainStore } from "@/stores/main";
import { computed } from "vue";
import { useRoute, type RouteLocationNormalizedLoaded } from "vue-router";


const mainStore = useMainStore();
const customPuzzleToolEnabled = computed(() => mainStore.featureToggles.customPuzzleTool.isEnabled);
const analysisToolEnabled = computed(() => mainStore.featureToggles.analysisTool.isEnabled);
const showToolsMenu = computed(() => {
	return customPuzzleToolEnabled.value || analysisToolEnabled.value;
})

type ActiveWhenCheckFn = (args: RouteLocationNormalizedLoaded) => boolean;
type Item = { label: string, icon: BottomNavIconNames, to: string | { name: string }, activeWhen: ActiveWhenCheckFn };

const baseMenuItems: Item[] = [
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
]

const menuItems = computed(() => {
	const items = [...baseMenuItems];
	if (showToolsMenu.value) {
		items.push({
			label: 'Tools', to: '/tools', icon: 'tools',
			activeWhen: ({ path }) => path.startsWith('/tools')
		});
	}
	return items;
})

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