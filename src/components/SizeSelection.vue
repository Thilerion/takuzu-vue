<template>
	<div class="inline-block">
		<div class="tabs">
			<button
				v-for="tab in tabs"
				:key="tab"
				class="py-2 px-4 inline-block dark:bg-gray-700"
				:class="{ selected: tab === selectedTab }"
				@click="selectTab(tab)"
			>{{ tab }}</button>
		</div>
		<div class="sizes flex flex-col">
			<button
				v-for="size in sizesForTab"
				:key="size"
				class="dark:text-black dark:bg-gray-200 border rounded h-8 px-2 mt-2 dark:border-gray-800"
				:disabled="disabledSizes.includes(size)"
				:class="{ 
					selected: size === selectedSizes[selectedTab]
				}"
				@click="selectSize(size)"
			>{{size}}</button>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		difficulty: {
			type: Number,
			required: true
		},
		sizes: {
			type: Object,
			required: true
		},
		modelValue: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			selectedSizes: {
				normal: 8,
				odd: 9,
				special: '8x12'
			}
		}
	},
	computed: {
		tabs() {
			return Object.keys(this.sizes);
		},
		selectedTab() {
			return this.modelValue.type;
		},

		sizesForTab() {
			return this.sizes[this.selectedTab];
		},

		disabledSizes() {
			const sizes = this.sizesForTab;
			return sizes.filter((size) => {
				let w, h;
				if (typeof size === 'string') {
					const trueSizes = size.split('x').map(Number);
					w = trueSizes[0];
					h = trueSizes[1];
				} else {
					w = h = size;
				}
				const numCells = w * h;
				if (this.difficulty > 2 && numCells < 40) return true;
				if (this.difficulty > 3 && numCells < 122) return true;
				if (this.difficulty > 4 && numCells < 141) return true;
				return false;
			})
		}
	},
	methods: {
		selectSize(size) {
			this.selectedSizes[this.selectedTab] = size;
			this.$emit('update:modelValue', {
				type: this.selectedTab,
				value: size
			})
		},
		selectTab(tab) {
			const value = this.selectedSizes[tab];
			this.$emit('update:modelValue', {
				type: tab,
				value
			})
		},
		validateSizeEnabled(value) {
			if (this.disabledSizes.includes(value)) {
				console.warn('Size is disabled...');
				this.$emit('update:modelValue', {
					type: this.selectedTab,
					value: null
				})
			}
		}
	},
	watch: {
		modelValue: {
			handler(newValue) {
				const {type, value} = this.modelValue;
				this.selectedSizes[type] = value;

				this.validateSizeEnabled(value);
			},
			deep: true,
			immediate: true
		},
		difficulty(newValue) {
			this.validateSizeEnabled(this.modelValue.value);
		}
	}
};
</script>

<style lang="postcss" scoped>
.tabs > .selected {
	@apply dark:bg-gray-200 dark:text-yellow-800;
}
.sizes > .selected {
	@apply dark:bg-yellow-700 dark:text-white;
}

.sizes button:disabled {
	background: rgb(168, 168, 168);
	color: rgb(97, 97, 97);
}
</style>