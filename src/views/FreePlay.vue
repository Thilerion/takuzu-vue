<template>
	<div class="fixed inset-0 overflow-auto px-4 pb-0 pt-6">
		<h1 class="text-4xl font-bold">Free play</h1>
		<div>
			<div>
				<h2 class="text-2xl my-3">Select difficulty</h2>
				<DifficultySelect
					v-model="difficulty"
					:labels="difficultyLabels"
				/>
			</div>
			<div>
				<h2 class="text-2xl my-3">Select size</h2>
			</div>
		</div>
	</div>
</template>

<script>
import DifficultySelect from '../components/DifficultySelect';

export default {
	name: 'FreePlay',
	components: {
		DifficultySelect
	},
	data() {
		return {
			difficultyLabels: ['Beginner', 'Normal', 'Hard', 'Expert', 'Extreme'],
			difficulty: 1,

			sizeOptions: ['6x6', '8x8', '10x10'],
			size: '6x6'
		}
	},
	methods: {
		selectStars(val) {
			this.difficulty = val;
		}
	}
}
</script>

<style scoped>
.difficulty-btn > * {
	@apply mr-1;
}
.difficulty-btn > *:last-child {
	@apply mr-0;
}
</style>