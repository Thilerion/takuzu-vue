<template>
	<component
		:is="elementType"
		@[eventName]="handleCellToggle"
		class="cell-wrapper relative cell-btn"
		:style="gridStyles"
	>
		<slot
			name="inner"
			:value="value"
			:locked="locked"
		><div class="flex items-center justify-center">{{value}}</div></slot>
		<slot name="tap" :locked="locked" />
		<slot name="incorrect-mark" />
	</component>
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

		const gridStyles = {
			'grid-row': `${y.value + 1} / span 1`,
			'grid-column': `${x.value + 1} / span 1`
		};

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

		return { elementType, handleCellToggle, eventName, value: cellValue, gridStyles, locked: isLocked };
	}
};
</script>

<style scoped>
.cell-wrapper {
	aspect-ratio: 1;
	width: 100%;
	background-color: yellow;
	transition: border .2s ease;
	contain: strict;
}

.cell-wrapper::slotted(*) {
	pointer-events: none;
	touch-action: none;
	user-select: none;
}
</style>