<template>
	<div class="relative banner-wrapper h-full">
		<div class="highscore-banner relative z-10 bg-white text-teal-700 text-base flex pr-2 pl-1 rounded-full font-medium justify-center items-center leading-none min-w-[13rem] h-full shadow-xl"
	><div class="h-5 w-5 mb-[0.1em]"><icon-fxemoji-trophy class="w-full h-full" /></div><div class="text-base ml-2"><slot>New time record</slot></div></div>
	</div>
</template>

<script setup>

</script>

<style scoped>
.banner-wrapper::before {
	--color1: hsla(31, 97%, 62%, 0.8);
	--color2: theme(colors.white);
	--color3: theme(colors.emerald.200);
	--blur-size: clamp(6px, 1em, 16px);
	z-index:-1;
  	position: absolute;
  	content:"";
  	@apply -inset-x-1 inset-y-1;
	background-image: linear-gradient(143deg, var(--color1) 0%, var(--color2) 56%, var(--color3) 100%); 
  	filter: blur(var(--blur-size));
}
</style>