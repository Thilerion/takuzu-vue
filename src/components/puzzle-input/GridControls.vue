<template>
	<div>
		<header>Puzzle dimensions</header>
		<button @click="expanded = !expanded">Expand</button>
	<ExpandTransition :duration="300">
	<div v-if="expanded">
		<div class="flex flex-row gap-x-4">
			<div class="flex flex-col">
				<label for="widthInput">Width</label>
				<input type="number" :value="width" @change="setWidth($event.target.value)" name="width" id="widthInput" min="4" max="16" class="p-2 text-sm min-w-[3.5rem] min-h-8 rounded border-gray-400">
			</div>
			<div class="self-end py-2">x</div>
			<div class="flex flex-col">
				<label for="heightInput">Height</label>
				<input type="number" :value="height" @change="setHeight($event.target.value)" name="height" id="heightInput" min="4" max="16" class="p-2 text-sm min-w-[3.5rem] min-h-[2rem] rounded border-gray-400 disabled:text-gray-600 disabled:bg-gray-100 disabled:border-gray-400/70" :disabled="forceSquareGrid">
			</div>
		</div>
		<label class="py-2 inline-flex items-center gap-x-2 text-sm">
			<input type="checkbox" name="squareGrid" id="squareGridToggle" @input="setSquareGridToggle($event.target.checked)" :checked="forceSquareGrid">
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

<script setup>
import { computed, onBeforeMount, onMounted, ref, toRef } from 'vue';
import ExpandTransition from '@/views/transitions/ExpandTransition.vue';

const emit = defineEmits([
	'reset',
	'set-dimensions',
	'update:modelValue'
])

const props = defineProps({
	modelValue: {
		type: Object,
		required: true
	},
	gridExists: {
		type: Boolean,
		required: true
	}
})

const expanded = ref(true);
onMounted(() => {
	if (props.gridExists) {
		expanded.value = false;
	}
})

const config = toRef(props, 'modelValue');
const updateConfig = (changes = {}) => {
	const newConfig = {
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


const setWidth = (value) => {
	value = Math.min(Math.max(value, 4), 16);
	const changes = {
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
const setHeight = (value) => {
	value = Math.min(Math.max(value, 4), 16);
	const changes = {
		height: value
	}
	if (value % 2 === 1) {
		// odd must always be square
		changes.width = value;
	}
	updateConfig(changes);
}

const setSquareGridToggle = (value) => {
	const changes = {
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

<style scoped>

</style>