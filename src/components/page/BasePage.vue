<template>
	<div class="wrapper">
		<div class="page">
			<BaseHeader />
			<BaseMain />
		</div>
		<div id="layers">
			<BaseFooter />
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
	}
};
</script>

<style lang="postcss" scoped>
.wrapper {
	height: 100%;
}
.wrapper, .page {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: flex-start;

}

#layers {
	pointer-events: none;
	position: fixed;
	height: 100vh;
	height: -webkit-fill-available;
	width: 100%;
	/* top: 0;
	left: 0;
	right: 0;
	bottom: 0; */
	
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
</style>