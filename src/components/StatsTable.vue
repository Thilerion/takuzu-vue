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
				v-for="(row, rowIdx) in groupedItems"
				:key="rowIdx"
				:class="{'group-row': row.group != null}"
			>
				<template v-if="row.group == null">
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
				</template>		
				<template v-else>
						<td
							:colspan="columns"
						>Category: {{row.group}}</td>
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
		group: {
			type: Boolean
		},
		groups: {
			type: Array,
			default: () => ([])
		}
	},
	computed: {
		groupedItems() {
			if (!this.group) return this.items;

			const groupItems = {};
			this.groups.forEach(groupName => {
				groupItems[groupName] = [];
			})

			this.items.forEach(item => {
				groupItems[item.sizeGroup].push(item);
			})

			const grouped = [];
			this.groups.forEach(groupName => {
				grouped.push({
					group: groupName
				});
				grouped.push(...groupItems[groupName]);
			})

			return grouped;
		},
		columns() {
			return this.headers.length;
		}
	}
}
</script>

<style lang="postcss" scoped>
.group-row td {
	@apply bg-white px-3 pt-3 pb-2 text-xs font-medium text-gray-700;
}
tbody tr:not(.group-row) {
	@apply even:bg-gray-100 odd:bg-white;
}
</style>