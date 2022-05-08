<template>
	<div class="bg-white px-2 py-0 border-y">
		<ExpandTransition>
			<div v-if="showFilterInputs">
			<div class="divide-y bg-blue-100/0">
				<div class="py-2 px-2">
					<InputToggle2 v-model="favoritesOnly" id="favoritesOnlyToggle" class="mb-0 w-full font-medium">Favorites only</InputToggle2>
				</div>

				<div class="py-2 px-2">
					<h3 class="font-medium leading-loose">Time records</h3>
					<div class="flex flex-row flex-wrap gap-x-6 gap-y-1">
						<label
							v-for="opt in timeRecordOpts"
							class="max-w-1/2 min-w-max leading-loose"
						>
							<input type="radio" :value="opt.value" v-model="timeRecordFilterValue">
							<span class="ml-1.5">{{opt.label}}</span>
						</label>
					</div>
				</div>

				<div class="py-2 px-2">
					<h3 class="font-medium leading-loose">Difficulty</h3>
					<div class="relative w-full max-w-xs mx-auto pt-2 pb-1">
						<div class="flex justify-between text-center">
							<div v-for="n in 5" @click="setSingleDifficultyValue(n)" class="opacity-50 text-center">
								<div class="text-xs leading-none">{{n}}</div>
								<div class="text-xxs top-0.5 relative">|</div>
							</div>
						</div>
						<RangeSlider 
							:min="1"
							:max="5"
							:step="1"
							:lazy="true"
							:tooltips="false"
							v-model="difficultyFilterValues"
						></RangeSlider>
					</div>
				</div>

				<div class="py-2 px-2">
					<label for="boardSizeSelect" class="font-medium leading-loose">Board size</label>
					<Multiselect
						mode="multiple"
						id="boardSizeSelect"
						placeholder="Choose dimensions for filter"
						:closeOnSelect="false"
						:hide-selected="false"
						:multiple-label="getMultiLabel"
						v-model="boardSizeFilterValues"
						:options="boardSizeOpts"
						class="h-12"
					/>
				</div>
				
			</div>
			</div>
		</ExpandTransition>
		<div class="py-2 min-h-[2.75rem] text-center flex gap-x-3 gap-y-2 flex-wrap text-xs tracking-wider grayscale-[50%] contrast-150 brightness-90 w-full items-center justify-start border-t"
				:class="hasActiveFilters && showFilterInputs ? ['border-gray-300', 'border-t'] : ['border-transparent']">
			<transition-group name="t-filterbtns">
			<button
				v-if="activeFilters.difficulty"
				class="tracking-wider w-max py-1 pl-4 pr-2 font-medium bg-blue-200/90 rounded-full flex items-center hover-hover:hover:bg-blue-200/70 text-sky-900"
				@click="removeFilter('difficulty')"
				:key="activeFilters.difficulty.join(',')"
			>
				<span v-if="activeFilters.difficulty[0] === activeFilters.difficulty[1]">Difficulty: {{activeFilters.difficulty[0]}}*</span>
				<span v-else>Difficulty: {{activeFilters.difficulty[0]}}* - {{activeFilters.difficulty[1]}}*</span>
				<icon-ic-baseline-close class="block opacity-70 ml-2 w-4 h-4" />
			</button>

			<button
				v-if="activeFilters.favoritesOnly"
				key="favoritesOnly"
				class="tracking-wider w-max py-1 pl-4 pr-2 font-medium bg-amber-200/50 rounded-full flex items-center hover-hover:hover:bg-amber-200/40 text-orange-900"
				@click="removeFilter('favoritesOnly')"
			>
				Favorites
				<icon-ic-baseline-close class="block opacity-70 ml-2 w-4 h-4" />
			</button>

			<button
				v-if="activeFilters.timeRecord"
				class="tracking-wider w-max py-1 pl-4 pr-2 font-medium bg-purple-400/30 text-purple-900 rounded-full flex items-center hover-hover:hover:bg-purple-400/20"
				@click="removeFilter('timeRecord')"
				:key="activeFilters.timeRecord"
			>
				<span v-if="activeFilters.timeRecord === 'first'">Time record: only first</span>
				<span v-else-if="activeFilters.timeRecord === 'record'">Time record: all</span>
				<span v-else-if="activeFilters.timeRecord === 'current'">Time record: only current</span>
				<span v-else>Time record: {{activeFilters.timeRecord}}</span>
				<icon-ic-baseline-close class="block opacity-70 ml-2 w-4 h-4" />
			</button>
			<button
				v-for="size in activeFilters?.boardSize ?? []"
				class="tracking-wider w-max py-1 pl-4 pr-2 font-medium bg-emerald-400/30 text-emerald-900 rounded-full flex items-center hover-hover:hover:bg-emerald-400/20"
				@click="removeSizeFromBoardSizeFilters(size)"
				:key="size"
			>
				<span>{{size}}</span>
				<icon-ic-baseline-close class="block opacity-70 ml-2 w-4 h-4" />
			</button>
			<div v-if="!hasActiveFilters" class="!duration-[0ms] px-2">No active filters</div>
			</transition-group>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, ref, toRef, watch } from 'vue';
import ExpandTransition from '@/views/transitions/ExpandTransition.vue';
import RangeSlider from '@vueform/slider';
import Multiselect from '@vueform/multiselect';
import '@vueform/slider/themes/default.css';
import '@vueform/multiselect/themes/default.css';

const props = defineProps({
	modelValue: Boolean
})
const emit = defineEmits(['update', 'update:modelValue']);

const showFilterInputs = toRef(props, 'modelValue');

const { currentFilters, activeFilters, filterFns, filterItems, setFilter, removeFilter } = inject('filterUtils');

const hasActiveFilters = computed(() => {
	return Object.keys(activeFilters.value).length > 0;
})

watch(activeFilters, (value) => {
	emit('update', value);
}, { immediate: true });

const favoritesOnly = computed({
	get() {
		return currentFilters.favoritesOnly;
	},
	set(value) {
		setFilter('favoritesOnly', value);
	}
})

const timeRecordFilterValue = computed({
	get() {
		const val = currentFilters.timeRecord;
		if (!val) return '';
		return val;
	},
	set(value) {
		if (!value) {
			setFilter('timeRecord', null);
		} else {
			setFilter('timeRecord', value);
		}
	}
})

const timeRecordOpts = [
	{ label: 'No filter', value: '' },
	{ label: 'All time records', value: 'record' },
	{ label: 'Only current records', value: 'current' },
	{ label: 'Only first records', value: 'first' }
]

const difficultyValueOpts = [
	1, 2, 3, 4, 5
]

const boardSizeOpts = [
	'6x6', '8x8', '10x10', '12x12', '14x14',
	'7x7', '9x9', '11x11', '13x13',
	'6x10', '8x12', '10x14', '12x16'
];

const difficultyFilterValues = computed({
	get() {
		if (currentFilters.difficulty?.length !== 2) {
			return [1, 5];
		}
		return currentFilters.difficulty;
	},
	set(value) {
		console.log(value);
		if (value?.length !== 2 || value[0] === 1 && value[1] === 5) {
			setFilter('difficulty', []);
		} else {
			setFilter('difficulty', value);
		}
	}
})
const setSingleDifficultyValue = (value) => {
	const [left, right] = difficultyFilterValues.value;

	if (left === right && value !== left) {
		if (value < left) { 
			difficultyFilterValues.value = [value, right];
		} else difficultyFilterValues.value = [left, value];
		return;
	}
	if (value === left || value === right) {
		difficultyFilterValues.value = [value, value];
	}

	const distLeft = Math.abs(left - value);
	const distRight = Math.abs(right - value);

	if (distLeft < distRight) {
		difficultyFilterValues.value = [value, right];
	} else {
		difficultyFilterValues.value = [left, value];
	}
}

const boardSizeFilterValues = computed({
	get() {
		return currentFilters.boardSize?.length ? currentFilters.boardSize : [];
	},
	set(value) {
		setFilter('boardSize', value);
	}
})
const removeSizeFromBoardSizeFilters = (size) => {
	setFilter('boardSize', boardSizeFilterValues.value.filter(val => val !== size));
}
const getMultiLabel = (opts) => {
	if (opts?.length > 4) return `${opts.length} sizes selected`;
	const optsSorted = opts.map(o => o.label).sort((a, z) => {
		return boardSizeOpts.indexOf(a) - boardSizeOpts.indexOf(z);
	})
	return 'Selected: ' + optsSorted.join(', ');
}
</script>

<style scoped>
input[type="range"] {
	pointer-events: none;
	z-index: 0;
}
input[type="range"]::-webkit-slider-thumb {
	pointer-events: auto;
	z-index: 10;
}

.t-filterbtns-move {
	transition: all .5s ease;
}
.t-filterbtns-enter-active {
	transition: all .2s ease .15s;
}
.t-filterbtns-enter-from {
	opacity: 0;
}
.t-filterbtns-leave-active {
	position: absolute;
	transition: all .5s ease;
}
.t-filterbtns-leave-to {
	opacity: 0;
	@apply translate-x-full translate-y-3;
}

:deep(.multiselect-multiple-label) {
	@apply text-sm opacity-70;
}
</style>