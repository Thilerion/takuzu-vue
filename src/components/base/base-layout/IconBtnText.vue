<template>
<button class="icon-btn" :class="{ vertical }">
	<span class="icon-wrapper">
		<slot name="icon" />
	</span>
	<div class="btn-label whitespace-nowrap">
		<slot />
	</div>
</button>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		scale?: number | string,
		vertical?: boolean
	}>(),
	{
		scale: '1.25'
	}
);
</script>

<style scoped>

.icon-wrapper:deep(svg) {
	font-size: calc(v-bind(scale) * 16px);
}

.icon-btn {
	@apply flex items-center justify-center rounded-full outline-none text-current select-none p-3 cursor-pointer;
	@apply enabled:active:bg-gray-300 enabled:dark:active:bg-slate-700;
	-webkit-tap-highlight-color: transparent;
	transition-property: background color opacity;
	transition-duration: 0.15s;
	transition-timing-function: ease;
}

@media (hover:hover) and (pointer:fine) {
	.icon-btn:not(:disabled) {
		@apply hover:bg-gray-200 active:bg-gray-300;
		@apply dark:hover:bg-slate-800 dark:active:bg-slate-700;
	}
}

.icon-btn:disabled {
	@apply transition-none opacity-80 dark:opacity-60 cursor-default bg-transparent;
}
.icon-btn:disabled .icon-svg {
	@apply opacity-70 dark:opacity-60;
}

.icon-btn.vertical {
	@apply flex flex-col justify-start;
}
.icon-btn.vertical > .btn-label {
	@apply mr-0 my-auto pt-0.5;
}
</style>