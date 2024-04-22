<template>
	<div class="overflow-auto relative max-w-full z-0">
		<table
			class="w-full text-sm text-left text-gray-500 dark:text-gray-200"
		>
			<thead
				class="text-xs text-gray-700 uppercase bg-white border-y border-b-2 dark:bg-gray-700 dark:text-gray-200"
			>
				<tr>
					<th
						scope="col"
						class="px-4 relative font-bold h-10 last:pr-8"
						:class="{ 'pr-1 last:pr-6': column.sortable }"
						v-for="column in columns"
						:key="column.label"
					>
					<button
						v-if="column.sortable"
						@click="$emit('sort-header', column.key)"
						class="inline-flex flex-row items-center uppercase text-xs font-bold h-full last:pr-18"
					>{{column.label}}
						<icon-fa-solid-sort class="w-4 h-4 ml-1 opacity-30" v-if="currentSort.key !== column.key" />
						<icon-fa-solid-sort-up class="w-4 h-4 ml-1 opacity-70" v-else-if="currentSort.dir === 'asc'" />
						<icon-fa-solid-sort-down class="w-4 h-4 ml-1 opacity-70" v-else-if="currentSort.dir === 'desc'" />
					</button>
					<span v-else>{{column.label}}</span>
					</th>
				</tr>
			</thead>
			<tbody class="bg-white dark:bg-gray-800">
				<tr
					class="border-b dark:border-gray-600/90 hover:bg-gray-50 dark:hover:bg-gray-700 even:bg-gray-50 even:dark:bg-gray-700/70"
					v-for="(row, idx) in rows"
					:key="idx"
				>
					<template
						v-for="(value, idx) in row"
						:key="idx"
					>
						<th scope="row" v-if="idx === 0" class="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap sticky left-0 bg-gray-100 even:bg-gray-200 h-full w-full z-10 after:h-full after:absolute after:z-20 after:bg-gray-500/10 after:w-px after:right-0 after:top-0">{{value}}</th>
						<td v-else class="px-4 py-2">{{value}}</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
export type BaseTableColumn = {
	sortable?: boolean,
	label: string,
	key: string
}
export type BaseTableSortOpts = {
	dir: 'asc' | 'desc',
	key: string, // TODO: can be typed more strictly with generic component
}

withDefaults(defineProps<{
	columns: BaseTableColumn[],
	currentSort?: Record<string, unknown>,
	rows?: (string | number)[][]
}>(), {
	currentSort: () => ({}),
	rows: () => [
			['Macbook Pro', 'Silver', 'Laptop', '$2999'],
			['Surface Pro', 'White', 'Laptop PC', '$1999'],
			['Magic Mouse', 'Black', 'Accesories', '$99']
		]
})
defineEmits<{
	'sort-header': [columnKey: string]
}>();
</script>

<style scoped>

</style>