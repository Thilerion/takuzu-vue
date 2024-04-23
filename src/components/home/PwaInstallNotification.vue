<template>
	<transition name="t-fade">
	<div
		v-show="enableInstallNotification"
		class="bg-slate-800/80 text-white rounded p-2 pl-0.5 w-full text-left  max-w-md mx-auto grid not-grid gap-x-1"
	>
		<IconBtn @click="dismiss" class="self-center col-start-1 row-start-1 row-span-2 mr-auto">
			<icon-ic-baseline-close />
		</IconBtn>
		<h2 class="col-start-2 row-start-1 w-full block text-sm font-medium tracking-wide">{{ $t('PwaInstallNotification.add-to-homescreen') }}</h2>
		<div class="col-start-3 row-start-1 row-span-2 self-center pl-2">
			<BaseButton
				class="ml-auto !rounded-full !text-sm !py-1 !px-0 !w-[8ch]"
				@click="prompt"
			>{{ $t('PwaInstallNotification.install') }}</BaseButton>
		</div>
		<div class="col-start-2 col-span-1 text-xs">{{ $t('PwaInstallNotification.pwa-install-pros') }}</div>
	</div>
	</transition>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import { computed, onBeforeMount, toRefs } from 'vue';
import { useDeferredInstallPrompt } from '@/composables/use-deferred-install-prompt';
import { useIsPwaInstalled } from '@/stores/composables/useIsPwaInstalled';
import { useStorage } from '@vueuse/core';

const mainStore = useMainStore();
const { visits, handledFirstVisit } = toRefs(mainStore.visitData);

const { canPrompt, showInstallPrompt } = useDeferredInstallPrompt();

const { isInstalled } = useIsPwaInstalled();

const reverseDismissalAfter = 1000 * 60 * 60 * 24 * 2; // 2 days
const isDismissed = useStorage<{
	value: boolean, enableAt: null | number
}>(
	'takuzu_install-notification-dismissed',
	{ value: false, enableAt: null },
	localStorage,
	{ writeDefaults: true }
);

const enableInstallNotification = computed(() => {
	if (!canPrompt.value || isDismissed.value.value) return false;
	return !isInstalled.value && (
		handledFirstVisit.value || visits.value >= 4
	)
})

const prompt = () => {
	if (!canPrompt.value) return;
	showInstallPrompt();
}

onBeforeMount(() => {
	if (!isDismissed.value.value) return;
	const enableAt = isDismissed.value.enableAt;
	if (enableAt != null && enableAt < Date.now()) {
		isDismissed.value = {
			value: false,
			enableAt: null
		}
	}
})

const dismiss = () => {
	isDismissed.value = {
		value: true,
		enableAt: Date.now() + reverseDismissalAfter
	}
}

</script>

<style scoped>
.not-grid {
	grid-template-columns: auto 1fr auto;
}

.t-fade-enter-active, .t-fade-leave-active {
	@apply transition-opacity duration-150;
}
.t-fade-enter-from, .t-fade-leave-to {
	@apply opacity-0;
}
</style>