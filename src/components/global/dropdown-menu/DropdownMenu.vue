<template>
	<div
		class="relative inline-block text-left"
		ref="dropdownWrapper"
	>
		<div class="menu-trigger">
			<IconBtn @click="toggle">
				<icon-ic-baseline-more-vert />
			</IconBtn>
		</div>

		<transition name="drop2">
			<div
				v-show="menuOpen"
				class="dropdown-menu origin-top-right absolute right-0 z-50 mt-2 w-56 rounded-md shadow-lg bg-white focus:outline-none ring-1 ring-black ring-opacity-5"
				role="menu"
				aria-orientation="vertical"
				aria-labelledby="menu-button"
				tabindex="-1"
			>
				<ul
					class="py-1"
				>
					<slot name="items"
						:open="open"
						:close="close"
						:toggle="toggle"
						:menu-open="menuOpen"
					>
						No dropdown items...
					</slot>
				</ul>	
			</div>
		</transition>
	</div>
</template>

<script>
export default {
	name: "DropdownMenu",
	emits: ['opened', 'closed'],
	data() {
		return {
			menuOpen: false,
		}
	},
	provide() {
		return {
			toggleDropdown: this.toggle,
			openDropdown: this.open,
			closeDropdown: this.close,
		}
	},
	methods: {
		toggle() {
			this.menuOpen = !this.menuOpen;
		},
		open() {
			this.menuOpen = true;
		},
		close() {
			this.menuOpen = false;
		},
		checkClickOutside(ev) {
			const el = this.$refs.dropdownWrapper;
			const target = ev.target;
			if (el.contains(target) || target === el) {
				return;
			}
			this.close();
		}
	},
	beforeMount() {
		document.addEventListener('pointerdown', this.checkClickOutside, { passive: true });
	},
	beforeUnmount() {
		document.removeEventListener('pointerdown', this.checkClickOutside, { passive: true });
	},
	watch: {
		menuOpen(value, prev) {
			if (value && !prev) {
				this.$emit('opened');
			} else if (!value && prev) {
				this.$emit('closed');
			}
		}
	}
};
</script>

<style scoped>
.dropdown-menu {
	--enter-dur: .25s;
	--leave-dur: .1s;

	--enter-opacity-dur: var(--enter-dur);
	--enter-opacity-delay: 0s;
	--enter-transform-dur: calc(var(--enter-dur) * 0.8);
	--enter-transform-delay: calc(var(--enter-dur) * 0.1);
}

.drop2-enter-active {
	transition: opacity var(--enter-opacity-dur) ease var(--enter-opacity-delay),
		transform var(--enter-transform-dur) ease var(--enter-transform-delay);
}
.drop2-leave-active {
	transition: opacity var(--leave-dur) ease,
		transform var(--leave-dur) ease;
}
.drop2-enter-from {
	opacity: 0;
	transform: scale(0.9);
}
.drop2-leave-to {
	opacity: 0;
	transform: scale(0.95);
}
</style>