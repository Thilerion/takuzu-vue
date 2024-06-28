<template>
<div class="fwp-layout flex flex-col items-center w-full gap-y-6 bg-gray-50 dark:bg-slate-900 mt-4 pb-2 h-full">
	<slot></slot>
</div>
</template>

<style>
.fwp-layout > * {
	@apply max-w-[80ch];
}
</style>