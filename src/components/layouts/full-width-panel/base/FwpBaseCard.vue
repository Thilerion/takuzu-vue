<template>
<div class="bg-white rounded-xl fwp-card-shadow">
	<slot />
</div>
</template>

<style scoped>
.fwp-card-shadow {
	box-shadow: 0px 5px 20px 0px rgb(0 0 0 / 0.04), 0 8px 15px -2px rgb(0 0 0 / 0.04);
}
</style>