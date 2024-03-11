<template>
	<div
		class="prose-slate dark:prose-invert prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto py-4 how-to-play-overview px-8"
	>
		<p>{{ $t('HowToPlay.overview.page-description') }}</p>

		<h2>{{ $t('HowToPlay.BasicRules.title') }}</h2>
		<HowToPlayThemedTranslation
			tag="p"
			keypath="HowToPlay.BasicRules.description"
		/>

		<h3 class="rule-heading">{{ $t('HowToPlay.BasicRules.balanced-lines.title') }}</h3>
		<ul>
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.BasicRules.balanced-lines.description-1"
			/>
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.BasicRules.balanced-lines.description-2"
			/>
			<HowToPlayExample :label="$t('HowToPlay.LabelCorrect')">
				<template #examples>
					<HowToPlayExampleCells
						:values="splitLine('110010')"
					/>
				</template>
				<template #explanation>
					<HowToPlayThemedTranslation
						tag="undefined"
						keypath="HowToPlay.BasicRules.balanced-lines.example-correct"
					/>
				</template>
			</HowToPlayExample>
			<HowToPlayExample :label="$t('HowToPlay.LabelIncorrect')">
				<template #examples>
					<HowToPlayExampleCells
						:values="splitLine('010010')"
						:incorrect="[0, 2, 3, 5]"
					/>
				</template>
				<template #explanation>
					<HowToPlayThemedTranslation
						tag="undefined"
						keypath="HowToPlay.BasicRules.balanced-lines.example-incorrect"
					/>
				</template>
			</HowToPlayExample>
		</ul>

		<h3 class="rule-heading">{{ $t('HowToPlay.BasicRules.max-two-consecutive.title') }}</h3>
		<ul>
			<li>{{ $t('HowToPlay.BasicRules.max-two-consecutive.description-1') }}</li>
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.BasicRules.max-two-consecutive.description-2"
			/>
			<HowToPlayExample :label="$t('HowToPlay.LabelCorrect')">
				<template #examples>
					<HowToPlayExampleCells
						:values="splitLine('11..00')"
					/>
				</template>
				<template #explanation>
					<HowToPlayThemedTranslation
						tag="undefined"
						keypath="HowToPlay.BasicRules.max-two-consecutive.example-correct"
					/>
				</template>
			</HowToPlayExample>
			<HowToPlayExample :label="$t('HowToPlay.LabelIncorrect')">
				<template #examples>
					<HowToPlayExampleCells
						:values="splitLine('111.00')"
						:incorrect="[0, 1, 2]"
					/>
				</template>
				<template #explanation>
					<HowToPlayThemedTranslation
						tag="undefined"
						keypath="HowToPlay.BasicRules.max-two-consecutive.example-incorrect"
					/>
				</template>
			</HowToPlayExample>
		</ul>

		<h3 class="rule-heading">{{ $t('HowToPlay.BasicRules.unique-rows-and-columns.title') }}</h3>
		<ul>
			<li>{{ $t('HowToPlay.BasicRules.unique-rows-and-columns.description-1') }}</li>
			<li>{{ $t('HowToPlay.BasicRules.unique-rows-and-columns.description-2') }}</li>
			<HowToPlayExample :label="$t('HowToPlay.BasicRules.unique-rows-and-columns.example-label')">
				<template #examples>
					<HowToPlayExampleCells
						:values="splitLine('1001')"
						:incorrect="[0, 1, 2, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('1001')"
						:incorrect="[0, 1, 2, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0110')"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0.1.')"
					/>
				</template>
			</HowToPlayExample>
		</ul>

		<h2>{{ $t('HowToPlay.Variations.title') }}</h2>
		<p>{{ $t('HowToPlay.Variations.description') }}</p>
		<h3>{{ $t('HowToPlay.Variations.Odd.title') }}</h3>
		<ul>
			<li>{{ $t('HowToPlay.Variations.Odd.description-1') }}</li>
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.Variations.Odd.description-2"
			/>
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.Variations.Odd.description-3"
			/>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { splitLine } from '@/lib/utils/puzzle-line.utils.js';
import { useI18n } from 'vue-i18n';
import { injectCellThemeData } from '@/components/gameboard/composables/useCellThemeProvider.js'
import { computed } from 'vue';
import HowToPlayThemedTranslation from './HowToPlayThemedTranslation.vue';

const { theme, type } = injectCellThemeData();
const { t } = useI18n();

const themedStrings = computed(() => {
	switch (theme.value) {
		case 'classic': {
			return {
				'symbolOne': t('Themed.classic.one'),
				'symbolZero': t('Themed.classic.zero'),
			}
		}
		case 'blue-red': {
			return {
				'symbolOne': t('Themed.bluered.one'),
				'symbolZero': t('Themed.bluered.zero'),
			}
		}
		case 'tictactoe': {
			return {
				'symbolOne': t('Themed.tictactoe.one'),
				'symbolZero': t('Themed.tictactoe.zero'),
			}
		}
		default: {
			const x: never = theme.value;
			throw new Error('unexpected theme in themedStrings');
		}
	}
})

</script>

<style scoped>
.how-to-play-overview {
	counter-reset: rule-heading 0;
}
.rule-heading {
	@apply relative pl-[1.875ch];
}
.rule-heading::before {
	counter-increment: rule-heading 1;
	content: counter(rule-heading)".";
	@apply absolute left-0 opacity-60;
}
</style>