<template>
	<div class="flex flex-row justify-center items-center fixed bottom-0 pointer-events-auto w-screen">
		<BottomNav @set-footer-height="updateFooterHeight" />
	</div>
</template>

<script>
import BottomNav from '@/components/base-layout/BottomNav';
export default {
	components: {
		BottomNav,
	},
	props: ['modelValue'],
	methods: {
		updateFooterHeight(newValue) {
			this.$emit('update:modelValue', newValue);
		}
	}
};
</script>

<style lang="postcss" scoped>

</style>