<template>
	<div class="dropdown" ref="menuRef">
		<div class="dropdown-trigger">
			<slot name="trigger" :open="openDropdown" :close="closeDropdown" :toggle="toggleDropdown">
				<BaseButton @click="openDropdown">Dropdown</BaseButton>
			</slot>
		</div>
		<transition name="drop">
			<div class="dropdown-menu" v-show="state.isOpen" :class="{'menu-align-below': alignBelow, 'menu-align-right': alignRight}">
				<div class="dropdown-content">
					<slot name="content" :open="openDropdown" :close="closeDropdown" :toggle="toggleDropdown">
						<BaseDropdownItem @click="closeDropdown">This dropdown menu is empty...</BaseDropdownItem>
					</slot>
				</div>
			</div>
		</transition>
	</div>
	<div v-if="!state.isClosed" class="fixed inset-0 pointer-events-auto touch-none z-10"></div>
</template>

<script setup lang="ts">
import { onBeforeMount, watch, ref, reactive, onBeforeUnmount } from 'vue';

const emit = defineEmits(['toggled']);
const props = defineProps<{
	alignBelow?: boolean,
	alignRight?: boolean,
}>();
const state = reactive({
	isOpen: false,
	isClosed: true
})

const emitState = () => {
	emit('toggled', state.isOpen);
}
const openDropdown = () => {
	state.isOpen = true;
	state.isClosed = false;
	emitState();
}
const closeDropdown = () => {
	state.isOpen = false;
	// isClosed triggers after timeout or transition
	emitState();
}
const toggleDropdown = () => {
	state.isOpen = !state.isOpen;
	if (state.isOpen) {
		state.isClosed = false;
	}
	emitState();
}
const menuRef = ref<HTMLElement | null>(null);
const clickOutsideHandler = (e: MouseEvent) => {
	if (state.isClosed || !state.isOpen) return;
	if (!menuRef.value || menuRef.value.contains(e.target as Node)) {
		return;
	}
	closeDropdown();
	e.preventDefault();
	e.stopPropagation();
}
const removeListeners = () => {
	window.removeEventListener('pointerdown', clickOutsideHandler, { capture: true });
}
const setListeners = () => {
	window.addEventListener('pointerdown', clickOutsideHandler, { capture: true });
}

let isClosedTimeoutId: ReturnType<typeof setTimeout> | null = null;
watch(() => state.isOpen, (value, prev) => {
	if (value || !prev) return;
	clearTimeout(isClosedTimeoutId!);
	globalThis.setTimeout(() => {
		try {
			state.isClosed = true;
		} catch {}
		finally {
			isClosedTimeoutId = null;
		}
	}, 150);
})

onBeforeMount(() => setListeners());
onBeforeUnmount(() => {
	clearTimeout(isClosedTimeoutId!);
	isClosedTimeoutId = null;
	removeListeners();
})

defineExpose({
	closeDropdownMenu: closeDropdown
})
</script>

<style scoped>
.dropdown {
	@apply inline-flex relative dark:text-gray-200 z-20;
}
.dropdown-menu {
	min-width: 12rem;
	@apply block left-0 absolute z-20 top-0 origin-top-left;
}
.dropdown-menu.menu-align-below {
	@apply top-full pt-1;
}
.dropdown-menu.menu-align-right {
	@apply left-auto right-0 origin-top-right;
}
.dropdown-content {
	min-height: 2rem;
	@apply bg-white rounded shadow-lg py-2 dark:bg-slate-800 dark:outline-slate-600 dark:outline dark:outline-1;
}

.dropdown-menu {
	--enter-dur: .25s;
	--leave-dur: .1s;

	--enter-opacity-dur: var(--enter-dur);
	--enter-opacity-delay: 0s;
	--enter-transform-dur: calc(var(--enter-dur) * 0.8);
	--enter-transform-delay: calc(var(--enter-dur) * 0.1);
}

.drop-enter-active {
	transform-origin: 0% 0%;
	transition: opacity var(--enter-opacity-dur) ease var(--enter-opacity-delay),
		transform var(--enter-transform-dur) ease var(--enter-transform-delay);
}
.drop-leave-active {
	transform-origin: 0% 0%;
	transition: opacity var(--leave-dur) ease,
		transform var(--leave-dur) ease;
}
.drop-enter-from {
	opacity: 0;
	transform: scale(0.9);
}
.drop-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>