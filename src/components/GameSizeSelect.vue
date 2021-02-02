<template>
	<div>
		<button
			v-for="sizeType of sizeTypes"
			:key="sizeType"
			@click="currentTab = sizeType"
		>
			{{sizeType}}
		</button>

		<GameSizeSelectTab
			v-for="sizeType of Object.values(sizeTypes)"
			:key="sizeType"
			:sizes="presetSizes.filter(size => size.type === sizeType)"
			:difficulty="difficulty"
			:selected="selectedPerTab[sizeType]"
			v-show="sizeType === currentTab"
			@select="selectSize"
		/>
	</div>
</template>

<script>
import GameSizeSelectTab from './GameSizeSelectTab';

// gets previous selection from parent

export default {
	components: {
		GameSizeSelectTab,
	},
	props: {
		difficulty: {
			type: Number,
			required: true
		},
		initialSelection: {
			type: Object
		},
		presetSizes: {
			type: Array,
			required: true
		},
		sizeTypes: {
			type: Object,
			required: true
		}
	},
	emits: ['select'],
	data() {
		return {
			currentTab: this.sizeTypes.NORMAL,
			selectedPerTab: {
				[this.sizeTypes.NORMAL]: null,
				[this.sizeTypes.ODD]: null,
				[this.sizeTypes.RECT]: null
			}
		}
	},
	computed: {
		selected() {
			return this.selectedPerTab[this.currentTab];
		}
	},
	methods: {
		selectSize(size) {
			this.selectedPerTab[this.currentTab] = size;
		},
		checkSelectedSizeDifficulty() {
			if (this.selected == null) return;
			if (this.selected.maxDifficulty < this.difficulty) {
				this.selectSize(null);
			}
		}
	},
	watch: {
		difficulty: {
			handler() {
				this.checkSelectedSizeDifficulty();
			},
			immediate: true
		},
		currentTab() {
			this.checkSelectedSizeDifficulty();
		},
		selected() {
			this.$emit('select', this.selected);
		}
	},
	beforeMount() {
		if (this.initialSelection) {
			console.log('setting initial selection', this.initialSelection);
			const type = this.initialSelection.type;
			this.currentTab = type;
			this.selectSize(this.initialSelection);
		} else {
			console.log('no initial selection');
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>