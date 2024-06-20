<template>
<div v-if="line != null">
	<p class="mb-4 mt-2 text-gray-700">Line size: <strong class="font-medium">{{ length }}</strong></p>
	<table v-if="counts && remaining && required" class="details-table table-auto border border-gray-300">
		<thead>
			<tr>
				<th><span></span></th>
				<th><span>0</span></th>
				<th><span>1</span></th>
				<th><span>_</span></th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Counts</td>
				<td>{{ counts[ZERO] }}</td>
				<td>{{ counts[ONE] }}</td>
				<td>{{ counts[EMPTY] }}</td>
			</tr>
			<tr>
				<td>Required</td>
				<td>{{ required[ZERO] }}</td>
				<td>{{ required[ONE] }}</td>
				<td rowspan="2" class="cell-na"></td>
			</tr>
			<tr>
				<td>Remaining</td>
				<td :class="{'remaining-err': errorRemaining[ZERO]}">{{ remaining[ZERO] }}</td>
				<td :class="{'remaining-err': errorRemaining[ONE]}">{{ remaining[ONE] }}</td>
			</tr>
		</tbody>
	</table>
</div>
<div v-else><slot name="fallback" /></div>
</template>

<script setup lang="ts">
import type { PuzzleValueLineStr } from '@/lib/types.js';
import { toRefs } from 'vue';
import { usePuzzleLineDetails } from '../composables/line-details.js';
import { ONE, ZERO, EMPTY } from '@/lib/constants.js';
import { computed } from 'vue';

const props = defineProps<{
	line: PuzzleValueLineStr | null,
}>();

const { line } = toRefs(props);
const {
	counts, length, remaining, required
} = usePuzzleLineDetails(line);

const errorRemaining = computed(() => {
	if (remaining.value == null) {
		return { [ZERO]: false, [ONE]: false };
	}
	return {
		[ZERO]: remaining.value[ZERO] < 0,
		[ONE]: remaining.value[ONE] < 0,
	}
})
</script>

<style scoped>
.details-table .thead {
	@apply bg-gray-200;
}

.details-table thead span {
	@apply min-w-[2ch] inline-block;
}

.details-table thead th,
.details-table tbody td {
	@apply px-4 py-2 border border-gray-300;
}

.details-table tbody tr {
	@apply odd:bg-gray-100;
}

.details-table td:first-child {
	@apply font-bold pl-2 pr-4;
}

.details-table th {
	@apply text-left;
}

.cell-na {
	@apply bg-gray-200;
}

.remaining-err {
	@apply text-red-700 bg-red-100 font-semibold;
}
</style>