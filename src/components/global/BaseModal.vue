<template>
	<transition name="fade-scale" appear>
		<div class="modal" v-if="isActive">
			<div class="modal-background" @click="backdropClose"></div>

			<div class="modal-content">
				<div class="modal-box">
					<slot :close="close" />
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
		}
	},
	props: {
		// disable closing by "esc" or backdrop click => if enabled, must have at least one focusable close control!
		preventClose: Boolean,
	},
	methods: {
		backdropClose() {
			if (this.preventClose) return;
			this.close();
		},
		close() {
			this.isActive = false;
		},
		open() {
			this.isActive = true;
		},
	}
};
</script>

<style lang="postcss">
.modal {
	@apply overflow-hidden fixed inset-0 z-10 flex items-center flex-col justify-center h-full w-full;
}
.modal-background {
	@apply bg-gray-600 bg-opacity-80 absolute inset-0;
}

.modal-content {
	@apply overflow-auto max-w-2xl w-full max-h-96 relative p-6 rounded;
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