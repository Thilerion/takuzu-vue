<template>
<div class="prose-slate dark:prose-invert prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto py-4 px-0 basic-techniques-page relative">
	<h2 class="px-8">{{ $t('HowToPlay.tabs.basic-techniques') }}</h2>

	<div class="technique-group">
		<h3>{{ $t('HowToPlay.BasicTechniques.identify-pairs.name') }}</h3>
		<HowToPlayThemedTranslation
			tag="p"
			keypath="HowToPlay.BasicTechniques.identify-pairs.description"
		/>
		<HowToPlayExample
			el="div"
			label=""
			class="border-y bg-white/5 dark:border-slate-200/50 px-4 py-4"
		>
			<template #examples>
				<HowToPlayExampleCells :values="splitLine('.00.')" />
				<span>{{ $t('HowToPlay.BasicTechniques.Becomes:') }}</span>
				<HowToPlayExampleCells :values="splitLine('1001')" />
			</template>
		</HowToPlayExample>
	</div>

	<div class="technique-group">
		<h3>{{ $t('HowToPlay.BasicTechniques.identify-sandwiches.name') }}</h3>
		<HowToPlayThemedTranslation
			tag="p"
			keypath="HowToPlay.BasicTechniques.identify-sandwiches.description"
		/>
		<HowToPlayExample
			el="div"
			label=""
			class="border-y bg-white/5 dark:border-slate-200/50 px-4 py-4"
		>
			<template #examples>
				<HowToPlayExampleCells :values="splitLine('.1.1..')" />
				<span>{{ $t('HowToPlay.BasicTechniques.Becomes:') }}</span>
				<HowToPlayExampleCells :values="splitLine('.101..')" />
			</template>
		</HowToPlayExample>
	</div>

	<div class="technique-group">
		<h3>{{ $t('HowToPlay.BasicTechniques.fill-lines.name') }}</h3>
		<HowToPlayThemedTranslation
			tag="p"
			keypath="HowToPlay.BasicTechniques.fill-lines.description"
		/>
		<HowToPlayExample
			el="div"
			label=""
			class="border-y bg-white/5 dark:border-slate-200/50 px-4 pb-0 pt-4"
		>
			<template #examples>
				<HowToPlayExampleCells :values="splitLine('1..110')" />
				<span>{{ $t('HowToPlay.BasicTechniques.Becomes:') }}</span>
				<HowToPlayExampleCells :values="splitLine('100110')" />
			</template>
			<template #explanation>
				<HowToPlayThemedTranslation
					tag="undefined"
					keypath="HowToPlay.BasicTechniques.fill-lines.example"
				/>
			</template>
		</HowToPlayExample>
	</div>

	<div class="technique-group">
		<h3>{{ $t('HowToPlay.BasicTechniques.prevent-duplicate-lines.name') }}</h3>
		<HowToPlayThemedTranslation
			tag="p"
			keypath="HowToPlay.BasicTechniques.prevent-duplicate-lines.description"
		/>
		<HowToPlayExample
			class="border-y bg-white/5 dark:border-slate-200/50 px-4 py-4"
			el="div"
			:label="$t('HowToPlay.BasicTechniques.prevent-duplicate-lines.example-label')"
		>
			<template #examples>
				<HowToPlayExampleCells
					class="mt-2"
					:values="splitLine('1.0.')"
					:highlight="[1, 3]"
				/>
				<HowToPlayExampleCells
					:values="splitLine('1001')"
				/>
				<HowToPlayExampleCells
					:values="splitLine('0110')"
					class="opacity-40"
				/>
				<HowToPlayExampleCells
					:values="splitLine('0.1.')"
					class="opacity-40"
				/>
				<div class="my-1">{{ $t('HowToPlay.BasicTechniques.prevent-duplicate-lines.example-label-2') }}</div>
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
import { splitLine } from '@/lib/utils/puzzle-line.utils.js';


</script>

<style scoped>
.basic-techniques-page {
	counter-reset: technique-heading 0;
}

.technique-group {
	@apply px-8;
}

.technique-group h3 {
	@apply relative pl-[1.875ch] text-base font-medium;
}

.technique-group h3::before {
	counter-increment: technique-heading 1;
	content: counter(technique-heading)".";
	@apply absolute left-0 opacity-60;
}
</style>