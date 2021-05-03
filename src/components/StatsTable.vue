<template>
	<table class="mx-auto w-full whitespace-nowrap rounded divide-y bg-white border border-gray-200">
		<thead>
			<tr class="text-gray-600 text-left font-semibold capitalize text-xs">
				<th
					class="px-3 py-4"
					:class="columnClasses[header] ?? []"
					scope="col"
					v-for="header in headers"
					:key="header"
				>{{headerLabels[header]}}</th>
			</tr>
		</thead>

		<tbody class="divide-y divide-gray-200">
			<tr
				v-for="row in tableData"
				:key="'row' + row[rowHeader]"
			>
				<th
					scope="row"
					class="px-3 py-2 text-xs"
				>{{row[rowHeader]}}</th>

				<td
					v-for="colName in dataHeaders"
					:key="colName"
					:class="columnClasses[colName] ?? []"
					class="px-3 py-2 text-xs"
				>{{row[colName]}}</td>

			</tr>
		</tbody>

	</table>
</template>

<script>
export default {
	props: {
		tableData: {
			type: Array,
			required: true
		},
		headers: {
			type: Array,
			required: true
		},
		rowHeader: {
			type: String
		},
		headerLabels: {
			type: Object,
			required: true
		},
		headerAlign: {
			type: Object,
			default: () => ({})
		}
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