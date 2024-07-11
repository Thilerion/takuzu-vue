<template>
<template v-if="props.wrapperTag == null">{{ str }}</template>
<component :is="wrapperTag" v-else>{{ str }}</component>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';

const props = defineProps<{
	amount: number,
	outline?: boolean,
	wrapperTag?: string | Component
}>();

const char = computed(() => props.outline ? '☆' : '★');
const str = computed(() => char.value.repeat(props.amount));
</script>