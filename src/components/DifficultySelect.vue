<template>
	<div class="difficulty-select">
		<button @click="changeDifficulty(-1)" class="arrow-btn left"><ArrowLeftIcon /></button>
		<div class="difficulty-current" :class="[`slide-${slideDirection}`]">
			<transition name="slide-label">
				<div class="difficulty-label" :key="currentStars">
					{{currentStars}}* - {{currentLabel}}
				</div>
			</transition>
		</div>
		<button @click="changeDifficulty(1)" class="arrow-btn right"><ArrowRightIcon /></button>
	</div>
</template>

<script>
import StarIcon from './common/StarIcon';
import ArrowLeftIcon from './common/ArrowLeftIcon';
import ArrowRightIcon from './common/ArrowRightIcon';

export default {
	components: {
		StarIcon,
		ArrowLeftIcon,
		ArrowRightIcon,
	},
	props: {
		modelValue: {
			type: Number,
			required: true
		},
		labels: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			slideDirection: 'left'
		}
	},
	computed: {
		currentLabel() {
			return this.labels[this.idx];
		},
		currentStars() {
			return this.modelValue;
		},
		idx() {
			return this.currentStars - 1;
		},
		max() {
			return this.labels.length;
		}
	},
	methods: {
		changeDifficulty(amount) {
			const nextIdx = (this.idx + amount + this.max) % this.max;
			
			if (amount < 0) {
				this.slideDirection = 'left';
			} else {
				this.slideDirection = 'right';
			}

			this.$emit('update:modelValue', nextIdx + 1);

		}
	}
};
</script>

<style lang="postcss" scoped>
.difficulty-select {
	border: 1px solid white;

	@apply grid p-0;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 32px 24px auto 24px 32px;
}

.arrow-btn {
	grid-row: 1 / span 2;
	align-self: stretch;
}
.arrow-btn.left {
	grid-column: 1 / span 2;
	@apply pl-2;
}
.arrow-btn.left > * {
	@apply mr-auto;
}
.arrow-btn.right {
	grid-column: 4 / span 2;
	@apply pr-2;
}
.arrow-btn.right > * {
	@apply ml-auto;
}

.difficulty-current {
	grid-row: 1 / span 2;
	grid-column: 2 / span 3;
	@apply relative;
	height: 3rem;
}

.difficulty-label {
	@apply flex px-1 py-2 m-auto items-center justify-center absolute w-full h-full;
}

.slide-label-enter-active, .slide-label-leave-active {
	transition: all .5s ease;
}

.slide-right > .slide-label-enter-from, .slide-left > .slide-label-leave-to {
	transform: translateX(50px);
	opacity: 0;
}
.slide-right > .slide-label-leave-to, .slide-left > .slide-label-enter-from {
	transform: translateX(-50px);
	opacity: 0;
}
</style>