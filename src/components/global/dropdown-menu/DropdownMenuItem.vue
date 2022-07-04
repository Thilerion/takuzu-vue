<template>
	<component
		:is="asElement"
		class="dd-item"
		@click="handleItemClick"
	><slot /></component>
</template>

<script setup lang="ts">
import { inject } from 'vue';

export type Props = {
	interactive?: boolean,
	asElement?: string
}
const props = withDefaults(defineProps<Props>(), {
	asElement: 'button'
})
const emit = defineEmits(['click']);
const closeDropdown = inject('closeDropdown') as () => void;
const handleItemClick = () => {
	if (!props.interactive) {
		window.setTimeout(() => {
			closeDropdown();
		}, 67);
	}
	emit('click');
}
</script>

<style scoped>
.dd-item {
	@apply pr-12 text-left whitespace-nowrap w-full text-gray-800 text-sm leading-normal relative py-2 pl-4 tracking-wide flex items-center;
	@apply hover-hover:hover:bg-gray-100 hover-hover:hover:text-black;
}
.dd-item .icon {
	@apply text-gray-600;
}

.dd-item:disabled {
	background-color: transparent;
	@apply  text-gray-500 cursor-default;
}
</style>