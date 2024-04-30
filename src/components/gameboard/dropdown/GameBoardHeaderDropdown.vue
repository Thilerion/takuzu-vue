<template>
<BaseDropdown
	ref="dropdownRef"
	align-right
	align-below
	@toggled="dropdownToggled"
>
	<template #trigger="{ toggle }">
		<IconBtn name="md-morevert" @click="toggle">
			<icon-ic-baseline-more-vert />
		</IconBtn>
	</template>
	<template #content>
		<GameBoardDdBookmarkItems
			@close-dropdown="closeDD"
			@toggle-bookmark-manager="setBookmarkManagerOpened"
		/>
		<BaseDropdownDivider />
		<BaseDropdownItem>
			<template #icon>
				<input v-model="showTimer" type="checkbox">
			</template>
			<span>{{ $t('Settings.show-timer') }}</span>
		</BaseDropdownItem>
		<BaseDropdownDivider />

		<template v-if="debugModeEnabled">
			<DebugModeItems
				@close="closeDD"
			/>
			<BaseDropdownDivider />
		</template>

		<BaseDropdownItem @click="goToSettings">
			<template #icon>
				<icon-ic-baseline-settings class="opacity-80" />
			</template>
			<span class="mt-px">{{ $t('routeButton.settings') }}</span>
		</BaseDropdownItem>
	</template>
</BaseDropdown>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main.js';
import { useSettingsStore } from '@/stores/settings/store.js';
import { ref } from 'vue';
import { toRef } from 'vue';
import type BaseDropdown from '@/components/base/dropdown/BaseDropdown.vue';
import { usePlayPuzzleUiStateStore } from '@/stores/puzzle/play-ui-state-store.js';

const settingsStore = useSettingsStore();
const showTimer = toRef(settingsStore, 'showTimer');

const mainStore = useMainStore();
const debugModeEnabled = toRef(mainStore, 'debugMode');


const emit = defineEmits<{
	'open-settings': [],
	'dropdown-toggled': [val: boolean]
}>();
const dropdownRef = ref<InstanceType<typeof BaseDropdown> | null>(null);
const closeDD = () => dropdownRef.value!.closeDropdownMenu();

const goToSettings = () => {
	closeDD();
	emit('open-settings');
}

const dropdownToggled = (val: boolean) => {
	emit('dropdown-toggled', val);
}
const uiStateStore = usePlayPuzzleUiStateStore();
const setBookmarkManagerOpened = (val: boolean) => {
	uiStateStore.setBookmarkManagerOpen(val);
}
</script>