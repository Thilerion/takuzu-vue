<template>
	<div
		class="prose-a:text-teal-700 prose-a:underline prose-slate dark:prose-invert prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto py-4 px-8"
	>
		<h1 class="text-lg">{{ $t('HowToPlay.Overview.intro-heading') }}</h1>
		<p>{{ $t('HowToPlay.Overview.intro-names') }}</p>
		<HowToPlayThemedTranslation
			tag="p"
			keypath="HowToPlay.Overview.intro-description"
		/>

		<h2>{{ $t('HowToPlay.Overview.goal-heading') }}</h2>
		<HowToPlayThemedTranslation
			tag="p"
			keypath="HowToPlay.Overview.goal-text"
		/>

		<h2>{{ $t('HowToPlay.Overview.rules-heading') }}</h2>
		<router-link class="text-sm" :to="{ name: 'PuzzleRulesInfo'}">{{ $t('HowToPlay.Overview.rules-link') }}</router-link>
		<ol class="list-decimal">
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.Overview.rules-list-1"
			/>
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.Overview.rules-list-2"
			/>
			<HowToPlayThemedTranslation
				tag="li"
				keypath="HowToPlay.Overview.rules-list-3"
			/>
		</ol>
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>