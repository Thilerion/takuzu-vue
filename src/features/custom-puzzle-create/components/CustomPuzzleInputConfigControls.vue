<template>
<div>
	<header>Puzzle dimensions</header>
	<button @click="expanded = !expanded">Expand</button>
	<ExpandTransition :duration="300" :show="expanded">
		<div>
			<div class="flex flex-row gap-x-4">
				<div class="flex flex-col">
					<label for="widthInput">Width</label>
					<input
						id="widthInput"
						v-model.number="inputWidth"
						type="number"
						name="width"
						min="4"
						max="16"
						class="p-2 text-sm min-w-[3.5rem] min-h-8 rounded border-gray-400"
					>
				</div>
				<div class="self-end py-2">x</div>
				<div class="flex flex-col">
					<label for="heightInput">Height</label>
					<input
						id="heightInput"
						v-model.number="inputHeight"
						type="number"
						name="height"
						min="4"
						max="16"
						class="p-2 text-sm min-w-[3.5rem] min-h-[2rem] rounded border-gray-400 disabled:text-gray-600 disabled:bg-gray-100 disabled:border-gray-400/70"
						:disabled="inputForceSquareGrid"
					>
				</div>
			</div>
			<label class="py-2 inline-flex items-center gap-x-2 text-sm">
				<input
					id="squareGridToggle"
					v-model="inputForceSquareGrid"
					type="checkbox"
					name="squareGrid"
				>
				Force square grid
			</label>
			<div class="flex flex-row gap-2">
				<BaseButton @click="onCreateUpdate">
					<span v-if="gridExists">Update</span>
					<span v-else>Create</span>
				</BaseButton>
				<BaseButton @click="onReset">Reset</BaseButton>
			</div>
		</div>
	</ExpandTransition>
</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCustomPuzzleInputGrid } from '../composables/custom-input-grid.js';

const expanded = defineModel<boolean>('expanded', { required: true });

const { width, height, forceSquareGrid, customPuzzleGrid, resetGrid, updateDimensions } = useCustomPuzzleInputGrid();

// Set width, height, forceSquareGrid locally, which can be set when "update" or "reset" is clicked
const inputWidth = ref(width.value);
const inputHeight = ref(height.value);
const inputForceSquareGrid = ref(false);

watch(inputWidth, (width) => {
	if (inputForceSquareGrid.value) {
		inputHeight.value = width;
	}
})
watch(inputHeight, (height) => {
	if (inputForceSquareGrid.value) {
		inputWidth.value = height;
	}
})
watch(inputForceSquareGrid, (forceSquareGrid) => {
	if (forceSquareGrid) {
		inputHeight.value = inputWidth.value;
	}
})
watch([width, height, forceSquareGrid], () => {
	inputWidth.value = width.value;
	inputHeight.value = height.value;
	inputForceSquareGrid.value = forceSquareGrid.value;
})

const setUpdatedConfig = () => {
	forceSquareGrid.value = inputForceSquareGrid.value;
	width.value = inputWidth.value;
	height.value = inputHeight.value;
}

const gridExists = computed(() => customPuzzleGrid.value !== null);
const onCreateUpdate = () => {
	const gridExistsBefore = gridExists.value;
	setUpdatedConfig();
	updateDimensions();
	if (!gridExistsBefore) {
		expanded.value = false;
	}
}
const onReset = () => {
	setUpdatedConfig();
	resetGrid();
}
</script>