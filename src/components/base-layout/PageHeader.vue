<template>
	<header class="flex justify-center items-stretch h-24 text-gray-700">
		<div class="header-group side left">
			<IconBtn v-if="hasBackButton" @click="close">
				{{ leftButtonType }}
			</IconBtn>
		</div>
		<div class="header-group flex justify-center items-center flex-1">
			<h1 class="text-2xl font-bold leading-normal">
				<slot/>
			</h1>
		</div>
		<div class="header-group side right">

		</div>
	</header>
</template>

<script>
export default {
	props: {
		closeBtn: Boolean	
	},
	methods: {
		close() {
			if (this.$attrs.onClose) {
				this.$emit('close');
			} else {
				this.$router.go(-1);
			}
		}
	},
	computed: {
		hasBackButton() {
			return !this.$route.meta.noBackButton;
		},
		leftButtonType() {
			if (!this.hasBackButton) return null;
			if (this.closeBtn) return 'close';
			return 'arrow_back';
		}
	}
};
</script>

<style lang="postcss" scoped>
.header-group {
	@apply flex items-center;
}
.header-group.side {
	@apply w-12 flex-none px-2;
}
.header-group.left {
	@apply justify-center;
}
</style>