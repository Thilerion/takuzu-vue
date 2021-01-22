<template>
	<div class="fixed inset-0 overflow-auto px-4 pb-0 pt-6 flex flex-col">
		<h1 class="text-4xl font-bold leading-normal">Free play</h1>
		<div>
			<div class="py-4">
				<h2 class="text-2xl font-light pb-2">Difficulty</h2>
				<DifficultySelect
					v-model="difficulty"
					:labels="difficultyLabels"
				/>
			</div>
			<div class="py-2">
				<h2 class="text-2xl font-light pb-2">Size</h2>
				<SizeSelection
					:difficulty="difficulty"
					v-model="size"
					:sizes="sizeOptions"
				/>
			</div>
		</div>
		<button
			class="mt-auto mb-4 dark:bg-truegray-100 dark:text-black w-5/6 mx-auto py-2 rounded-lg"
			@click="createGame"
			:disabled="size.value == null"
		>Start!</button>
	</div>
	<GameBoard @close="$store.commit('reset')" v-if="game" />
</template>

<script>
import DifficultySelect from '../components/DifficultySelect';
import SizeSelection from '../components/SizeSelection';
import GameBoard from '../components/GameBoard';

export default {
	name: 'FreePlay',
	components: {
		DifficultySelect,
		SizeSelection,
		GameBoard,
	},
	data() {
		return {
			difficultyLabels: ['Beginner', 'Normal', 'Hard', 'Expert', 'Extreme'],
			difficulty: 1,

			sizeOptions: {
				normal: [6, 8, 10, 12, 14],
				odd: [9, 11, 13],
				special: ['8x12', '10x14', '10x16', '12x16']
			},
			size: {
				type: 'normal',
				value: 8
			}
		}
	},
	computed: {
		game() {
			return this.$store.state.game.initialized;
		}
	},
	methods: {
		selectStars(val) {
			this.difficulty = val;
		},
		createGame() {
			const sizeValue = this.size.value;
			let width = sizeValue;
			let height = sizeValue;

			if (typeof sizeValue === 'string') {
				const splitSize = sizeValue.split('x').map(Number);
				width = splitSize[0];
				height = splitSize[1];
			}
			const difficulty = this.difficulty;

			console.log('START GAME!');
			console.log({difficulty, width, height});

			this.$store.dispatch('initGame', {width, height, difficulty});
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

.disabled {
	background: blue;
}

button:disabled {
	background: blue;
}
</style>