<template>
	<div class="dropdown">
		<div class="dropdown-trigger">
			<BaseButton @click="openDropdownMenu">Dropdown</BaseButton>
		</div>
		<div class="dropdown-menu" v-show="isOpen" :class="{'menu-align-below': alignBelow}" ref="ddMenu">
			<div class="dropdown-content">
				<button class="dropdown-item">Item A</button>
				<button class="dropdown-item">Other item</button>
				<button class="dropdown-item">Yet another dropdown item</button>
				<button class="dropdown-item">I can be clicked!</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		alignBelow: Boolean,
	},
	data() {
		return {
			isOpen: false,
		}
	},
	methods: {
		openDropdownMenu() {
			this.isOpen = true;
		},
		closeDropdownMenu() {
			this.isOpen = false;
		},
		clickOutsideHandler(e) {
			if (!this.isOpen) return;

			const menuRef = this.$refs.ddMenu;
			if (!menuRef || menuRef.contains(e.target)) {
				console.log('inside box');
				return;
			}

			this.closeDropdownMenu();
			e.preventDefault();
			e.stopPropagation();
		}
	},
	beforeMount() {
		document.addEventListener('click', this.clickOutsideHandler, { capture: true });
	},
	beforeUnmount() {
		document.removeEventListener('click', this.clickOutsideHandler, { capture: true });
	}
};
</script>

<style lang="postcss" scoped>
.dropdown {
	@apply inline-flex relative;
}
.dropdown-menu {
	min-width: 12rem;
	@apply block left-0 absolute z-20 top-0;
}
.dropdown-menu.menu-align-below {
	@apply top-full pt-1;
}
.dropdown-content {
	@apply bg-white rounded shadow-md py-2;
}
.dropdown-item {
	@apply pr-12 text-left whitespace-nowrap w-full text-gray-800 text-sm leading-normal relative py-2 pl-4;
	@apply hover-hover:hover:bg-gray-100 hover-hover:hover:text-black;
}
</style>