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
				<GameSizeSelect
					:difficulty="difficulty"
					:initial-selection="size"
					:preset-sizes="presetSizes"
					:size-types="sizeTypes"
					@select="selectSize"
					v-if="true"
				/>
			</div>
		</div>
		<div class="pb-4 mt-auto w-5/6 mx-auto">
			<div
				v-if="gameCreationError"
				class="bg-red-200 text-red-900 font-semibold rounded-lg p-1 text-xs mb-2"
				>ERROR: Game creation timed out.</div>
			<StartGameButton
				@click="createGame"
				:disable="disableStartButton"
				:gameLoading="gameLoading"
			/>
		</div>
	<PlayGame @close="quitGame" v-if="gameInitialized" />
	</div>
</template>

<script>
import DifficultySelect from '../components/DifficultySelect';
import GameSizeSelect from '../components/GameSizeSelect';
import PlayGame from '../components/board/PlayGame';
import StartGameButton from '../components/board/StartGameButton';

const sizeTypes = {
	NORMAL: 'Normal',
	ODD: 'Odd',
	RECT: 'Rectangular'
}
const presetSizes = [
	{ width: 6, height: 6, type: sizeTypes.NORMAL, maxDifficulty: 2},
	{ width: 8, height: 8, type: sizeTypes.NORMAL, maxDifficulty: 3},
	{ width: 10, height: 10, type: sizeTypes.NORMAL, maxDifficulty: 4},
	{ width: 12, height: 12, type: sizeTypes.NORMAL, maxDifficulty: 5},
	{ width: 14, height: 14, type: sizeTypes.NORMAL, maxDifficulty: 5},

	{ width: 7, height: 7, type: sizeTypes.ODD, maxDifficulty: 2},
	{ width: 9, height: 9, type: sizeTypes.ODD, maxDifficulty: 3},
	{ width: 11, height: 11, type: sizeTypes.ODD, maxDifficulty: 4},
	{ width: 13, height: 13, type: sizeTypes.ODD, maxDifficulty: 5},

	{ width: 6, height: 10, type: sizeTypes.RECT, maxDifficulty: 3},
	{ width: 8, height: 12, type: sizeTypes.RECT, maxDifficulty: 3},
	{ width: 10, height: 14, type: sizeTypes.RECT, maxDifficulty: 4},
	{ width: 10, height: 16, type: sizeTypes.RECT, maxDifficulty: 5},
	{ width: 12, height: 16, type: sizeTypes.RECT, maxDifficulty: 5},
];

const getInitialSelection = () => {
	try {
		const data = localStorage.getItem('takuzu_freeplay-selection');
		const {size, difficulty} = JSON.parse(data);
		return {size, difficulty};
	} catch {
		return {
			size: presetSizes[1],
			difficulty: 1
		}
	}
}

export default {
	name: 'FreePlay',
	components: {
		DifficultySelect,
		GameSizeSelect,
		PlayGame,
		StartGameButton,
	},
	data() {
		return {
			difficultyLabels: ['Beginner', 'Normal', 'Hard', 'Very Hard', 'Extreme'],
			presetSizes,
			sizeTypes,
			
			difficulty: null,
			size: null,
		}
	},
	computed: {
		gameInitialized() {
			return this.$store.state.game.initialized;
		},
		gameLoading() {
			return this.$store.state.game.loading;
		},
		gameCreationError() {
			return this.$store.state.game.creationError;
		},
		validSelection() {
			return this.difficulty > 0 && this.difficulty < 6 && this.size != null && this.size.width > 3 && this.size.height > 3;
		},
		invalidSelection() {
			return !this.validSelection;
		},
		disableStartButton() {
			return this.gameLoading || this.invalidSelection;
		},
		currentSelection() {
			return {
				difficulty: this.difficulty,
				size: { ...this.size }
			}
		}
	},
	methods: {
		selectStars(val) {
			this.difficulty = val;
		},
		selectSize(size) {
			this.size = size;
		},
		createGame() {
			const { width, height } = this.size;
			const difficulty = this.difficulty;

			this.$store.dispatch('initGame', { width, height, difficulty });
		},
		quitGame() {
			this.$store.commit('reset');
		}
	},
	beforeRouteLeave(to, from) {
		// if game does not exist; and the playGame view is not active, just accept the route change
		if (!this.gameInitialized) {
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
	},
	beforeMount() {
		// parse previous selection
		try {
			const { size, difficulty } = getInitialSelection();
			this.size = size;
			this.difficulty =difficulty;
		} catch(e) {
			
		}
	},
	watch: {
		currentSelection: {
			handler(newValue) {
				localStorage.setItem('takuzu_freeplay-selection', JSON.stringify(newValue));
			},
			deep: true,
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