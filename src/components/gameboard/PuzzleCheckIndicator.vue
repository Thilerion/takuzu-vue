<template>
	<div class="check-indicator-wrapper">
		<transition name="checked">
			<div
				class="check-indicator"
				v-if="errorCheckValue != null && show"
				:key="errorCheckKey"
			>
				<div class="check-icon-wrapper">
					<span v-if="!errorFound" class="correct check-icon material-icons-outlined">check_circle</span>
					<span v-else-if="errorFound" class="incorrect check-icon material-icons-outlined">cancel</span>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
export default {
	data() {
		return {
			show: false,
			animName: 'checked',
		}
	},
	computed: {
		errorCheckValue() {
			return this.$store.state.puzzle.assistance.errorCheckResult;
		},
		errorFound() {
			return !!this.errorCheckValue;
		},
		errorCheckId() {
			// from store
			return this.$store.state.puzzle.assistance.errorCheckId;
		},
		errorCheckKey() {
			return `${this.errorCheckId}-${this.errorCheckValue}`;
		}
	},
	watch: {
		errorCheckId() {
			this.show = false;
			this.$nextTick(() => {
				this.show = true;
			})
		}
	}
};
</script>

<style lang="postcss" scoped>
.check-indicator-wrapper {
	@apply pointer-events-none fixed top-0 left-0 z-10 flex justify-center items-center;
	height: var(--vh-total);
	width: 100vw;
}
.check-indicator {
	@apply opacity-0;
}

.correct {
	@apply  text-green-600;
}
.incorrect {
	@apply  text-red-700;
}
.check-icon {
	font-size: 50vmin;
}
.check-icon-wrapper {
	position: absolute inset-0 flex justify-center items-center;
}

.checked-enter-active {
	opacity: 0;
	animation: checkedAnim 2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
@keyframes checkedAnim {
	0% {
		opacity: 0;
	}
	8% {
		opacity: 0.8;
	}
	12% {
		opacity: 0.8;
	}
	100% {
		opacity: 0;
	}
}
.checked-leave-active {
	display: none;
	position: absolute;
}
</style>