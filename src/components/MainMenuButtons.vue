<template>
	<div class="flex flex-col items-center justify-start space-y-4">
		<router-link
			v-if="canContinue"
			:to="{ path: '/play', query: { continue: true}}"
			custom
			v-slot="{ navigate }"
		><BaseButton
			@click="navigate"
			class="btn-primary text-base uppercase shadow-md route-btn route-primary"
		>Continue</BaseButton></router-link>

		<router-link
			to="/play"
			custom
			v-slot="{ navigate }"
		><BaseButton
			@click="navigate"
			class="text-base uppercase route-btn route-primary"
			:class="{'btn-primary': !canContinue, 'shadow-md': !canContinue}"
		>New Game</BaseButton></router-link>

		<div class="pt-4">
			<router-link to="/how-to-play" class="route-btn route-secondary">How to play</router-link>
		</div>
	</div>
</template>

<script>
import BaseButton from '@/components/global/BaseButton';

export default {
	components: { BaseButton },
	props: {
		canContinue: Boolean,
	}
};
</script>

<style lang="postcss" scoped>
.route-btn {
	@apply w-2/3 font-normal;
	max-width: 18rem;
}
.route-btn.route-primary {
	@apply tracking-wider py-3;
}
.route-btn.route-secondary {
	@apply tracking-wide;
}
</style>