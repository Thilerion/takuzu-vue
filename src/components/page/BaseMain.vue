<template>
	<main>
		<router-view v-slot="{ Component }">
			<transition name="fade" mode="out-in">
					<component :is="Component" />
			</transition>
		</router-view>
	</main>
</template>

<script>
export default {

};
</script>

<style lang="postcss">
main {
	flex: 1;
	min-height: 100%;
	display: flex;
	flex-direction: column;
	padding-bottom: 1rem;
}
main > *:first-child {
	flex: 1;
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