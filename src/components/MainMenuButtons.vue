<template>
<div class="flex flex-col items-center justify-start main-menu-buttons mx-auto max-w-sm">
	<div class="primary-container flex flex-col justify-start w-full gap-y-6">
		<router-link
			v-if="validSaveData"
			v-slot="{ navigate }"
			:to="{ name: 'PlayPuzzle' }"
			custom
		><ContinueButton
			class="btn-primary shadow-md route-btn route-primary continue-btn relative"
			v-bind="validSaveData"
			@click="navigate"
		/></router-link>

		<router-link
			v-slot="{ navigate }"
			:to="{ name: 'NewPuzzleFreePlay' }"
			custom
		><BaseButton
			class="text-base uppercase route-btn route-primary"
			:class="{'btn-primary': !canContinue, 'shadow-md': !canContinue, 'shadow-sm': canContinue }"
			@click="navigate"
		>{{ $t('Home.buttons.new-game') }}</BaseButton></router-link>
	</div>
		

	<div class="flex w-full gap-x-6 secondary-container">
		<router-link
			v-slot="{navigate}"
			custom
			to="/help"
		><BaseButton
			class="route-btn route-secondary flex-1"
			@click="navigate"
		>{{ $t('Home.buttons.help') }}</BaseButton></router-link>

		<router-link
			v-if="HAS_TUTORIAL_ROUTE"
			v-slot="{navigate}"
			custom
			to="/help/tutorial"
		><BaseButton
			class="route-btn route-secondary flex-1"
			@click="navigate"
		>$t('Home.buttons.tutorial')</BaseButton></router-link>
	</div>
</div>
</template>

<script setup lang="ts">
import type { SaveData } from "@/services/savegame/types";
import { computed, toRefs } from "vue";
export type ContinueButtonSaveDataProps = Pick<SaveData, "timeElapsed" | "width" | "height" | "difficulty">;

const HAS_TUTORIAL_ROUTE = false; // whether to display the, currently (feb 2024) unimplemented Tutorial route, link

const props = defineProps<{
	canContinue?: boolean,
	saveData: ContinueButtonSaveDataProps | null
}>();

const validSaveData = computed((): false | SaveData => {
	if (props.canContinue) {
		return props.saveData as SaveData;
	}
	return false;
})

const { canContinue } = toRefs(props);
</script>

<style scoped>
.main-menu-buttons {
	@apply w-4/6;
}

.route-btn {
	@apply font-normal;
	@apply transition-colors;
}
.route-btn.btn-primary {
	--shadow-color: 12, 148, 136;
	--tw-shadow: 0 6px 14px 1px rgba(var(--shadow-color), 0.3), 0 4px 6px -2px rgba(var(--shadow-color), 0.35);
}
.route-primary {
	@apply tracking-wider h-14 w-full;
}
.route-secondary {
	@apply tracking-wide h-12;
}

.secondary-container {
	padding-top: clamp(1.5rem, 8vh, 5rem);
}
</style>