<template>
	<table
		class="table-fixed w-full border-2 border-gray-400"
		:data-width="width"
		:data-height="height"
		:data-odd="isOdd"
		:data-even="isEven"
	>
		<tbody>
			<tr
				v-for="(row, y) in grid"
				:key="y"
			>
				<td
					v-for="(cell, x) in row"
					class="border border-gray-300"
					:class="{
						'border-b-2 border-b-gray-500': centerRowAbove === y,
						'border-r-2 border-r-gray-500': centerColLeft === x,
						'border-r-gray-400/90': centerCol === x || centerCol - 1 === x,
						'border-b-gray-400/90': centerRow === y || centerRow - 1 === y,
					}"
					:data-row="y"
					:data-col="x"
					:data-index="y * width + x"
					:key="x"
				>
					<div class="aspect-square w-full flex justify-center items-center">
						<input 
							type="text"
							inputmode="numeric"
							class="w-full aspect-square p-0 m-0 border-0 text-center bg-transparent"
							:ref="(el) => setInputRef(el, y * width + x)"
							:value="cell"
							@keydown="inputKeydown($event, { x, y })"
							@input-old="(ev) => validateCellValue(ev.target.value, { x, y, ev })"
							@input="inputInput($event, { x, y })"
						>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</template>

<script setup>
import { EMPTY, ONE, ZERO } from '@/lib/constants';
import { computed, onBeforeUpdate, onUpdated, ref } from 'vue';

const props = defineProps({
	grid: {
		validator(value) {
			return Array.isArray(value) && Array.isArray(value[0]);
		},
		required: true
	}
})

const EMPTY_SPACE = ' ';

const emit = defineEmits(['set-value']);

const width = computed(() => props.grid[0].length);
const height = computed(() => props.grid.length);

const isOdd = computed(() => {
	return width.value % 2 === 1 || height.value % 2 === 1;
})
const isEven = computed(() => !isOdd.value);

const centerRowAbove = computed(() => height.value / 2 - 1);
const centerColLeft = computed(() => width.value / 2 - 1);
const centerRow = computed(() => (height.value - 1) / 2);
const centerCol = computed(() => (width.value - 1) / 2);

const validSymbols = [ONE, ZERO, EMPTY_SPACE];
const isValidSymbol = (value) => validSymbols.includes(value);
const validEmptyInputKeys = [' ', '.', 'x', '-', '_', ','];
const isEmptyValueInput = value => validEmptyInputKeys.includes(value);
const isArrowKey = (value = '') => String(value).startsWith('Arrow');

const setValue = (x, y, value) => {
	if (isEmptyValueInput(value)) value = ' ';
	else if (!isValidSymbol(value)) {
		console.warn(`Value "${value}" is not a valid puzzle symbol.`);
		return;
	}
	emit('set-value', { x, y, value });
}

const focusNextInput = (index, ev) => {
	const nextEl = inputEls.value[index + 1];
	if (nextEl == null) {
		ev?.target?.blur?.();
		return;
	}
	nextEl.focus?.();
}
const focusPreviousInput = (index, ev) => {
	const prevEl = inputEls.value[index - 1];
	if (prevEl == null) {
		ev?.target?.blur?.();
		return;
	}
	prevEl.focus?.();
}
const focusSpecificInput = ({ x, y }) => {
	const index = y * width.value + x;
	inputEls.value[index]?.focus?.();
}
const handleArrowKey = (key, { x, y }, ev) => {
	let dirX = 0;
	let dirY = 0;
	switch(key) {
		case 'ArrowLeft':
			dirX = -1;
			break;
		case 'ArrowRight':
			dirX = 1;
			break;
		case 'ArrowUp':
			dirY = -1;
			break;
		case 'ArrowDown':
			dirY = 1;
			break;
	}
	const nextX = (x + dirX + width.value) % width.value;
	const nextY = (y + dirY + height.value) % height.value;
	focusSpecificInput({ x: nextX, y: nextY });
}

const inputEls = ref([]);
const inputKeydown = (ev, { x, y }) => {
	const key = ev.key;
	let handled = handleKey(key, { x, y, ev });
}

const inputInput = (ev, { x, y }) => {
	let key = ev.data;
	if (ev.inputType === 'deleteContentBackward') {
		key = 'Backspace';
	}
	if (ev.inputType !== 'insertText' && ev.inputType !== 'deleteContentBackward') return;
	let handled = handleKey(key, { x, y, ev });
}

function handleKey(key, { x, y, ev}) {
	const index = y * width.value + x;
	const currentValue = ev.target.value;
	const el = ev.target;
	
	if (key === '1' || key === '0' || isEmptyValueInput(key)) {
		setValue(x, y, key);
		focusNextInput(index, ev);
		ev.preventDefault();
		return true;
	}
	if (key === 'Backspace') {
		setValue(x, y, EMPTY_SPACE);
		focusPreviousInput(index, ev);
		ev.preventDefault();
		return true;	
	}
	if (isArrowKey(key)) {
		handleArrowKey(key, { x, y });
		ev.preventDefault();
		return true;
	}
	if (key === 'Enter') {
		const nextRow = (y + 1) % height.value;
		focusSpecificInput({ y: nextRow, x: 0 });
		ev.preventDefault();
		return;
	}
	if (key === 'Home') {
		focusSpecificInput({ x: 0, y });
		ev.preventDefault();
		return true;
	} else if (key === 'End') {
		focusSpecificInput({ x: width.value - 1, y });
		ev.preventDefault();
		return true;
	}
	if (key === 'PageDown') {
		focusSpecificInput({ x, y: height.value - 1 });
		ev.preventDefault();
		return true;
	} else if (key === 'PageUp') {
		focusSpecificInput({ x, y: 0 });
		ev.preventDefault();
		return true;
	}

	return false;
}

const validateCellValue = (value, { x, y, ev }) => {
	/* const gridValue = props.grid[y][x];
	if (gridValue !== value) {
		// console.warn('Grid value is different from value...');
		ev.target.value = gridValue;
	}
	focusNextInput(y * width.value + x, ev); */
}

onBeforeUpdate(() => {
	inputEls.value = [];
})
const setInputRef = (el, index) => {
	inputEls.value[index] = el;
}
</script>

<style scoped>

</style>