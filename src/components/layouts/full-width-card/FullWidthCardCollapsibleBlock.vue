<template>
<FullWidthCardBlock>
	<template #default>
		<FullWidthCardContent padding-y="py-0">
			<button class="w-full py-4" @click="expanded = !expanded">
				<div class="w-full flex justify-between items-center">
					<slot name="header" />
					<BaseOpenClosedIcon :open="expanded" />
				</div>
			</button>
			<ExpandTransition :show="expanded" @after-enter="$emit('after-enter')">
				<slot
					:expanded="expanded"
					:set-expanded="(val: boolean) => expanded = val"
				/>
			</ExpandTransition>
		</FullWidthCardContent>
	</template>
</FullWidthCardBlock>
</template>

<script setup lang="ts">
const expanded = defineModel<boolean>('expanded', { default: false });

const emit = defineEmits<{
	(e: 'after-enter'): void;
}>();
</script>