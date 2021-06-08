<template>
	<div>
		<GameSizeSelectTabButtons
			:sizeTypes="sizeTypes"
			v-model="currentTab"
		/>

		<GameSizeSelectTab
			v-for="sizeType of Object.values(sizeTypes)"
			:key="sizeType"
			:sizes="presetSizes.filter(size => size.type === sizeType)"
			:difficulty="propDifficulty"
			:selected="selectedPerTab[sizeType]"
			v-show="sizeType === currentTab"
			@select="selectSize"
		/>
	</div>
</template>

<script>
import GameSizeSelectTab from './GameSizeSelectTab';
import GameSizeSelectTabButtons from './GameSizeSelectTabButtons';

// gets previous selection from parent

export default {
	components: {
		GameSizeSelectTab,
		GameSizeSelectTabButtons,
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
		},
		overrideMaxDifficulty: {
			type: Boolean
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
		},
		propDifficulty() {
			if (this.overrideMaxDifficulty) return 0;
			return this.difficulty;
		}
	},
	methods: {
		selectSize(size) {
			this.selectedPerTab[this.currentTab] = size;
		},
		checkSelectedSizeDifficulty() {
			if (this.selected == null) return;
			if (this.overrideMaxDifficulty) return;
			if (this.selected.maxDifficulty < this.difficulty) {
				this.selectSize(null);
			}
		}
	},
	watch: {
		difficulty: {
			handler() {
				if (this.overrideMaxDifficulty) return;
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