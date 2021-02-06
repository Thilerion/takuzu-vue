<template>
	<div class="modal">
		<div class="modal-background" @click="backdropClose"></div>

		<!-- <div class="modal-content-wrapper"> -->
			<div class="modal-content">
				<div class="modal-box">
					<slot :close="close" />
				</div>
			</div>
		<!-- </div> -->

	</div>
</template>

<script>
export default {
	props: {
		preventBgClose: Boolean,
	},
	methods: {
		backdropClose() {
			if (this.preventBgClose) return;
			this.close();
		},
		close() {
			console.log('emitting close');
			this.$emit('close');
		}
	}
};
</script>

<style lang="postcss" scoped>
.modal {
	@apply overflow-hidden fixed inset-0 z-10 flex items-center flex-col justify-center h-full w-full;
}
.modal-background {
	@apply bg-gray-600 bg-opacity-80 absolute inset-0;
}
.modal-content-wrapper {
	/* @apply ; */
}

.modal-content {
	@apply overflow-auto max-w-2xl w-full max-h-full relative px-4 sm:px-6;
}

.modal-box {
	@apply bg-white rounded shadow-md block p-6 text-gray-900;
}
</style>