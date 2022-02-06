<template>
	<component
		:is="elementType"
		@[eventName]="handleCellToggle"
		class="cell-wrapper relative overflow-hidden"
	><slot><div class="flex items-center justify-center">{{value}}</div></slot></component>
</template>

<script>
import { computed, toRefs } from "vue";

export default {
	props: [
		'x', 'y', 'locked',
		'initialValue', 'value',
	],
	emits: ['toggle'],
	setup(props, { emit }) {
		const {
			value,
			x,
			y,
			locked,
			initialValue
		} = toRefs(props);

		const cellValue = computed(() => {
			if (value.value == null) {
				return initialValue.value;
			} else return value.value;
		})
		const isLocked = computed(() => {
			if (locked.value == null) {
				return initialValue.value !== '.';
			} else return locked.value;
		})

		const elementType = isLocked.value ? 'div' : 'button';
		const handleCellToggle = () => {
			emit('toggle', { x: x.value, y: y.value, value: cellValue.value });
		}
		const eventName = isLocked.value ? undefined : 'pointerdown';

		return { elementType, handleCellToggle, eventName, value: cellValue, x, y, locked: isLocked };
	}
};
</script>

<style scoped>
.cell-wrapper {
	--x: v-bind(x);
	--y: v-bind(y);

	grid-row: calc(var(--y) + 1) / span 1;
	grid-column: calc(var(--x) + 1) / span 1;
	aspect-ratio: 1;
	width: 100%;
	background-color: yellow;
}

:slotted(*) {
	width: 100%;
	height: 100%;
}
</style>