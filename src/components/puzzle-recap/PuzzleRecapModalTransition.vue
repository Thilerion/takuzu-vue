<template>
	<transition name="t-content">
		<slot />
	</transition>
</template>

<style scoped>
.t-content-enter-active {
	transition: opacity .2s ease .35s, transform .25s cubic-bezier(0.34, 1.56, 0.64, 1) .4s;
}
.t-content-enter-from {
	@apply opacity-0 scale-90;
}
.t-content-enter-to {
	@apply scale-100;
}
</style>