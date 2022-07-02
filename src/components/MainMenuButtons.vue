<template>
	<div class="flex flex-col items-center justify-start space-y-6 main-menu-buttons mx-auto">
		<router-link
			v-if="canContinue"
			:to="{ name: 'PlayPuzzle' }"
			custom
			v-slot="{ navigate }"
		><ContinueButton
			@click="navigate"
			class="btn-primary shadow-md route-btn route-primary continue-btn relative"
			v-bind="saveData"
		></ContinueButton></router-link>

		<router-link
			:to="{ name: 'NewPuzzleFreePlay' }"
			custom
			v-slot="{ navigate }"
		><BaseButton
			@click="navigate"
			class="text-base uppercase route-btn route-primary"
			:class="{'btn-primary': !canContinue, 'shadow-md': !canContinue, 'shadow-sm': canContinue }"
		>New Game</BaseButton></router-link>

		<div class="flex w-full space-x-6">
			<router-link
				custom
				v-slot="{navigate}"
				to="/help"
			><BaseButton
				@click="navigate"
				class="route-btn route-secondary w-1/2"
			>Help</BaseButton></router-link>

			<router-link
				custom
				v-slot="{navigate}"
				to="/help/tutorial"
			><BaseButton
				@click="navigate"
				class="route-btn route-secondary w-1/2"
			>Tutorial</BaseButton></router-link>
		</div>
	</div>
</template>

<script setup>
import { DIFFICULTY_LABELS } from "@/config";
import { timeFormatter } from "@/utils/date.utils.js";
import { computed, toRefs } from "vue";


const props = defineProps({
	canContinue: Boolean,
	saveData: Object
});

const { canContinue, saveData } = toRefs(props);

const msToTime = timeFormatter({
	padMinutes: true
});

const continueData = computed(() => {
	if (saveData.value == null) return {};
	const { width, height, difficulty, timeElapsed} = saveData.value;
	const formattedTime = msToTime(timeElapsed);
	const diffLabel = DIFFICULTY_LABELS[difficulty];

	const dimensions = `${width}x${height}`;

	return { dimensions, difficulty: diffLabel, time: formattedTime };
})
</script>

<style scoped>
.main-menu-buttons {
	@apply w-4/6;
}

.route-btn {
	@apply w-full font-normal;
	@apply transition-colors;
}
.route-btn.btn-primary {
	--shadow-color: 12, 148, 136;
	--tw-shadow: 0 6px 14px 1px rgba(var(--shadow-color), 0.3), 0 4px 6px -2px rgba(var(--shadow-color), 0.35);
}
.route-primary {
	@apply tracking-wider h-14;
}
.route-secondary {
	@apply tracking-wide h-12;
}
</style>