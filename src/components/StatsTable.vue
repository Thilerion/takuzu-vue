<template>
	<table class="mx-auto w-full whitespace-nowrap rounded divide-y bg-white border border-gray-200 table-fixed">
		<thead>
			<tr class="text-gray-600 text-left font-semibold capitalize text-xs">
				<th
					class="px-3 py-4"
					:class="header.align === 'right' ? 'text-right' : 'text-left'"
					scope="col"
					v-for="header in headers"
					:key="header.value"
				>{{header.text}}</th>
			</tr>
		</thead>

		<tbody class="divide-y divide-gray-200">
			<tr
				v-for="(row, rowIdx) in items"
				:key="rowIdx"
				class="even:bg-gray-100 odd:bg-white"
			>
				<template v-for="header in headers" :key="header">
					<th
						v-if="header.colHeader"
						scope="row"
						class="px-3 py-2 text-xs"
					>{{row[header.value]}}</th>
					<td
						v-else
						class="px-3 py-2 text-xs"
						:class="header.align === 'right' ? 'text-right' : 'text-left'"
					>{{row[header.value]}}</td>
				</template>				

			</tr>
		</tbody>

	</table>
</template>

<script>
export default {
	props: {
		items: {
			type: Array,
			required: true
		},
		headers: {
			type: Array,
			required: true
		},
	},
	computed: {
		dataHeaders() {
			return this.headers.filter(val => val !== this.rowHeader);
		},
		columnClasses() {
			const aligns = this.headerAlign;
			const res = {};
			this.headers.forEach(header => {
				const alignment = aligns[header] ?? 'left';
				res[header] = [`text-${alignment}`];
			})
			return res;
		}
	}
}
</script>

<style scoped>

</style>