<template>
	<section>
		<h2>Current streak</h2>
		<div class="streak-length" :class="[active ? 'bg-green-600' : 'bg-gray-700']">{{length}}</div>
		<div class="text">{{currentStateText}}</div>
	</section>
</template>

<script setup>
import { computed } from 'vue';

const NO_STREAK = 'no streak';
const INACTIVE_STREAK = 'inactive streak';
const NEW_ACTIVE_STREAK = 'new streak started';
const ACTIVE_STREAK = 'maintained streak';

const STREAK_STATE_TEXT = {
	[NO_STREAK]: 'Play a puzzle to start a new streak!',
	[INACTIVE_STREAK]: 'Maintain your streak by playing a puzzle today!',
	[NEW_ACTIVE_STREAK]: "You've started a new streak today, keep it up!",
	[ACTIVE_STREAK]: "You've maintained your daily streak for today. Good job!"
};

const props = defineProps({
	active: {
		type: Boolean,
		required: true
	},
	from: {
		type: Date,
		required: true,
	},
	length: {
		type: Number,
		required: true
	}
})

const currentState = computed(() => {
	if (props.length === 0) {
		return NO_STREAK;
	} else if (props.length === 1 && props.active) {
		return NEW_ACTIVE_STREAK;
	}
	if (props.active) {
		return ACTIVE_STREAK;
	} else {
		return INACTIVE_STREAK;
	}
})

const currentStateText = computed(() => {
	return STREAK_STATE_TEXT[currentState.value];
})
</script>

<style scoped>

</style>