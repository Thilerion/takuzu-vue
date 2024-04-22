<template>
	<div class="prose-slate dark:prose-invert prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto py-4 px-0 basic-techniques-page relative">
		<h2>{{ $t('HowToPlay.tabs.basic-techniques') }}</h2>
		<p>{{ $t('HowToPlay.BasicTechniques.description') }}</p>

		<div class="techniques breakout">
			<h3>{{ $t('HowToPlay.BasicTechniques.pairs-and-sandwiches.title') }}</h3>
			<p>{{ $t('HowToPlay.BasicTechniques.pairs-and-sandwiches.description') }}
			</p>

			<h4>{{ $t('HowToPlay.BasicTechniques.pairs-and-sandwiches.pairs') }}</h4>
			<p>{{ $t('HowToPlay.BasicTechniques.pairs-and-sandwiches.pairs-description', { symbolOrColorPlural: valueTypeDisplayPlural, symbolOrColor: valueTypeDisplay }) }}</p>
			<HowToPlayExample el="div" label="" class="border-y breakout bg-white/5 dark:border-slate-200/50 px-8 py-4">
				<template #examples>
					<HowToPlayExampleCells :values="splitLine('.00.')" />
					<span class="">Becomes:</span>
					<HowToPlayExampleCells :values="splitLine('1001')" />
				</template>
			</HowToPlayExample>

			<h4>{{ $t('HowToPlay.BasicTechniques.pairs-and-sandwiches.sandwiches') }}</h4>
			<p>{{ $t('HowToPlay.BasicTechniques.pairs-and-sandwiches.sandwiches-description',  { symbolOrColorPlural: valueTypeDisplayPlural, symbolOrColor: valueTypeDisplay }) }}</p>
			<HowToPlayExample el="div" label="" class="border-y breakout bg-white/5 dark:border-slate-200/50 px-8 py-4">
				<template #examples>
					<HowToPlayExampleCells :values="splitLine('.1.1..')" />
					<span class="">Becomes:</span>
					<HowToPlayExampleCells :values="splitLine('.101..')" />
				</template>
			</HowToPlayExample>

			<h3>{{ $t('HowToPlay.BasicTechniques.line-completion.title') }}</h3>
			<HowToPlayThemedTranslation
				tag="p"
				keypath="HowToPlay.BasicTechniques.line-completion.description"
			/>
			<p><strong>{{$t('tip')}}: </strong> {{ $t('HowToPlay.BasicTechniques.line-completion.tip',  { symbolOrColorPlural: valueTypeDisplayPlural, symbolOrColor: valueTypeDisplay }) }}</p>
			<HowToPlayExample el="div" label="" class="border-y breakout bg-white/5 dark:border-slate-200/50 px-8 pb-0 pt-4">
				<template #examples>
					<HowToPlayExampleCells :values="splitLine('1..110')" />
					<HowToPlayExampleCells :values="splitLine('100110')" />
				</template>
				<template #explanation>
					<HowToPlayThemedTranslation
						tag="undefined"
						keypath="HowToPlay.BasicTechniques.line-completion.example"
					>
						<template #symbolOrColor>{{ valueTypeDisplay }}</template>
						<template #symbolOrColorPlural>{{ valueTypeDisplayPlural }}</template>
					</HowToPlayThemedTranslation>
				</template>
			</HowToPlayExample>

			<h3>{{ $t('HowToPlay.BasicTechniques.unique-lines.title') }}</h3>
			<p>{{ $t('HowToPlay.BasicTechniques.unique-lines.description') }}</p>
			<p><strong class="mr-1">{{ $t('HowToPlay.BasicTechniques.unique-lines.when-to-use-label') }}</strong>
					<HowToPlayThemedTranslation
						tag="undefined"
						keypath="HowToPlay.BasicTechniques.unique-lines.when-to-use-text"
					>
						<template #symbolOrColor>{{ valueTypeDisplay }}</template>
						<template #symbolOrColorPlural>{{ valueTypeDisplayPlural }}</template>
					</HowToPlayThemedTranslation></p>
			<HowToPlayExample class="border-y breakout bg-white/5 dark:border-slate-200/50 px-8 py-4" el="div" :label="$t('HowToPlay.BasicTechniques.unique-lines.example-label')">
				<template #examples>
					<HowToPlayExampleCells
						class="mt-2"
						:values="splitLine('1.0.')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('1001')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0110')"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0.1.')"
						class="opacity-40"
					/>
					<div class="my-1">{{ $t('HowToPlay.BasicTechniques.unique-lines.example-label-2') }}</div>
					<HowToPlayExampleCells
						:values="splitLine('1100')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('1001')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0110')"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0.1.')"
						class="opacity-40"
					/>
				</template>
			</HowToPlayExample>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { injectCellThemeData } from '../gameboard/composables/useCellThemeProvider.js';
import { useDynamicPuzzleSymbolString } from '../dynamic-symbols/useDynamicPuzzleSymbolString.js';
import { useI18n } from 'vue-i18n';
import { splitLine } from '@/lib/utils/puzzle-line.utils.js';

const { theme: cellTheme, type: cellThemeType } = injectCellThemeData();
const { $p } = useDynamicPuzzleSymbolString(
	cellTheme, cellThemeType
);
const { t } = useI18n();
const valueTypeDisplay = computed(() => {
	return t($p('symbol', false));
})
const valueTypeDisplayPlural = computed(() => {
	return t($p('symbol', true));
})
</script>

<style scoped>
.basic-techniques-page {
	counter-reset: technique-heading 0;
}
.basic-techniques-page > *:not(.breakout) {
	@apply px-8;
}
.techniques > *:not(.breakout) {
	@apply mx-8;
}

.techniques h3 {
	@apply relative pl-[1.875ch];
}

.techniques h4 {
	@apply relative pl-[3ch];
}

.techniques h3 {
	counter-reset: sub-technique-heading 0;
}

.techniques h3::before {
	counter-increment: technique-heading 1;
	content: counter(technique-heading)".";
	@apply absolute left-0 opacity-60;
}

.techniques h4::before {
	counter-increment: sub-technique-heading 1;
	content: counter(technique-heading) counter(sub-technique-heading, lower-alpha)".";
	@apply absolute left-0 opacity-60;
}
</style>