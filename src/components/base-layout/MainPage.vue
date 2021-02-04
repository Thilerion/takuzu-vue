<template>
	<div class="wrapper">
		<div class="page" :style="{'padding-bottom': footerHeight }">
			<BaseMain />
		</div>
		<div id="layers">
			<BaseFooter v-model="footerHeight" />
		</div>
	</div>
</template>

<script>
import BaseHeader from '@/components/page/BaseHeader';
import BaseMain from '@/components/page/BaseMain';
import BaseFooter from '@/components/page/BaseFooter';

export default {
	components: {
		BaseHeader,
		BaseMain,
		BaseFooter,
	},
	data() {
		return {
			footerHeight: 0,
			more: 1
		}
	},
};
</script>

<style lang="postcss">
.wrapper, .wrapper > .page {
	display: flex;
	flex-direction: column;
	flex: 1;
}

#layers {
	pointer-events: none;
	position: fixed;
	height: 100vh;
	height: -webkit-fill-available;
	width: 100vw;
	overflow-x: hidden;
	
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
</style>