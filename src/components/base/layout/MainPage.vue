<template>
	<div class="wrapper relative">
		<div class="page -mb-2">
			<main>
				<router-view v-slot="{ Component }">
					<transition name="fade" mode="out-in">
							<component :is="Component" />
					</transition>
				</router-view>
			</main>
		</div>
		<div class="sticky bottom-0 w-full inset-x-0 overflow-hidden pt-2">
			<BottomNav />
		</div>
	</div>
</template>

<script setup lang="ts">

</script>

<style>
.wrapper, .wrapper > .page {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.wrapper main {
	@apply min-h-full flex flex-col flex-1;
}
.wrapper main > *:first-child {
	@apply flex-1 pb-4;
}

.footer {
	pointer-events: none;
	position: sticky;
	bottom: 0;
	height: 100vh;
	height: -webkit-fill-available;
	width: 100vw;
	overflow-x: hidden;
	
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.footer > * {
	@apply pointer-events-auto flex flex-row justify-center items-center fixed bottom-0 w-screen;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to, .fade-enter {
  opacity: 0;
}
</style>