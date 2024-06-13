<template>
<div class="flex flex-col flex-1">
	<PageHeader
		small
		:elevated="true"
		:transparent="false"
		hide-back
	>Tools</PageHeader>
	<div class="flex-1 text-center flex flex-col">
		<div class="text-left first:mt-4">
			<BasicLinkList class="divide-y divide-gray-150 bg-white px-4 rounded-xl shadow-lg transition-all duration-700">
				<BasicLinkListItem v-if="customPuzzleToolEnabled"><router-link to="/custom-create">{{ $t('PuzzleEditor.tools-link-text') }}</router-link></BasicLinkListItem>
				<BasicLinkListItem v-if="analysisToolEnabled"><router-link to="/analysis">Puzzle analysis and solver</router-link></BasicLinkListItem>
			</BasicLinkList>
		</div>
			
	</div>
</div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

const mainStore = useMainStore();
const customPuzzleToolEnabled = computed(() => mainStore.featureToggles.customPuzzleTool.isEnabled);
const analysisToolEnabled = computed(() => mainStore.featureToggles.analysisTool.isEnabled);
</script>