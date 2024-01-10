<template>
	<div class="time-box w-full text-white text-2xl text-center">
		<span class="drop-shadow-sm"><slot>01:23</slot></span>
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.time-box {
	box-shadow: inset 0px -20px 50px -39px rgba(255, 255, 255, 0.2);
}
</style>