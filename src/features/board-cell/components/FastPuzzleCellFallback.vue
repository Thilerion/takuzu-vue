<template>
<div>{{ value }}</div>
</template>

<script setup lang="ts">
import type { PuzzleValue } from '@/lib/constants.js';

defineProps<{
	value: PuzzleValue
}>();
</script>