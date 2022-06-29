<template>
<div ref="tableWrapperEl" class="flex justify-center">
<div
	class="relative border-2 border-slate-800 inline-block"
	:style="{
		'font-size': `${approxBoxSize * 0.8}px`
	}"
>
	<table
		class="table-fixed mx-auto border-0"
		:style="{
			width: tableWidth
		}"
		:data-width="width"
		:data-height="height"
		:data-odd="isOdd"
		:data-even="isEven"
		ref="tableEl"
	>
		<tbody>
			<tr
				v-for="(row, y) in grid"
				:key="y"
			>
				<td
					v-for="(cell, x) in row"
					class="overflow-clip border border-slate-700 relative bg-gray-50 p-px text-center align-middle"
					:class="[getMiddleLineClasses({ x, y })]"
					:data-row="y"
					:data-col="x"
					:data-index="y * width + x"
					:key="x"
				>
					<div class="aspect-square flex items-center justify-center relative -m-0.5">
							<slot :x="x" :y="y" :index="y * width + x" />
					</div>
				</td>
			</tr>
		</tbody>
	</table>
	<div
		class="absolute inset-0 w-full h-full z-10 grid justify-between text-slate-800 pointer-events-none"
	>
		<MiddleTriangle class="row-start-2 col-start-1 place-self-center" :size="`clamp(5px, ${triangleSize}px, 0.6rem)`" dir="right" />
		<MiddleTriangle class="row-start-2 col-start-3 place-self-center" :size="`clamp(5px, ${triangleSize}px, 0.6rem)`" dir="left" />
		<MiddleTriangle class="row-start-3 col-start-2 self-end" :size="`clamp(5px, ${triangleSize}px, 0.6rem)`" dir="up" />
		<MiddleTriangle class="row-start-1 col-start-2 self-start" :size="`clamp(5px, ${triangleSize}px, 0.6rem)`" dir="down" />
	</div>
</div>
</div>
</template>

<script setup>
import { useElementSize } from '@vueuse/core';
import { computed, ref, watchEffect } from 'vue';


const props = defineProps({
	grid: {
		validator(value) {
			return Array.isArray(value) && Array.isArray(value[0]);
		},
		required: true
	}
})


const width = computed(() => props.grid[0].length);
const height = computed(() => props.grid.length);
const aspectRatio = computed(() => height.value / width.value);

const tableWrapperEl = ref(null);
const tableEl = ref(null);
const { width: wrapperWidth, height: wrapperHeight } = useElementSize(tableWrapperEl, { width: window.innerWidth - 28, height: (window.innerWidth - 10) * aspectRatio.value }, { box: 'content-box' });
const { width: elWidth, height: elHeight } = useElementSize(tableEl, { width: window.innerWidth - 28, height: (window.innerWidth - 10) * aspectRatio.value }, { box: 'content-box' });

const approxBoxSizeFromWrapper = computed(() => {
	return Math.floor(wrapperWidth.value / width.value);
})
const approxBoxSize = computed(() => {
	return Math.floor(elWidth.value / width.value);
})
const triangleSize = computed(() => {
	return approxBoxSize.value * 0.2 - 6;
})
const tableWidth = computed(() => {
	if (approxBoxSizeFromWrapper.value > 50) {
		const val = 50 * width.value;
		if (val >= wrapperWidth.value) {
			return '100%';
		}
		return `${50 * width.value}px`;
	}
	return '100%';
})

const isOdd = computed(() => {
	return width.value % 2 === 1 || height.value % 2 === 1;
})
const isEven = computed(() => !isOdd.value);

const centerX = computed(() => (width.value - 1) / 2);
const centerY = computed(() => (height.value - 1) / 2);

const centerXStart = computed(() => {
	return isEven.value ? Math.floor(centerX.value) : null;
})
const centerYStart = computed(() => {
	return isEven.value ? Math.floor(centerY.value) : null;
})
const getMiddleLineClasses = ({ x, y }) => {
	if (isOdd.value) {
		if (x === centerX.value || y === centerY.value) {
			return ['bg-slate-100'];
		} else return [];
	} else if (isEven.value) {
		const list = [];
		if (x === centerXStart.value) {
			list.push('border-r-2', 'border-r-slate-800');
		}
		if (y === centerYStart.value) {
			list.push('border-b-2', 'border-b-slate-800');
		}
		return list;
	}
}
</script>

<style scoped>

</style>