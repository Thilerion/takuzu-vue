<template>
	<div class="wrapper">
		<div class="page pb-16">
			<main>
				<router-view v-slot="{ Component }">
					<transition name="fade" mode="out-in">
							<component :is="Component" />
					</transition>
				</router-view>
			</main>
		</div>
		<div class="footer">
			<div>
				<BottomNav />
			</div>
		</div>
	</div>
</template>

<script>
import BottomNav from './BottomNav.vue';

export default {
	components: {
		BottomNav,
	}
};
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
	position: fixed;
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