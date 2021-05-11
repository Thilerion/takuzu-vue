<template>
	<header>
		<IconBtn>close</IconBtn>
		<button @click="$emit('cycle-size')" class="font-medium tracking-widest text-xl">{{columns}}x{{rows}}</button>
		<IconBtn>more_vert</IconBtn>
	</header>
</template>

<script>
export default {
	emits: ['cycle-size'],
	props: {
		rows: Number,
		columns: Number
	}
};
</script>

<style lang="postcss" scoped>
header {
	@apply bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
	@apply flex justify-between items-center h-14 shadow-sm px-2;
}
</style>