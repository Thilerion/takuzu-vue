<template>
	<div class="dropdown">
		<div class="dropdown-trigger">
			<slot name="trigger" :open="openDropdownMenu" :close="closeDropdownMenu" :toggle="toggleDropdownMenu">
				<BaseButton @click="openDropdownMenu">Dropdown</BaseButton>
			</slot>
		</div>
		<div class="dropdown-menu" v-show="isOpen" :class="{'menu-align-below': alignBelow}" ref="ddMenu">
			<div class="dropdown-content">
				<slot name="content" :open="openDropdownMenu" :close="closeDropdownMenu" :toggle="toggleDropdownMenu">
					<BaseDropdownItem @click="closeDropdownMenu">This dropdown menu is empty...</BaseDropdownItem>
				</slot>
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
		toggleDropdownMenu() {
			this.isOpen = !this.isOpen;
		},
		clickOutsideHandler(e) {
			if (!this.isOpen) return;

			const menuRef = this.$refs.ddMenu;
			if (!menuRef || menuRef.contains(e.target)) {
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
	min-height: 6rem;
	@apply bg-white rounded shadow-lg py-2;
}
</style>