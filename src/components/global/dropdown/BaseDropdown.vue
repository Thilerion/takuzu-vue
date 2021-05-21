<template>
	<div class="dropdown">
		<div class="dropdown-trigger">
			<slot name="trigger" :open="openDropdownMenu" :close="closeDropdownMenu" :toggle="toggleDropdownMenu">
				<BaseButton @click="openDropdownMenu">Dropdown</BaseButton>
			</slot>
		</div>
		<transition name="drop">
			<div class="dropdown-menu" v-show="isOpen" :class="{'menu-align-below': alignBelow, 'menu-align-right': alignRight}" ref="ddMenu">
				<div class="dropdown-content">
					<slot name="content" :open="openDropdownMenu" :close="closeDropdownMenu" :toggle="toggleDropdownMenu">
						<BaseDropdownItem @click="closeDropdownMenu">This dropdown menu is empty...</BaseDropdownItem>
					</slot>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
export default {
	emits: ['toggled'],
	props: {
		alignBelow: Boolean,
		alignRight: Boolean,
	},
	data() {
		return {
			isOpen: false,
		}
	},
	methods: {
		openDropdownMenu() {
			this.isOpen = true;
			this.emitState();
		},
		closeDropdownMenu() {
			this.isOpen = false;
			this.emitState();
		},
		toggleDropdownMenu() {
			this.isOpen = !this.isOpen;
			this.emitState();
		},
		emitState() {
			this.$emit('toggled', this.isOpen);
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
		document.addEventListener('pointerdown', this.clickOutsideHandler, { capture: true });
	},
	beforeUnmount() {
		document.removeEventListener('pointerdown', this.clickOutsideHandler, { capture: true });
	}
};
</script>

<style lang="postcss" scoped>
.dropdown {
	@apply inline-flex relative;
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
	min-height: 6rem;
	@apply bg-white rounded shadow-lg py-2;
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