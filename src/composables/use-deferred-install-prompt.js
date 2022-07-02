import { useIsPwaInstalled } from '@/stores/composables/useIsPwaInstalled';
import { computed, ref } from 'vue';

const deferredPrompt = ref(null);
const promptOutcome = ref(null);
let hasPromptListener = false;
let hasInstalledListener = false;

const checkMediaForStandaloneInstalled = (timeoutMS = 1000) => {
	const { check } = useIsPwaInstalled();
	setTimeout(() => {
		check();
	}, timeoutMS);
}

export const initInstallPromptListener = () => {
	if (hasPromptListener) return;

	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt.value = e;
		console.log('received before install prompt!');
	})
	hasPromptListener = true;
}
export const initInstalledListener = () => {
	if (hasInstalledListener) return;

	window.addEventListener('appinstalled', () => {
		// only supported on chromium mobile browsers for now
		// needed in addition to the deferred prompt outcome to handle installations from address bar or other methods
		promptOutcome.value = true;
		checkMediaForStandaloneInstalled();
		console.log('[event appinstalled]: PWA was installed');
	})
	hasInstalledListener = true;
}

export const initListeners = () => {
	initInstallPromptListener();
	initInstalledListener();
}

const showInstallPrompt = async () => {
	if (!deferredPrompt.value) {
		console.warn('There is no deferred prompt...');
		throw new Error('There is no deferred prompt!');
	}
	deferredPrompt.value.prompt();

	const { outcome } = await deferredPrompt.value.userChoice;

	deferredPrompt.value = null;

	checkMediaForStandaloneInstalled();

	if (outcome === 'accepted') {
		console.log('User accepted the install prompt.');
		promptOutcome.value = true;
		return true;
	} else if (outcome === 'dismissed') {
		promptOutcome.value = false;
		console.log('User dismissed the install prompt');
		return false;
	}
}

export const useDeferredInstallPrompt = () => {
	initListeners();
	const canPrompt = computed(() => deferredPrompt.value != null);
	const hasPromptOutcome = computed(() => promptOutcome.value != null);

	return { promptOutcome, showInstallPrompt, canPrompt, hasPromptOutcome };
}