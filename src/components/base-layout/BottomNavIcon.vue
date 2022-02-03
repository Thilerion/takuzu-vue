<template>
	<icon-ic-baseline-home v-if="icon === 'home'" />
	<icon-ic-baseline-leaderboard v-if="icon === 'stats'" />
	<icon-ic-baseline-settings v-if="icon === 'settings'" />
	<icon-ic-baseline-more-horiz v-if="icon === 'more'" />
</template>

<script>
export default {
	props: {
		icon: {
			type: String,
			required: true
		}
	}
};
</script>

<style scoped>
.base-icon {
	font-size: 20px;
}
</style>