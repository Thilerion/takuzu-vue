<template>
	<div class="difficulty-select">
		<button
			@click="changeDifficulty(-1, $event)"
			class="arrow-btn left z-10"
		><ArrowLeftIcon /></button>
		<div class="difficulty-current z-0" :class="[`slide-${slideDirection}`]">
			<transition name="slide-label">
				<DifficultyLabel
					:stars="currentStars"
					:label="currentLabel"
					:key="currentStars"
				/>
			</transition>
		</div>
		<button
			@click="changeDifficulty(1, $event)"
			class="arrow-btn right z-10"
		><ArrowRightIcon /></button>
	</div>
</template>

<script>
import ArrowLeftIcon from '../common/ArrowLeftIcon';
import ArrowRightIcon from '../common/ArrowRightIcon';
import DifficultyLabel from './DifficultyLabel';

export default {
	components: {
		DifficultyLabel,
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
		changeDifficulty(amount, event) {
			event.preventDefault();

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
	@apply grid p-0 overflow-hidden relative;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 2rem 2rem auto 2rem 2rem;
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
	height: 4rem;
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