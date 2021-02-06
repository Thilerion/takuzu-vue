<template>
	<div class="p-4 flex flex-col items-center bg-gray-100 min-h-screen">
		<div class="button-col">
			<BaseButton>Click here!</BaseButton>
			<BaseButton class="btn-primary">Primary</BaseButton>
		</div>
	</div>
</template>

<script>
export default {
	
};
</script>

<style lang="postcss" scoped>
.button-col {
	@apply flex flex-col items-center;
}
.button-col > * {
	@apply mb-4;
}
</style>