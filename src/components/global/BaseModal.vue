<template>
	<transition name="fade-scale" appear>
		<div
			class="modal"
			v-if="isActive"
			role="dialog"
			@keydown.esc="keyClose"
		>

			<div class="modal-background" @click="backdropClose" tabindex="-1"></div>

			<div class="modal-content" ref="modalContent" tabindex="-1">
				<div class="modal-box">
					<slot :close="close" :open="open" />
				</div>
			</div>

		</div>
	</transition>
</template>

<script>
export default {
	data() {
		return {
			isActive: false,
			prevFocus: null,
		}
	},
	props: {
		// disable closing by "esc" or backdrop click => if enabled, must have at least one focusable close control!
		preventClose: Boolean,
		autoOpen: Boolean
	},
	methods: {
		backdropClose() {
			if (this.preventClose) return;
			this.close();
		},
		keyClose() {
			if (this.preventClose) return;
			if (!this.isActive) return;
			this.close();
		},
		close() {
			this.isActive = false;
		},
		open() {
			this.isActive = true;
		},
	},
	watch: {
		isActive(cur, prev) {
			if (cur && !prev) {
				this.prevFocus = document.activeElement;
				this.$nextTick(() => {
					try {
						this.$refs.modalContent.focus();
					} catch(e) {
						console.warn('Could not focus modalContent.');
						console.warn(e);
					}
				})
			} else if (!cur && prev && this.prevFocus != null) {
				try {
					this.prevFocus.focus();
				} catch(e) {
					console.warn('Could not focus previously focused element.');
					console.warn({e, prevFocus: this.prevFocus});
				}
				this.prevFocus = null;
			}
		}
	},
	beforeMount() {
		if (this.autoOpen) {
			this.open();
		}
	}
};
</script>

<style>
.modal {
	@apply overflow-hidden fixed inset-0 z-20 flex items-center flex-col justify-center h-full w-full;
}
.modal-background {
	@apply bg-gray-600 bg-opacity-80 absolute inset-0;
}

.modal-content {
	@apply overflow-auto max-w-2xl w-full max-h-96 relative p-6 rounded focus:outline-none;
}

.modal-box {
	/* transition: all 2.5s ease 2.5s;
	transition-property: opacity transform; */
	@apply bg-white rounded shadow-md block p-6 text-gray-900 max-h-full overflow-auto;
}

.fade-scale-enter-active {
	transition: opacity .4s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-scale-leave-active {
	transition: opacity .15s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-scale-enter-active .modal-box {
	transition: all .4s ease;
	transition-property: opacity transform;
}
.fade-scale-leave-active .modal-box {
	transition: all .15s cubic-bezier(0.22, 1, 0.36, 1);
	transition-property: opacity transform;
}

.fade-scale-enter-from, .fade-scale-leave-to {
	opacity: 0;
}
.fade-scale-enter-from .modal-box {
	transform: scale(0.87);
	opacity: 0.5;
}
.fade-scale-leave-to .modal-box {
	transform: scale(1.15);
	opacity: 0.75;
}
</style>