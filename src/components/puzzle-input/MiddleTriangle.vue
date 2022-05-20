<template>
	<div
	
		class="
			triangle
			w-0 h-0
			border-0 border-transparent"
		:data-dir="dir"
		:data-axis="axis"
	>

	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	dir: {
		required: true,
		validator(val) {
			return ['up', 'down', 'left', 'right'].includes(val);
		}
	},
	size: {
		type: String,
		default: '6px'
	},
	color: {
		type: String,
		default: 'currentColor'
	}
})

const axis = computed(() => {
	if (props.dir === 'up' || props.dir === 'down') return 'vertical';
	return 'horizontal';
})

</script>
v-
<style scoped>
.triangle {
	--triangle-color: v-bind(color);
	--triangle-height: v-bind(size);
	--triangle-width: calc(var(--triangle-height) * 1.5);
}

.triangle[data-axis="horizontal"] {
	@apply border-y-[length:var(--triangle-width)];
}
.triangle[data-axis="vertical"] {
	@apply border-x-[length:var(--triangle-width)];
}
.triangle[data-dir="up"] {
	@apply border-b-[length:var(--triangle-height)] border-b-[color:var(--triangle-color)];
}
.triangle[data-dir="down"] {
	@apply border-t-[length:var(--triangle-height)] border-t-[color:var(--triangle-color)];
}

.triangle[data-dir="left"] {
	@apply border-r-[length:var(--triangle-height)] border-r-[color:var(--triangle-color)];
}
.triangle[data-dir="right"] {
	@apply border-l-[length:var(--triangle-height)] border-l-[color:var(--triangle-color)];
}
</style>