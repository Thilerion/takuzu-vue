<template>
	<div class="cell-tap-shadow"></div>
</template>

<style>
.cell-tap-shadow {
	@apply pointer-events-none absolute inset-0;
	@apply ring ring-gray-800 ring-inset;
	z-index: 2;
	opacity: 0;
	border-radius: calc(var(--cell-rounding) + 0.5px);
	will-change: opacity;
	transition: opacity 0.5s cubic-bezier(.97,.25,.16,.71) .6s;
}
button:active > .cell-tap-shadow {
	opacity: 0.7;
	transition: opacity .05s cubic-bezier(0, 0.55, 0.45, 1);
}

.cell-size-xs .cell-tap-shadow,
.cell-size-s .cell-tap-shadow,
.cell-size-m .cell-tap-shadow {
	@apply ring-2;
}
.cell-size-l .cell-tap-shadow {
	@apply ring;
}
.cell-size-xl .cell-tap-shadow {
	@apply ring-4;
}
</style>