<template>
<FullWidthCardBlock>
	<template #default>
		<FullWidthCardContent padding-y="py-0">
			<button class="w-full py-4" @click="expanded = !expanded">
				<div class="w-full flex justify-between items-center">
					<slot name="header" />
					<icon-ic-outline-keyboard-arrow-down
						class="ml-auto transition-transform duration-500 text-base"
						:class="{ 'rotate-180': expanded }"
					/>
				</div>
			</button>
			<ExpandTransition :show="expanded">
				<slot :expanded="expanded" :set-expanded="(val: boolean) => expanded = val" />
			</ExpandTransition>
		</FullWidthCardContent>
	</template>
</FullWidthCardBlock>
</template>

<script setup lang="ts">
const expanded = defineModel<boolean>('expanded', { default: false });
</script>