<template>
	<header class="flex justify-center items-stretch h-24 text-gray-700 dark:text-gray-100 flex-shrink-0" :class="[
		small ? 'h-16' : 'h-24',
		{
			'shadow-sm': elevated,
			'bg-white': !transparent
		}
	]">
		<div class="header-group side left">
			<IconBtn v-if="hasBackButton" @click="close" name="md-arrowback">
				<icon-mdi-arrow-left v-if="hasBackButton" />
				<icon-mdi-close v-else-if="hasCloseButton" />
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

<script setup>
import { computed, onMounted, ref, useAttrs } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
	closeBtn: Boolean,
	hideBack: Boolean,
	small: Boolean,
	transparent: {
		type: Boolean,
		default: true
	},
	elevated: Boolean
})
const emit = defineEmits(['close']);

const route = useRoute();
const router = useRouter();

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
	if (route?.meta?.prev != null) {
		router.go(-1);
	} else {
		router.replace({ name: 'Home' });
	}
}

const elevated = computed(() => {
	if (props.elevated != null) return props.elevated;
	if (props.transparent != null && !props.transparent) return true;
	return false;
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