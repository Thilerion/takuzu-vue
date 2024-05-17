import { setActivePinia } from 'pinia';
import { useSharedPuzzleToggle } from '@/composables/use-puzzle-toggle.js';
import { createTestingPinia } from '@pinia/testing';
import { useSettingsStore } from '@/features/settings/store.js';

describe('usePuzzleToggle', () => {
	beforeEach(() => {
		const pinia = createTestingPinia({
			fakeApp: true
		});
		setActivePinia(pinia);
	})

	it('toggles to ZERO to ONE to EMPTY when mode is ZERO first', () => {		
		const settingsStore = useSettingsStore();
		settingsStore.toggleMode = '0';

		const { toggle } = useSharedPuzzleToggle();
		expect(toggle('.')).toBe('0');
		expect(toggle('0')).toBe('1');
		expect(toggle('1')).toBe('.');
	});

	it('toggles to ONE to ZERO to EMPTY when mode is ZERO first', () => {
		const settingsStore = useSettingsStore();
		settingsStore.toggleMode = '1';

		const { toggle } = useSharedPuzzleToggle();
		expect(toggle('.')).toBe('1');
		expect(toggle('1')).toBe('0');
		expect(toggle('0')).toBe('.');
	});

	// Add more tests to cover other transitions and toggle modes
});