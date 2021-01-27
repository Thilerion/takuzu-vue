<template>
	<div class="fixed inset-0 overflow-auto flex flex-col">
		<PageHeader>New Game</PageHeader>
		<div class="px-4">
			<div class="pb-4">
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
		<div class="pb-4 mt-auto">
			<button
				class="uppercase text-sm py-3 bg-gray-700 text-white dark:bg-truegray-100 dark:text-black w-5/6 mx-auto rounded-lg"
				@click="createGame"
				:disabled="size.value == null"
			>Start a game</button>
		</div>
	<PlayGame @close="quitGame" v-if="game" />
	</div>
</template>

<script>
import DifficultySelect from '../components/DifficultySelect';
import SizeSelection from '../components/SizeSelection';
import PlayGame from '../components/board/PlayGame';

export default {
	name: 'FreePlay',
	components: {
		DifficultySelect,
		SizeSelection,
		PlayGame,
	},
	data() {
		return {
			difficultyLabels: ['Beginner', 'Normal', 'Hard', 'Very Hard', 'Extreme'],
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

			this.$store.dispatch('initGame', {width, height, difficulty});
		},
		quitGame() {
			this.$store.commit('reset');
		}
	},
	beforeRouteLeave(to, from) {
		// if game does not exist; and the playGame view is not active, just accept the route change
		if (!this.game) {
			return true;
		}
		// if the playGame view IS active, the routeChange is always denied. Depending on the modal/popup answer, the playGame view is either closed or not
		const answer = window.confirm('Do you want to quit the current game? Progress will be lost.');
		if (!answer) {
			return false;
		} else {
			this.quitGame();
			return false;
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