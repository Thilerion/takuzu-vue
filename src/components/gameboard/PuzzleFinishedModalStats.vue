<template>
	<div>
		hi there!
		<div>
			<BaseButton @click="$emit('exit-to', 'new-game')">Create new game</BaseButton>
			<BaseButton @click="$emit('exit-to', 'play-again')">Play again</BaseButton>
			<BaseButton @click="$emit('exit-to', 'home')">Home</BaseButton>
			<BaseButton @click="$emit('exit-to', 'statistics')">View all statistics</BaseButton>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		stats: {
			type: Object,
			required: true,
		},
		lastPuzzle: {
			type: Object,
			required: true,
		}
	},
	emits: ['exit-to'],
};
</script>

<style lang="postcss" scoped>
	
</style>