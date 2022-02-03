<template>
	<div
		class="loading-spinner"
		:style="cssVars"
	></div>
</template>

<script>
export default {
	props: {
		size: {
			type: Number,
			required: true
		}
	},
	computed: {
		baseSize() {
			return this.size;
		},
		marginSize() {
			return Math.floor(this.size / 8);
		},
		afterSize() {
			return this.baseSize - (2 * this.marginSize);
		},
		borderSize() {
			if (this.marginSize >= 8) return 6;
			if (this.marginSize >= 6) return 4;
			if (this.marginSize >= 4) return 3;
			return 2;
		},
		cssVars() {
			return {
				'--size': this.baseSize + 'px',
				'--after-size': this.afterSize + 'px',
				'--margin': this.marginSize + 'px',
				'--border': this.borderSize + 'px'
			}
		}
	}
};
</script>

<style scoped>
/* from: https://loading.io/css/ */
.loading-spinner {
  display: inline-block;
  width: var(--size);
  height: var(--size);
}
.loading-spinner:after {
  content: " ";
  display: block;
  width: var(--after-size);
  height: var(--after-size);
  margin: var(--margin);
  border-radius: 50%;
  border: var(--border) solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: loading-spinner 1.2s linear infinite;
}
@keyframes loading-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>