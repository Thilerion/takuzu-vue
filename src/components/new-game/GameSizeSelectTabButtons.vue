<template>
	<div class="tab-wrapper">
		<button
			v-for="sizeType of sizeTypes"
			:key="sizeType"
			@click="$emit('update:modelValue', sizeType)"
			class="tab-btn"
			:class="{ active: modelValue === sizeType }"
		>
			{{sizeType}}
		</button>
		<!-- <transition> -->
		<div class="underline" :style="{'grid-column': `${idx + 1} / span 1`}"></div>
		<!-- </transition> -->
	</div>
</template>

<script>
export default {
	props: {
		sizeTypes: {
			type: Object,
			required: true
		},
		modelValue: {
			type: String,
			required: true
		}
	},
	emits: ['update:modelValue'],
	computed: {
		idx() {
			return Object.values(this.sizeTypes).findIndex(size => {
				return size === this.modelValue;
			})
		}
	},
	mounted() {
		if (this.modelValue == null) {
			const size = this.sizeTypes.NORMAL;
			// TODO: use something like a default sizeType
			this.$emit('update:modelValue', size);
		}
	}
};
</script>

<style scoped>
.tab-wrapper {
	display: grid;
	grid-template-rows: auto 2px;
	grid-template-columns: repeat(3, 1fr);

	@apply w-full;
}

.tab-btn {
	@apply p-2 focus:outline-none w-full text-sm;
	grid-row: 1 / span 1;
}
.tab-btn.active {
	@apply font-semibold text-teal-700;
}

.underline {
	grid-row: 2 / span 1;
	height: 2px;
	@apply bg-teal-600;
}
</style>