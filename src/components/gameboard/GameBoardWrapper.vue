<template>
<div class="main justify-center items-center relative" ref="container">
	<div
		class="puzzle-wrapper"
		:class="[`cell-size-${gridGapSizing}`]"
	>		<slot v-bind="puzzleGridDimensions" />
	</div>
</div>
</template>

<script>
import { computed, ref, toRefs } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { usePuzzleStore } from '@/stores/puzzle.js';

export default {
	props: {
        rulerHeight: String,
        rulerWidth: String,
        infoHeight: String,
        paddingX: {
            type: String,
            default: "4px"
        },
        paddingY: {
            type: String,
            default: "6px"
        },
    },
    setup(props) {
		const { rulerHeight, rulerWidth, infoHeight, paddingX, paddingY } = toRefs(props);

        const container = ref(null);
		const pStore = usePuzzleStore();
        const rows = computed(() => pStore.height);
        const columns = computed(() => pStore.width);

      	// use sensible defaults
		const width = ref(window.clientWidth * 0.98);
		const height = ref(window.clientHeight - 150);

        useResizeObserver(container, (entries) => {
			try {
				const el = entries[0];
				const { inlineSize, blockSize } = el.contentBoxSize[0];
				width.value = inlineSize;
				height.value = blockSize;
			} catch {}
		})

		const rowsWithRuler = computed(() => {
			if (rulerHeight.value === 'cellSize') {
				return rows.value + 1;
			}
			return rows.value;
		})
		const columnsWithRuler = computed(() => {
			if (rulerWidth.value === 'cellSize') {
				return columns.value + 1;
			}
			return columns.value;
		})

		const aspectRatio = computed(() => {
			return columnsWithRuler.value / rowsWithRuler.value;
		})

		function getPxValue(str = '0px') {
			return str.slice(0, -2) * 1;
		}

		const unavailableHeight = computed(() => {
			return [
				rulerHeight.value,
				infoHeight.value,
				paddingY.value,
				paddingY.value
			].reduce((total, pxVal) => {
				if (pxVal === 'cellSize') return total;
				return total + getPxValue(pxVal);
			}, 0)
		})
		const unavailableWidth = computed(() => {
			return [
				rulerWidth.value,
				paddingX.value,
				paddingX.value
			].reduce((total, pxVal) => {
				if (pxVal === 'cellSize') return total;
				return total + getPxValue(pxVal);
			}, 0)
		})

		const maxWidth = computed(() => width.value - unavailableWidth.value);
		const maxHeight = computed(() => height.value - unavailableHeight.value);

		const puzzleGridDimensions = computed(() => {
			const heightA = maxWidth.value / aspectRatio.value;
            if (heightA < maxHeight.value) {
                let cellSize = Math.floor(heightA / rowsWithRuler.value);
                if (cellSize < 12)
                    cellSize = 12;
                if (cellSize > 80)
                    cellSize = 80;
                const w = cellSize * columns.value;
                const h = cellSize * rows.value;
                return { width: w + "px", height: h + "px", cellSize };
            }
            const widthB = maxHeight.value * aspectRatio.value;
            let cellSize = Math.floor(widthB / columnsWithRuler.value);
            if (cellSize < 12)
                cellSize = 12;
            if (cellSize > 80)
                cellSize = 80;
            const w = cellSize * columns.value;
            const h = cellSize * rows.value;
            return { width: w + "px", height: h + "px", cellSize };
		})

		const gridGapSizing = computed(() => {
			const { cellSize } = puzzleGridDimensions.value;
			if (cellSize <= 26) {
                return "xs";
            } else if (cellSize <= 38) {
                return "s";
            } else if (cellSize <= 52) {
                return "m";
            } else if (cellSize <= 74) {
                return "l";
            } else {
                return "xl";
            }
		})

        return {
			heightUnavailable: unavailableHeight,
			widthUnavailable: unavailableWidth,
            rows,
            columns,
            container,
			puzzleGridDimensions,
			gridGapSizing
        };
    }
};
</script>

<style scoped>
.main {
	@apply flex-1 flex flex-col;
	overflow: hidden;

	--unavail-height: v-bind(heightUnavailable);
	--unavail-width: v-bind(widthUnavailable);
	--rows: v-bind(rows);
	--columns: v-bind(columns);
	--aspect-ratio: calc(var(--columns) / var(--rows));
}

.puzzle-wrapper {
	/* default grid gap for puzzle-grid and rulers */
	--grid-gap: 2px;
	--cell-rounding: 2px;
}
.puzzle-wrapper.cell-size-xs {
	--grid-gap: 1px;
	--cell-rounding: 0px;
}
.puzzle-wrapper.cell-size-s {
	--grid-gap: 1px;
	--cell-rounding: 2px;
}
.puzzle-wrapper.cell-size-m {
	--grid-gap: 2px;
	--cell-rounding: 2px;
}
.puzzle-wrapper.cell-size-l {
	--grid-gap: 3px;
	--cell-rounding: 3px;
}
.puzzle-wrapper.cell-size-xl {
	--grid-gap: 4px;
	--cell-rounding: 4px;
}
</style>