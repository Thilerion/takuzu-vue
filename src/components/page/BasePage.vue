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
import BaseHeader from './BaseHeader';
import BaseMain from './BaseMain';
import BaseFooter from './BaseFooter';

export default {
	components: {
		BaseHeader,
		BaseMain,
		BaseFooter,
	},
	data() {
		return {
			footerHeight: 0
		}
	},
};
</script>

<style lang="postcss">
.wrapper, .wrapper > .page {
	min-height: 100%;
	min-height: 100vh;
	min-height: -webkit-fill-available;
	display: flex;
	flex-direction: column;
	/* align-items: stretch;
	justify-content: flex-start; */
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