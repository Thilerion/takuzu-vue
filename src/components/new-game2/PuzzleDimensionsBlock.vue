<template>
	<div class="dim-block flex flex-wrap gap-2 mb-6 last:mb-0 relative">
		<transition-group name="list">
			<GameModeDimensionsButton
				v-for="preset in presets"
				:width="preset.width"
				:height="preset.height"
				:selected="preset.width === selectedDimensions.width && preset.height === selectedDimensions.height"
				:tall="preset.width !== preset.height"
				:key="preset.width + preset.height"
				@click="() => $emit('select', preset)"
			></GameModeDimensionsButton>
		</transition-group>
	</div>
</template>

<script setup>
import GameModeDimensionsButton from './GameModeDimensionsButton.vue';
const props = defineProps({
	presets: {
		type: Object,
		required: true
	},
	selectedDimensions: {
		type: Object,
		required: true
	}
})

defineEmits(['select']);
</script>

<style scoped>
.dim-block > * {
	@apply flex-initial;
	max-width: 5rem;
	width: calc((100% - 2.5rem) / 5);
	min-width: 6ch;
}

@media screen and (max-width: 330px) {
	.dim-block {
		@apply gap-1 mb-4;
	}
}
  .list-enter-from {
    opacity: 0;
    transform: scale(0.6);
  }
  .list-enter-active {
    transition: all 0.3s ease;
  }
  .list-leave-to {
    opacity: 0;
  }
  .list-leave-active {
    transition: all 0.2s ease;
	position: absolute;
  }

  .list-move {
	  transition: all 0.25s ease 0.15s;
  }
</style>