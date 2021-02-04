<template>
	<div class="gameboard-view fixed overflow-hidden inset-0 flex flex-col z-20">
		<PageHeader close-btn @close="$emit('close')">
			{{columns}}x{{rows}}
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

import {disableWakeLock, enableWakeLock, getWakeLockState} from '../../services/wake-lock';

export default {
	components: {
		GameBoardWrapper,
		GameBoard,
		GameControls,
		IconBtnText
	},
	data() {
		return {

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
		}
	},
	methods: {
		async enableWakeLock() {
			try {
				await enableWakeLock();
			} catch(e) {
				console.error(e);
			}
		},
		async reacquireWakeLock() {
			const state = getWakeLockState();
			const { isReleased, ref } = state;
			if (ref !== null && isReleased) {
				disableWakeLock();
				enableWakeLock();
			}
		},
		visibilityChange() {
			const { isReleased, ref } = getWakeLockState();
			if (!isReleased || ref == null) return;
			if (document.visibilityState !== 'visible') return;
			// Documnet is visible again, and wakeLock is released => reenable wakelock
			this.reacquireWakeLock();
		},
		enableErrorCheckIndicator({ hasErrors }) {
			this.errorCheckValue = !!hasErrors;
		},
	},
	beforeMount() {
		if (this.shouldEnableWakeLock) {
			this.enableWakeLock();
			document.addEventListener('visibilitychange', this.visibilityChange);
		}
	},
	beforeUnmount() {
		const { ref } = getWakeLockState();
		if (ref != null) {
			disableWakeLock();
		}
		document.removeEventListener('visibilitychange', this.visibilityChange);
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
	@apply h-24 flex-none px-6 flex items-center justify-center text-gray-700;
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