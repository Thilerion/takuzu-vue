<template>
<div>
	<ExpandTransition :duration="300" :show="expanded">
		<div>
			<div class="flex flex-row gap-x-3">
				<div class="flex flex-col">
					<label for="widthInput">{{ $t('PuzzleEditor.configure-board.width') }}</label>
					<input
						id="widthInput"
						v-model.number="inputWidth"
						:class="{ 'border-red-500 bg-red-100': displayedCompatibilityError || displayedWidthError }"
						type="number"
						name="width"
						min="4"
						max="16"
						class="p-2 text-sm min-w-[3.5rem] min-h-8 rounded border-gray-400"
					>
				</div>
				<div class="h-8 self-end">
					<button
						class="my-auto text-lg text-gray-600 w-6 h-6 aspect-square flex items-center justify-center"
						@click="inputForceSquareGrid = !inputForceSquareGrid"
					>
						<icon-material-symbols-link v-if="inputForceSquareGrid" />
						<icon-material-symbols-link-off v-else class="opacity-50 text-base" />
					</button>
				</div>
				
				<div class="flex flex-col">
					<label for="heightInput">{{ $t('PuzzleEditor.configure-board.height') }}</label>
					<input
						id="heightInput"
						v-model.number="inputHeight"
						:class="{ 'border-red-500 bg-red-100': displayedCompatibilityError || displayedHeightError }"	
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
				{{ $t('PuzzleEditor.configure-board.force-square-grid') }}
			</label>
			<div class="flex flex-row gap-2 pb-2 flex-wrap">
				<BaseButton
					v-if="gridExists"
					:disabled="areDimensionsUnchanged || isWidthInvalid || isHeightInvalid"
					@click="onCreateUpdate"
				>{{ $t('PuzzleEditor.configure-board.resize') }}</BaseButton>
				<BaseButton
					v-if="gridExists"
					:disabled="isWidthInvalid || isHeightInvalid"
					@click="onReset"
				>{{ $t('PuzzleEditor.configure-board.new-puzzle') }}</BaseButton>
				<BaseButton
					v-if="!gridExists"
					:disabled="isWidthInvalid || isHeightInvalid"
					@click="onCreateUpdate"
				>{{ $t('PuzzleEditor.configure-board.new-puzzle') }}</BaseButton>
				<BaseButton @click="showImportStringDialog = !showImportStringDialog">{{ $t('PuzzleEditor.import.import-from-string') }}</BaseButton>
				<CustomPuzzleInputImportString
					v-if="showImportStringDialog"
					v-model:show="showImportStringDialog"
					@parsed="onImportStringParsed"
				/>
			</div>
			<p class="leading-relaxed min-h-[0.5lh] text-red-700 text-xs tracking-wide">
				<span v-if="displayedErrorMessage != null">{{ displayedErrorMessage }}</span>
			</p>
		</div>
	</ExpandTransition>
</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCustomPuzzleInputGrid } from '../composables/custom-input-grid.js';
import { CUSTOM_PUZZLE_MAX_SIZE, CUSTOM_PUZZLE_MIN_SIZE, validateCustomPuzzleDimensions, type CustomPuzzleDimensionsInvalidResultType } from '../services/validate-dimensions.js';
import type { ParsedCustomPuzzleString } from '../services/string-conversions/import.js';
import { awaitRaf } from '@/utils/delay.utils.js';
import { useI18n } from 'vue-i18n';

const expanded = defineModel<boolean>('expanded', { required: true });
const showImportStringDialog = ref(false);
watch(expanded, (isExpanded) => {
	if (!isExpanded) {
		showImportStringDialog.value = false;
	}
})

type IncompatibleValidationType = Extract<CustomPuzzleDimensionsInvalidResultType, `incompatible:${string}`>;
type NonIncompatibleValidationType = Exclude<CustomPuzzleDimensionsInvalidResultType, IncompatibleValidationType>;

const displayedCompatibilityError = ref<null | IncompatibleValidationType>(null);
const displayedWidthError = ref<null | NonIncompatibleValidationType>(null);
const displayedHeightError = ref<null | NonIncompatibleValidationType>(null);

const { t } = useI18n();
const displayedErrorMessage = computed(() => {
	// Prioritize compatibility error
	if (displayedCompatibilityError.value != null) {
		const type = displayedCompatibilityError.value;
		switch(type) {
			case 'incompatible:odd': {
				return t('PuzzleEditor.dimensions.error.incompatible-odd');
			}
			case 'incompatible:ratio': {
				return t('PuzzleEditor.dimensions.error.incompatible-ratio');
			}
			default: {
				const x: never = type;
				throw new Error(`Unhandled type: ${x}`);
			}
		}
	}

	const hasWidthError = displayedWidthError.value != null;
	const hasHeightError = displayedHeightError.value != null;
	const hasBothErrors = hasWidthError && hasHeightError;

	if (hasBothErrors) {
		const type = displayedWidthError.value!; // pick any of both, always the same
		switch(type) {
			case 'range': {
				return t('PuzzleEditor.dimensions.error.range.both', { min: CUSTOM_PUZZLE_MIN_SIZE, max: CUSTOM_PUZZLE_MAX_SIZE });
			}
			case 'non-integer': {
				return t('PuzzleEditor.dimensions.error.non-integer.both');
			}
			default: {
				const x: never = type;
				throw new Error(`Unhandled type: ${x}`);
			}
		}
	} else if (hasWidthError) {
		const type = displayedWidthError.value!;
		switch(type) {
			case 'range': {
				return t('PuzzleEditor.dimensions.error.range.width', { min: CUSTOM_PUZZLE_MIN_SIZE, max: CUSTOM_PUZZLE_MAX_SIZE });
			}
			case 'non-integer': {
				return t('PuzzleEditor.dimensions.error.non-integer.width');
			}
			default: {
				const x: never = type;
				throw new Error(`Unhandled type: ${x}`);
			}
		}
	} else if (hasHeightError) {
		const type = displayedHeightError.value!;
		switch(type) {
			case 'range': {
				return t('PuzzleEditor.dimensions.error.range.height', { min: CUSTOM_PUZZLE_MIN_SIZE, max: CUSTOM_PUZZLE_MAX_SIZE });
			}
			case 'non-integer': {
				return t('PuzzleEditor.dimensions.error.non-integer.height');
			}
			default: {
				const x: never = type;
				throw new Error(`Unhandled type: ${x}`);
			}
		}
	}

	return null;
})

const { width, height, forceSquareGrid, customPuzzleGrid, resetGrid, updateDimensions } = useCustomPuzzleInputGrid();

// Set width, height, forceSquareGrid locally, which can be set when "update" or "reset" is clicked
const inputWidth = ref(width.value);
const inputHeight = ref(height.value);
const inputForceSquareGrid = ref(forceSquareGrid.value);

const areDimensionsUnchanged = computed(() => {
	return inputWidth.value === width.value && inputHeight.value === height.value;
});

const dimensionsValidationResult = computed(() => {
	return validateCustomPuzzleDimensions({
		width: inputWidth.value,
		height: inputHeight.value,
	});
})
const hasValidityError = computed(() => {
	return !dimensionsValidationResult.value.valid;
});
const validityErrorType = computed((): CustomPuzzleDimensionsInvalidResultType | null => {
	if (dimensionsValidationResult.value.valid) return null;
	return dimensionsValidationResult.value.type;
})

const isCompatibilityInvalid = computed(() => {
	if (dimensionsValidationResult.value.valid) return false;
	const type = dimensionsValidationResult.value.type;
	switch(type) {
		case 'range':
		case 'non-integer':
			return false;
		case 'incompatible:odd':
		case 'incompatible:ratio':
			return true;
		default: {
			const x: never = type;
			console.warn(`Unhandled type: ${x}`);
			return false;
		}
	}
})
const isWidthInvalid = computed(() => {
	if (dimensionsValidationResult.value.valid) return false;
	const type = dimensionsValidationResult.value.type;
	switch(type) {
		case 'range':
			return dimensionsValidationResult.value.width !== null;
		case 'non-integer':
			return dimensionsValidationResult.value.width !== null;
		case 'incompatible:odd':
		case 'incompatible:ratio':
			return false;
		default: {
			const x: never = type;
			console.warn(`Unhandled type: ${x}`);
			return false;
		}
	}
})
const isHeightInvalid = computed(() => {
	if (dimensionsValidationResult.value.valid) return false;
	const type = dimensionsValidationResult.value.type;
	switch(type) {
		case 'range':
			return dimensionsValidationResult.value.height !== null;
		case 'non-integer':
			return dimensionsValidationResult.value.height !== null;
		case 'incompatible:odd':
		case 'incompatible:ratio':
			return false;
		default: {
			const x: never = type;
			console.warn(`Unhandled type: ${x}`);
			return false;
		}
	}
})

watch(inputWidth, async (width) => {
	if (inputForceSquareGrid.value) {
		inputHeight.value = width;
	}
	// Hide the width+height compatibility error if width input is changed
	displayedCompatibilityError.value = null;
	// The width-only input error gets shown/hidden whenever the input changes
	if (isWidthInvalid.value) {
		displayedWidthError.value = validityErrorType.value as NonIncompatibleValidationType;
	} else {
		displayedWidthError.value = null;
	}
})
watch(inputHeight, async (height) => {
	if (inputForceSquareGrid.value) {
		inputWidth.value = height;
	}
	// Hide the width+height compatibility error if height input is changed
	displayedCompatibilityError.value = null;
	// The height-only input error gets shown/hidden whenever the input changes
	if (isHeightInvalid.value) {
		displayedHeightError.value = validityErrorType.value as NonIncompatibleValidationType;
	} else {
		displayedHeightError.value = null;
	}
})
watch(inputForceSquareGrid, async (forceSquareGrid) => {
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

const updateDisplayedErrors = () => {
	if (isCompatibilityInvalid.value) {
		const t = validityErrorType.value;
		if (t != null && t.startsWith('incompatible:')) {
			displayedCompatibilityError.value = t as IncompatibleValidationType;
		}
	} else {
		displayedCompatibilityError.value = null;
	}

	if (isWidthInvalid.value) {
		displayedWidthError.value = validityErrorType.value as NonIncompatibleValidationType;
	} else {
		displayedWidthError.value = null;
	}

	if (isHeightInvalid.value) {
		displayedHeightError.value = validityErrorType.value as NonIncompatibleValidationType;
	} else {
		displayedHeightError.value = null;
	}
}

const gridExists = computed(() => customPuzzleGrid.value !== null);
const onCreateUpdate = () => {
	updateDisplayedErrors();
	if (hasValidityError.value) {
		return;
	}

	const gridExistsBefore = gridExists.value;
	setUpdatedConfig();
	updateDimensions();
	if (!gridExistsBefore) {
		expanded.value = false;
	}
}
const onReset = () => {
	updateDisplayedErrors();
	if (hasValidityError.value) {
		return;
	}

	setUpdatedConfig();
	resetGrid();
}

const onImportStringParsed = async (parsed: ParsedCustomPuzzleString) => {
	showImportStringDialog.value = false;
	await awaitRaf();

	if (parsed.width !== parsed.height) {
		// inputForceSquareGrid.value = false;
		forceSquareGrid.value = false;
	}
	width.value = parsed.width;
	height.value = parsed.height;
	resetGrid();
	customPuzzleGrid.value = parsed.grid;

	expanded.value = false;
}
</script>