<template>
<template v-if="!withoutWrapper">
	<component :is="tag" @[eventName]="toggle"><slot /></component>
</template>
<template v-else>
	<slot @[eventName]="toggle" />
</template>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { useCollapsible } from './use-collapsible.js';

const props = withDefaults(defineProps<{
	withoutWrapper?: boolean,
	tag?: string | Component,
	eventName?: string | null,
}>(), {
	withoutWrapper: false,
	tag: 'button',
	eventName: 'click'
});

const { toggle } = useCollapsible();
</script>