<template>
<div
	ref="pageEl"
	class="how-to-play flex flex-col pb-4"
>
	<div class="tabbed-header sticky top-0 z-50 mb-4 transition-shadow duration-200" :class="[elevateHeader ? 'shadow-md' : 'shadow-sm']">
		<PageHeader
			class="flex-shrink-0 relative z-10"
			:elevated="false"
			:back-options="{ type: 'force', prevRouteName: 'Home' }"
		>{{ $t('HowToPlay.page-title') }}</PageHeader>
		<HowToPlayTabsList />
	</div>
	
	<div>
		
		<div
			class="bg-white dark:bg-slate-800 rounded-t-lg relative z-0 shadow-sm mb-6"
		>
			<router-view class="py-4" />
		</div>
	</div>
	<ScrollToTop ref="scrollToTopComponent" :el="pageEl" />
</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ScrollToTop from '@/components/base/ScrollToTop.vue';
import { useRoute } from 'vue-router';

const pageEl = ref<HTMLElement | null>(null);
const scrollToTopComponent = ref<null | InstanceType<typeof ScrollToTop>>(null);

const y = computed(() => {
	if (scrollToTopComponent.value == null) return 0;
	return scrollToTopComponent.value.y;
})
const elevateHeader = computed(() => y.value > 10);

const route = useRoute();
watch(() => route.name, () => {
	if (pageEl.value != null) {
		pageEl.value.scrollTo(0, 0);
	}
})
</script>

<style scoped>
.how-to-play {
	@apply overflow-x-hidden fixed inset-0 overscroll-y-auto;
}
</style>