<template>
	<div class="gameboard-view fixed overflow-hidden inset-0 flex flex-col z-20">
		<PageHeader close-btn @close="$emit('close')">
			{{columns}}x{{rows}}
		</PageHeader>
		<GameBoardWrapper>
			<GameBoard
				:rows="rows"
				:columns="columns"
				:cells="cells"
			/>
		</GameBoardWrapper>
		<div class="footer">
			<GameControls />
		</div>
	</div>
</template>

<script>
import GameBoardWrapper from './GameBoardWrapper';
import GameBoard from './GameBoard';
import GameControls from './GameControls';

import IconBtnText from '@/components/base-layout/IconBtnText';
import { EMPTY } from '../../lib/constants';
import { GAP_SIZE } from './config';

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
			gap: GAP_SIZE,
			hasBookmark: false
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
		}
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
	background: inherit;
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
</style>