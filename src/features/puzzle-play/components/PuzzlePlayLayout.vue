<template>
<div
	class="play-puzzle fixed inset-0 max-h-vh h-dvh w-full z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white"
>
	<div class="puzzleplay-header">
		<slot name="header"></slot>
	</div>

	<PuzzlePlayGameAreaWrapper
		v-slot="{ width, height, cellSize }"
		:info-height="gameAreaSizeConfigWithDefaults.infobarHeight"
		:padding-x="gameAreaSizeConfigWithDefaults.paddingX"
		:padding-y="gameAreaSizeConfigWithDefaults.paddingY"
		:ruler-height="gameAreaSizeConfigWithDefaults.rulerSize"
		:ruler-width="gameAreaSizeConfigWithDefaults.rulerSize"
		class="puzzleplay-gameboard"
		:class="gameAreaClasses"
	>
		<slot
			name="gameboard"
			:grid-height="height"
			:grid-width="width"
			:cell-size="cellSize"
		/>
	</PuzzlePlayGameAreaWrapper>

	
	<div class="puzzleplay-footer relative">
		<slot name="footer"></slot>
	</div>

	<router-view v-slot="{ Component }">
		<OverlayPageTransition :show="Component != null">
			<div class="fixed inset-0 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white overflow-y-auto pb-8 z-40">
				<component :is="Component" />
			</div>
		</OverlayPageTransition>
	</router-view>

	<PuzzleRecap :show="showRecap" />
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	showRecap: boolean,

	gameAreaClasses?: string | string[] | Record<string, boolean>,
	gameAreaSizeConfig: {
		paddingX?: number,
		paddingY?: number,
		rulerSize: number | 'cellSize' | null,
		infobarHeight?: number | 'cellSize' | null,
	}
}>();

const gameAreaSizeConfigWithDefaults = computed(() => {
	const { paddingX, paddingY, rulerSize, infobarHeight } = props.gameAreaSizeConfig;
	return {
		paddingX: paddingX ?? 4,
		paddingY: paddingY ?? 6,
		rulerSize: rulerSize,
		infobarHeight: infobarHeight ?? 21
	};
});
</script>

<style scoped>
.play-puzzle {
	@apply grid;
	grid-template-columns: 100dvw;
	grid-template-rows: auto 1fr auto;
	grid-template-areas:
		"header"
		"gameboard"
		"footer";
}

.puzzleplay-header, .puzzleplay-gameboard, .puzzleplay-footer {
	@apply relative;
}
.puzzleplay-header {
	grid-area: header;
}
.puzzleplay-gameboard {
	grid-area: gameboard;
}
.puzzleplay-footer {
	grid-area: footer;
	@apply h-32 w-full;
}
</style>