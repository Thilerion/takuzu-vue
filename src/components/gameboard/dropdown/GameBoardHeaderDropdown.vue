<template>
	<BaseDropdown align-right align-below ref="dropdownRef" @toggled="dropdownToggled">
		<template #trigger="{ toggle }">
			<IconBtn @click="toggle" name="md-morevert">
				<icon-ic-baseline-more-vert />
			</IconBtn>
		</template>
		<template #content>
			<GameBoardDdBookmarkItems
				@close="closeDD"
			/>
			<BaseDropdownDivider />
			<BaseDropdownItem>
				<template #icon>
					<input type="checkbox" v-model="showTimer">
				</template>
				<span class="">{{ $t('Settings.show-timer') }}</span>
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
import type BaseDropdown from '@/components/global/dropdown/BaseDropdown.vue';

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
</script>

<style scoped>

</style>