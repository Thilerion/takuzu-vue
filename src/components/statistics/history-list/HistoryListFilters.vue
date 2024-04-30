<template>
<div class="bg-white px-2 py-0 border-y">
	<ExpandTransition :show="showFilterInputs">
		<div>
			<div class="divide-y bg-blue-100/0">
				<div class="py-2 px-2">
					<InputToggle
						id="favoritesOnlyToggle"
						v-model="favoritesOnly"
						class="mb-0 w-full font-medium"
					>Favorites only</InputToggle>
				</div>

				<div class="py-2 px-2">
					<h3 class="font-medium leading-loose">Time records</h3>
					<div class="flex flex-row flex-wrap gap-x-6 gap-y-1">
						<label
							v-for="opt in timeRecordOpts"
							:key="opt.label"
							class="max-w-1/2 min-w-max leading-loose"
						>
							<input
								v-model="timeRecordFilterValue"
								type="radio"
								:value="opt.value"
							>
							<span class="ml-1.5">{{ opt.label }}</span>
						</label>
					</div>
				</div>

				<div class="py-2 px-2">
					<div class="flex flex-row justify-between">
						<h3 class="font-medium leading-loose">Difficulty</h3>
						<transition name="t-fade">
							<button
								v-if="activeFilters.difficulty"
								class="text-xs uppercase tracking-wide font-medium opacity-60"
								@click="removeFilter('difficulty')"
							>Clear</button>
						</transition>
					</div>
					<HistoryListFilterDifficulty v-model="difficultyFilterValues" :is-active="!!activeFilters.difficulty" />
				</div>

				<div class="py-2 px-2">
					<label for="boardSizeSelect" class="font-medium leading-loose">Board size</label>
					<Multiselect
						id="boardSizeSelect"
						v-model="boardSizeFilterValues"
						mode="multiple"
						placeholder="Choose dimensions for filter"
						:closeOnSelect="false"
						:hide-selected="false"
						:multiple-label="getMultiLabel"
						:options="boardSizeOpts"
						class="h-12"
					/>
				</div>
				
			</div>
		</div>
	</ExpandTransition>
	<div
		class="py-2 min-h-[2.75rem] text-center flex gap-x-3 gap-y-2 flex-wrap text-xs tracking-wider grayscale-[50%] contrast-150 brightness-90 w-full items-center justify-start border-t"
		:class="hasActiveFilters && showFilterInputs ? ['border-gray-300', 'border-t'] : ['border-transparent']"
	>
		<transition-group name="t-filterbtns">
			<button
				v-if="activeFilters.difficulty"
				:key="activeFilters.difficulty.join(',')"
				class="tracking-wider w-max py-1 pl-4 pr-2 font-medium bg-blue-200/90 rounded-full flex items-center hover-hover:hover:bg-blue-200/70 text-sky-900"
				@click="removeFilter('difficulty')"
			>
				<span v-if="activeFilters.difficulty[0] === activeFilters.difficulty[1]">Difficulty: {{ activeFilters.difficulty[0] }}*</span>
				<span v-else>Difficulty: {{ activeFilters.difficulty[0] }}* - {{ activeFilters.difficulty[1] }}*</span>
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
				:key="activeFilters.timeRecord"
				class="tracking-wider w-max py-1 pl-4 pr-2 font-medium bg-purple-400/30 text-purple-900 rounded-full flex items-center hover-hover:hover:bg-purple-400/20"
				@click="removeFilter('timeRecord')"
			>
				<span v-if="activeFilters.timeRecord === 'first'">Time record: only first</span>
				<span v-else-if="activeFilters.timeRecord === 'record'">Time record: all</span>
				<span v-else-if="activeFilters.timeRecord === 'current'">Time record: only current</span>
				<span v-else>Time record: {{ activeFilters.timeRecord }}</span>
				<icon-ic-baseline-close class="block opacity-70 ml-2 w-4 h-4" />
			</button>
			<button
				v-for="size in activeFilters?.boardSize ?? []"
				:key="size"
				class="tracking-wider w-max py-1 pl-4 pr-2 font-medium bg-emerald-400/30 text-emerald-900 rounded-full flex items-center hover-hover:hover:bg-emerald-400/20"
				@click="removeSizeFromBoardSizeFilters(size)"
			>
				<span>{{ size }}</span>
				<icon-ic-baseline-close class="block opacity-70 ml-2 w-4 h-4" />
			</button>
			<div v-if="!hasActiveFilters" class="!duration-[0ms] px-2">No active filters</div>
		</transition-group>
	</div>
</div>
</template>

<script setup lang="ts">
import { computed, inject, toRef, watch } from 'vue';

import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';
import type { ListFilterUtils, ListFiltersData } from './useListFilters.js';
import type { DifficultyKey } from '@/lib/types.js';


const props = defineProps<{
	modelValue: boolean
}>()
const emit = defineEmits<{
	update: [filters: Partial<ListFiltersData>],
	'update:modelValue': [val: boolean]
}>();

const showFilterInputs = toRef(props, 'modelValue');

const { currentFilters, activeFilters, /* filterFns, filterItems, */ setFilter, removeFilter } = inject('filterUtils') as ListFilterUtils;

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

const boardSizeOpts = [
	'6x6', '8x8', '10x10', '12x12', '14x14',
	'7x7', '9x9', '11x11', '13x13',
	'6x10', '8x12', '10x14', '12x16'
];

const difficultyFilterValues = computed<DifficultyKey[]>({
	get() {
		if (currentFilters.difficulty?.length !== 2) {
			return [1, 5];
		}
		return [...currentFilters.difficulty];
	},
	set(value: DifficultyKey[]) {
		if (value?.length !== 2 || value[0] === 1 && value[1] === 5) {
			setFilter('difficulty', []);
		} else {
			setFilter('difficulty', value);
		}
	}
})

const boardSizeFilterValues = computed({
	get() {
		return currentFilters.boardSize?.length ? currentFilters.boardSize : [];
	},
	set(value: ReadonlyArray<string>) {
		setFilter('boardSize', [...value]);
	}
})
const removeSizeFromBoardSizeFilters = (size: string) => {
	setFilter('boardSize', boardSizeFilterValues.value.filter(val => val !== size));
}
const getMultiLabel = (opts: { label: string }[]) => {
	if (opts?.length > 4) return `${opts.length} sizes selected`;
	const optsSorted = opts.map(o => o.label).sort((a: string, z: string) => {
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

.t-fade-enter-active, .t-fade-leave-active {
	@apply transition-opacity duration-150;
}
.t-fade-enter-from, .t-fade-leave-to {
	@apply opacity-0;
}
</style>