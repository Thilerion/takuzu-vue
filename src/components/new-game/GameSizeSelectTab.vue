<template>
	<div class="flex flex-col mx-auto items-center pt-4 pb-2">
		<BaseSelectButton
			v-for="size of sizes"
			:key="size.width + 'x' + size.height"
			class="w-40"
			:disabled="size.maxDifficulty < difficulty"
			:selected="sizeEquals(selected, size)"
			@click="select(size)"
		>{{size.width}}x{{size.height}}</BaseSelectButton>
	</div>
</template>

<script>
export default {
	props: {
		sizes: {
			type: Object,
			required: true
		},
		difficulty: {
			type: Number,
			required: true
		},
		selected: {
			type: Object
		}
	},
	methods: {
		select(size) {
			this.$emit('select', size);
		},
		sizeEquals(a, b) {
			if (a === b) return true;
			if (a == null && b == null) return true;
			if (a == null || b == null) return false;
			const keys = Object.keys(a);
			for (const key of keys) {
				if (a[key] !== b[key]) return false;
			}
			return true;
		}
	}
};
</script>

<style scoped>
	
</style>