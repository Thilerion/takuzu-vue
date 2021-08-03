<template>
	<div class="check-indicator-wrapper">
		<transition name="checked">
			<div
				class="check-indicator"
				v-if="errorCheckValue != null && show"
				:key="errorCheckKey"
			>
				<div class="check-icon-wrapper">					
					<v-icon name="md-checkcircleoutline" class="correct check-icon" v-if="!errorFound" />
					<v-icon name="md-cancel-outlined" class="incorrect check-icon" v-else-if="errorFound" />
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
import OhVueIcon from "oh-vue-icons/dist/v3/icon.es";
import { MdCancelOutlined, MdCheckcircleoutline } from 'oh-vue-icons/icons';

export default {
	components: {
		"v-icon": OhVueIcon,
	},
	data() {
		return {
			show: false,
			animName: 'checked',
		}
	},
	computed: {
		errorCheckValue() {
			return this.$store.state.puzzle.assistance.incorrectCheck.currentMarked;
		},
		errorFound() {
			return Array.isArray(this.errorCheckValue) && this.errorCheckValue.length > 0;
		},
		errorCheckId() {
			// from store
			return this.$store.state.puzzle.assistance.incorrectCheck.checkId;
		},
		errorCheckKey() {
			return `${this.errorCheckId}`;
		},
		lastCheckedByUser() {
			return this.$store.state.puzzle.assistance.incorrectCheck.lastCheckType === 'user';
		}
	},
	watch: {
		errorCheckId(newValue, prevValue) {
			if (!this.lastCheckedByUser) {
				this.show = false;
				return;
			}
			if (newValue < prevValue) {
				this.show = false;
				return;
			}
			this.show = false;
			this.$nextTick(() => {
				this.show = true;
			})
		}
	},
	beforeMount() {
		OhVueIcon.add(MdCancelOutlined, MdCheckcircleoutline);
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
	width: 50vmin;
	height: 50vmin;
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