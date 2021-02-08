<template>
	<div class="gameboard-view fixed overflow-hidden inset-0 flex flex-col z-20">
		<PageHeader close-btn @close="$emit('close')">
			{{columns}}x{{rows}}
			<template #right>
				<BaseDropdown align-right align-below>
					<template #trigger="{open}">
						<IconBtn @click="open">more_vert</IconBtn>
					</template>
					<template #content>
						<BaseDropdownItem>Set bookmark</BaseDropdownItem>
						<BaseDropdownItem>Delete bookmark</BaseDropdownItem>
						<BaseDropdownDivider/>
						<BaseDropdownItem>Settings</BaseDropdownItem>
					</template>
				</BaseDropdown>
			</template>
		</PageHeader>
		<GameBoardWrapper v-if="board">
			<GameBoard
				:rows="rows"
				:columns="columns"
				:cells="cells"
			/>
			<transition name="checked" @after-enter="errorCheckValue = null">
				<div class="check-indicator" v-if="errorCheckValue != null" :class="{correct: !errorCheckValue, incorrect: errorCheckValue}">
					<div class="check-icon-wrapper">
						<span v-if="!errorCheckValue" class="check-icon material-icons">check</span>
						<span v-else class="check-icon material-icons">close</span>
					</div>
				</div>
			</transition>
		</GameBoardWrapper>
		<div class="footer">
			<GameControls @error-check="enableErrorCheckIndicator" />
		</div>
	</div>
</template>

<script>
import GameBoardWrapper from './GameBoardWrapper';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import IconBtnText from '@/components/base-layout/IconBtnText';

import { EMPTY } from '../../lib/constants';

import WakeLock from '../../services/wake-lock';
import { deleteCurrentSavedGame, hasCurrentSavedGame, saveCurrentGame } from '@/services/save-game';
  
const wakeLock = new WakeLock();

export default {
	components: {
		GameBoardWrapper,
		GameBoard,
		GameControls,
		IconBtnText
	},
	data() {
		return {
			wakeLock,
			wakeLockErr: null,
			wakeLockEnabled: false,

			errorChecked: false,
			errorCheckValue: null,
		}
	},
	computed: {
		board() {
			return this.$store.state.game.board;
		},
		grid() {
			return this.board.grid;
		},
		cells() {
			return [...this.board.cells()].map(({x, y, value}, idx) => {
				return {
					x, y, 
					value: value === EMPTY ? null : value,
					idx
				};
			});
		},
		rows() {
			return this.$store.state.game.height;
		},
		columns() {
			return this.$store.state.game.width;
		},
		numCells() {
			return this.rows * this.columns;
		},
		shouldEnableWakeLock() {
			return this.$store.state.settings.enableWakeLock;
		},
		canSaveGame() {
			return this.$store.getters.canSave;
		}
	},
	methods: {
		async enableWakeLock() {
			try {
				await this.wakeLock.enable();
				this.wakeLockErr = null;
			} catch(e) {
				this.wakeLockErr = e;
			}
		},
		enableErrorCheckIndicator({ hasErrors }) {
			this.errorCheckValue = !!hasErrors;
		},
	},
	beforeMount() {
		if (this.shouldEnableWakeLock) {
			this.enableWakeLock();
			this.wakeLock.onChange = (isEnabled) => this.wakeLockEnabled = !!isEnabled;
		}
	},
	unmounted() {
		this.wakeLock.destroy();
	},
	watch: {
		board: {
			handler() {
				if (!this.canSaveGame) {
					console.log('Game cannot be saved');
				} else {
					const state = this.$store.state.game;
					console.log('saving current game');
					saveCurrentGame(state);
				}
			},
			deep: true,
			immediate: true
		}
	}
};
</script>

<style lang="postcss" scoped>
.gameboard-view {
	@apply text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-50;
}

.header {
	@apply flex-none grid;
}
.footer {
	@apply h-24 flex-none px-6 flex flex-col items-center justify-center text-gray-700;
}

.board {
	display: inline-grid;
	font-size: var(--cell-font-size);
	gap: var(--grid-gap);

	grid-template-rows: var(--line-helper-size) repeat(var(--board-rows), 1fr) 0px;
	grid-template-columns: var(--line-helper-size) repeat(var(--board-cols), 1fr) 0px;
}


.check-indicator {
	@apply absolute inset-0 z-30 opacity-50 flex justify-center items-center pointer-events-none;
}
.check-indicator.correct {
	@apply  text-green-600;
}
.check-indicator.incorrect {
	@apply  text-red-700;
}
.check-icon-wrapper {
	@apply p-6 border-8 rounded-full;
	border-width: 12px;
}
.correct .check-icon-wrapper {
	@apply border-green-600;
}
.incorrect .check-icon-wrapper {
	@apply border-red-700;
}
.check-indicator .check-icon {
	@apply text-8xl font-black leading-none;
}
.checked-enter-active {

}
.checked-leave-active {
	transition: opacity 1.5s ease;
}
.checked-leave-to, .checked-enter-from {
	opacity: 0;
}
</style>