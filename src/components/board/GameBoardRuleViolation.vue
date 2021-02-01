<template>
	<div v-if="isCellGroup" class="z-50 text-xs border-red-600 border-2 rounded pointer-events-none" :style="cells"></div>
	<template v-else-if="isLineGroup">
		<div
			v-for="line in lines"
			class="z-50 text-xs border-red-600 border-2 rounded pointer-events-none"
			:key="line.lineId"
			:style="line.style"
		></div>
	</template>
</template>

<script>
import { columnIdToX, lineTypeFromLineId, rowIdToY } from '@/lib/utils';
import { COLUMN, ROW } from '@/lib/constants';
export default {
	props: {
		value: {
			type: Object,
			required: true
		}
	},
	computed: {
		isCellGroup() {
			return this.value.cells && this.value.cells.length > 0;
		},
		isLineGroup() {
			return this.value.lineIds != null;
		},

		cells() {
			if (this.isLineGroup) return [];

			const cellStart = this.value.cells[0];
			const cellEnd = this.value.cells[this.value.cells.length - 1];

			const x0 = cellStart.x + 2;
			const x1 = cellEnd.x + 2;
			const width = (x1 - x0) + 1;

			const y0 = cellStart.y + 2;
			const y1 = cellEnd.y + 2;
			const height = (y1 - y0) + 1;

			return {
				'grid-row': `${y0} / span ${height}`,
				'grid-column': `${x0} / span ${width}`
			}
		},
		lines() {
			if (this.isCellGroup) return;

			return this.value.lineIds.map(lineId => {
				const type = lineTypeFromLineId(lineId);
				let width, height;
				let x, y;
				if (type === ROW) {
					width = this.$store.state.game.board.width;
					height = 1;
					x = 2;
					y = rowIdToY(lineId) + 2;
				} else if (type === COLUMN) {
					height = this.$store.state.game.board.height;
					width = 1;
					x = columnIdToX(lineId) + 2;
					y = 2;
				}

				return {
					lineId,
					type,
					style: {
						'grid-row': `${y} / span ${height}`,
						'grid-column': `${x} / span ${width}`
					}
				}
			})
		}
	},
};
</script>

<style lang="postcss" scoped>
	
</style>