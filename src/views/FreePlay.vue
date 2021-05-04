<template>
	<div class="freeplay flex flex-col overflow-x-hidden">
		<PageHeader>New Game</PageHeader>
		<div>
			<div class="pb-4 px-6">
				<h2 class="text-2xl font-light pb-2 px-2">Difficulty</h2>
				<DifficultySelect
					v-model="difficulty"
					:labels="difficultyLabels"
				/>
			</div>
			<div class="py-2">
				<h2 class="text-2xl font-light pb-2 px-8">Size</h2>
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
				:selection="{ difficulty: difficultyLabels[difficulty - 1], size }"
			/>
		</div>
		<OverlayPageTransition :disable="disableGameBoardTransition">
			<PlayGame @close="quitGame" v-if="gameInitialized" />
		</OverlayPageTransition>
	</div>
</template>

<script>
import DifficultySelect from '@/components/new-game/DifficultySelect';
import GameSizeSelect from '@/components/new-game/GameSizeSelect';
import PlayGame from '@/components/play-game/PlayGame';
import StartGameButton from '@/components/board/StartGameButton';
import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';

import { hasCurrentSavedGame } from '@/services/save-game';
import { boardTypes, PRESET_BOARD_SIZES } from '@/config';

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
		OverlayPageTransition,
	},
	setup() {
		return {
			presetSizes: PRESET_BOARD_SIZES,
			sizeTypes: boardTypes,
		}
	},
	data() {
		return {
			difficultyLabels: ['Beginner', 'Normal', 'Hard', 'Very Hard', 'Extreme'],
			
			difficulty: null,
			size: null,

			disableGameBoardTransition: false,
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
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if (to.query.continue) {

				if (hasCurrentSavedGame() && !vm.gameInitialized) {
					console.log('loading saved game');
					vm.$store.dispatch('loadSaved');
					// to prevent a double transition; FreePlay and PlayGame both use enter transition
					vm.disableGameBoardTransition = true;
					setTimeout(() => {
						vm.disableGameBoardTransition = false;
					}, 400);
					return;
				} else {
					vm.$router.replace({query: null});
				}
			};
			vm.disableGameBoardTransition = false;
		})
	},
	beforeRouteLeave(to, from) {
		// if game does not exist; and the playGame view is not active, just accept the route change
		if (!this.gameInitialized) {
			return true;
		}
		this.quitGame();
		return false;
	},
	async beforeMount() {
		// parse previous selection
		try {
			const { size, difficulty } = getInitialSelection();
			this.size = size;
			this.difficulty =difficulty;
		} catch {}
	},
	watch: {
		currentSelection: {
			handler(newValue) {
				localStorage.setItem('takuzu_freeplay-selection', JSON.stringify(newValue));
			},
			deep: true,
		},
		gameInitialized(newValue) {
			if (!newValue && this.$route.query.continue) {
				this.$router.replace({query: null});
			}
		}
	}
}
</script>

<style scoped lang="postcss">
.freeplay {
	height: var(--vw-height);
	z-index: 100;
	width: 100vw;
	position: fixed;
	top: 0;
	overflow: hidden;
	@apply text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-50;
}
.difficulty-btn > * {
	@apply mr-1;
}
.difficulty-btn > *:last-child {
	@apply mr-0;
}
</style>