<template>
<icon-ic-baseline-home v-if="icon === 'home'" />
<icon-ic-baseline-leaderboard v-else-if="icon === 'stats'" />
<icon-ic-baseline-settings v-else-if="icon === 'settings'" />
<icon-ic-baseline-more-horiz v-else-if="icon === 'more'" />
<icon-mdi-tools v-else-if="icon === 'tools'" />
</template>

<script setup lang="ts">
export type BottomNavIconNames = 'home' | 'stats' | 'settings' | 'more' | 'tools';
const props = defineProps<{
	icon: BottomNavIconNames
}>();
</script>

<style scoped>
.base-icon {
	font-size: 20px;
}
</style>