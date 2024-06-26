<template>
<div class="flex flex-col flex-1">
	<PageHeader
		small
		:elevated="true"
		:transparent="false"
		hide-back
	>Tools</PageHeader>
	<div class="flex-1 flex flex-col">
		<FullWidthPanelLayout class="text-left first:mt-4">
			<FullWidthPanelList class="transition-all duration-700">
				<template #content>
					<FullWidthPanelListItem
						tag="router-link"
						to="/editor"
					>{{ $t('PuzzleEditor.tools-link-text') }}</FullWidthPanelListItem>
					<FullWidthPanelListItem
						v-if="analysisToolEnabled"
						tag="router-link"
						to="/analysis"
					>Puzzle analysis and solver</FullWidthPanelListItem>
					<FullWidthPanelListItem
						v-if="lineCompletionsToolEnabled"
						tag="router-link"
						to="/line-completions"
					>Line completions</FullWidthPanelListItem>
				</template>
			</FullWidthPanelList>
		</FullWidthPanelLayout>
			
	</div>
</div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

const mainStore = useMainStore();
const analysisToolEnabled = computed(() => mainStore.featureToggles.analysisTool.isEnabled);
const lineCompletionsToolEnabled = computed(() => !!mainStore.debugMode);
</script>