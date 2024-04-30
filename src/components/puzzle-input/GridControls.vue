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
						type="number"
						:value="width"
						name="width"
						min="4"
						max="16"
						class="p-2 text-sm min-w-[3.5rem] min-h-8 rounded border-gray-400"
						@change="setWidth(($event.target as HTMLInputElement).valueAsNumber)"
					>
				</div>
				<div class="self-end py-2">x</div>
				<div class="flex flex-col">
					<label for="heightInput">Height</label>
					<input
						id="heightInput"
						type="number"
						:value="height"
						name="height"
						min="4"
						max="16"
						class="p-2 text-sm min-w-[3.5rem] min-h-[2rem] rounded border-gray-400 disabled:text-gray-600 disabled:bg-gray-100 disabled:border-gray-400/70"
						:disabled="forceSquareGrid"
						@change="setHeight(($event.target as HTMLInputElement).valueAsNumber)"
					>
				</div>
			</div>
			<label class="py-2 inline-flex items-center gap-x-2 text-sm">
				<input
					id="squareGridToggle"
					type="checkbox"
					name="squareGrid"
					:checked="forceSquareGrid"
					@input="setSquareGridToggle(($event.target as HTMLInputElement).checked)"
				>
				Force square grid
			</label>
			<div class="flex flex-row gap-2">
				<BaseButton @click="emitSetDimensions">
					<span v-if="gridExists">Update</span>
					<span v-else>Create</span>
				</BaseButton>
				<BaseButton @click="emitReset">Reset</BaseButton>
			</div>
		</div>
	</ExpandTransition>
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef } from 'vue';

const emit = defineEmits([
	'reset',
	'set-dimensions',
	'update:modelValue'
])

const props = defineProps<{
	modelValue: { width: number, height: number, forceSquareGrid: boolean },
	gridExists: boolean
}>();

const expanded = ref(true);
onMounted(() => {
	if (props.gridExists) {
		expanded.value = false;
	}
})

const config = toRef(props, 'modelValue');
const updateConfig = (changes: Partial<{width: number, height: number, forceSquareGrid: boolean}> = {}) => {
	const newConfig: { width: number, height: number, forceSquareGrid: boolean } = {
		...config.value,
		...changes
	}
	console.log({ newConfig });
	emit('update:modelValue', newConfig);
}

const width = computed({
	get() {
		return config.value.width;
	},
	set(value) {
		updateConfig({ width: value });
	}
})
const height = computed({
	get() {
		return config.value.height;
	},
	set(value) {
		updateConfig({ height: value });
	}
})
const forceSquareGrid = computed({
	get() {
		return config.value.forceSquareGrid;
	},
	set(value) {
		updateConfig({ forceSquareGrid: value });
	}
})


const setWidth = (value: number) => {
	value = Math.min(Math.max(value, 4), 16);
	const changes: Partial<{width: number, height: number, forceSquareGrid: boolean}> = {
		width: value
	}
	if (forceSquareGrid.value) {
		changes.height = value;
	} else if (value % 2 === 1) {
		// odd must always be square
		changes.height = value;
	}
	updateConfig(changes);
}
const setHeight = (value: number) => {
	value = Math.min(Math.max(value, 4), 16);
	const changes: Partial<{width: number, height: number, forceSquareGrid: boolean}> = {
		height: value
	}
	if (value % 2 === 1) {
		// odd must always be square
		changes.width = value;
	}
	updateConfig(changes);
}

const setSquareGridToggle = (value: boolean) => {
	const changes: Partial<{width: number, height: number, forceSquareGrid: boolean}> = {
		forceSquareGrid: value
	}
	if (value) {
		changes.height = width.value;
	}
	updateConfig(changes);
}

const emitSetDimensions = () => {
	const exists = props.gridExists;
	requestAnimationFrame(() => {
		emit('set-dimensions', width.value, height.value);
		if (!exists) {
			requestAnimationFrame(() => {
				expanded.value = false;
			})
		}
	});
}
const emitReset = () => {
	emit('reset');
}

</script>