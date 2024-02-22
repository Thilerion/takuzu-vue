<template>
	<header class="flex justify-center items-stretch text-gray-700 dark:text-gray-100 flex-shrink-0" :class="[
		small ? 'h-16' : 'h-24',
		{
			'shadow-sm': mergedElevated,
			'bg-white dark:bg-slate-800': !transparent
		}
	]">
		<div class="header-group side left">
			<IconBtn v-if="hasBackButton" @click="back">
				<icon-mdi-arrow-left />
			</IconBtn>
			<IconBtn v-else-if="hasCloseButton" @click="close">
				<icon-mdi-close />
			</IconBtn>
		</div>
		<div class="header-group flex justify-center items-center flex-1">
			<h1 class="font-medium leading-normal" :class="{
				'text-xl': small,
				'text-2xl': !small
			}">
				<slot/>
			</h1>
		</div>
		<div class="header-group side right">
			<slot name="right"/>
		</div>
	</header>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export interface Props {
	closeBtn?: boolean,
	hideBack?: boolean,
	small?: boolean,
	transparent?: boolean,
	elevated?: '' | boolean | null,
	backOptions?: {
		// go(-1) if there is a prev route, else replace with fallbackRoute
		type: 'simple',
		fallbackRouteName: string,
	} | string | {
		// force going to a specific route, either by go(-1) if meta.prev.name === prevRoute.name, or replace if no meta.prev, or push if meta.prev is a different route
		type: 'force',
		prevRouteName: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	small: true,
	transparent: false,
	elevated: null,
	backOptions: () => ({
		type: 'simple',
		fallbackRouteName: 'Home'
	}),
});
const emit = defineEmits<{
	(e: 'close'): void
}>();

const route = useRoute();
const hasBackButton = computed(() => {
	if (props.hideBack) return false;
	if (route?.meta?.noBackButton) return false;
	return true;
})
const hasCloseButton = computed(() => {
	if (props.closeBtn && !hasBackButton.value) return true;
	return false;
})

const attrs = useAttrs();
const hasOnCloseAttr = computed(() => {
	return typeof attrs?.onClose === 'function';
})

const close = () => {
	if (hasOnCloseAttr.value) {
		emit('close');
		return;
	}	
}

const router = useRouter();
const backSimple = (name: string) => {
	const prevRoute = route.meta?.prev;
	if (prevRoute == null) {
		router.replace({ name })
	} else {
		router.go(-1);
	}
}
const backForcedTo = (name: string) => {
	const metaPrev = route.meta?.prev;
	if (metaPrev == null) {
		router.replace({ name })
	} else if (metaPrev.name !== name) {
		router.push({ name });
	} else {
		router.go(-1);		
	}
}
const back = () => {
	const opts = (typeof props.backOptions === 'string') ? {
		type: 'simple' as const,
		fallbackRouteName: props.backOptions
	} : props.backOptions;
	const type = opts.type;
	if (type === 'simple') {
		backSimple(opts.fallbackRouteName);
		return;
	} else if (type === 'force') {
		backForcedTo(opts.prevRouteName);
		return;
	} else {
		const x: never = type;
		console.error(`Invalid backOptions type: ${x}. Defaulting to "simple".`);
		backSimple("Home");
		return;
	}
}

const mergedElevated = computed(() => {
	if (props.elevated === '') return true;
	if (props.elevated != null) return props.elevated;
	if (props.transparent) return false;
	return true;
})
</script>

<style scoped>
.header-group {
	@apply flex items-center;
}
.header-group.side {
	@apply w-12 flex-none px-2;
}
.header-group.left, .header-group.right {
	@apply justify-center;
}
</style>