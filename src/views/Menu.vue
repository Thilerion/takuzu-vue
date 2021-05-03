<template>
	<div>
		<PageHeader>Takuzu</PageHeader>
		<router-link v-if="enableComponentShowcase" custom to="/showcase" v-slot="{ navigate }">
			<BaseButton @click="navigate" element="a">Open component showcase</BaseButton>
		</router-link>
		<div class="text-center p-2 text-sm text-gray-600">App version: {{ appVersion }}</div>
	</div>
</template>

<script>
export default {
	computed: {
		enableComponentShowcase() {
			return process.env.NODE_ENV === 'development';
		},
		appVersion() {
			return process.env.VUE_APP_VERSION;
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>