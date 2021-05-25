<template>
	<BaseModal prevent-close auto-open ref="modal">
		<div>
			Good job! You finished the puzzle!
			<button @click="emitClose">Go back</button>
		</div>
	</BaseModal>
</template>

<script>
import BaseModal from '@/components/global/BaseModal';
export default {
	components: {
		BaseModal,
	},
	emits: ['exit-game'],
	methods: {
		emitClose() {
			setTimeout(() => {
				this.$emit('exit-game');
				this.$refs.modal.close();
			}, 400);
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>