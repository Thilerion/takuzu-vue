<template>
	<transition name="finished-modal3" :duration="{enter: 500, leave: 200}" @after-enter="afterEnterOuter" @after-leave="afterLeaveOuter">
		<div class="modal-wrapper w-full h-full flex" v-show="show">
			<transition name="finished-modal-inner" @after-enter="afterEnterInner">
				<div class="flex modal-expander backdrop" v-show="transitionInner">
					<div class="inner-content" :class="{'animate-modal-content': showContent}">
						<PuzzleRecap
							v-if="gameEndStats.width && lastPuzzleEntry.width && transitionInner"
							:stats="gameEndStats"
							:last-puzzle="lastPuzzleEntry"
							@exit-to="exitTo"
						/>
					</div>
				</div>
			</transition>
			<transition name="fade-base">
			<div class="banner-container" v-show="!fadeOutBase">
				<div class="banner" @click="emitClose">
					<div class="banner-text">{{goodJobString}}</div>
				</div>
			</div>
			</transition>
		</div>
	</transition>
</template>

<script>
import PuzzleRecap from './PuzzleRecap.vue';

const GOOD_JOB_STRINGS = [
	'Good job!',
	'Sensational!',
	'Wow!',
	'Terrific!',
	'Excellent!',
	'Outstanding!',
	'Sensational!',
	'Exceptional!',
	'Fantastic!',
	'Marvelous!',
	'Fabulous!',
	'Tremendous job!',
	'Superb!',
	'Way to go!',
	'Wonderful!',
	"Amazing!",
];

export default {
	emits: ['exit-game'],
	props: {
		finished: Boolean,
	},
	components: {
		PuzzleRecap,
	},
	data() {
		return {
			transitionInner: false,
			backdropEntered: false,
			fadeOutBase: false,
			showContent: false,

			afterEnterOuterTimeout: null,

			show: false,
			goodJobString: 'Good job!',

			afterLeaveAction: null,

			expandFromEncouragementDuration: 550,
		}
	},
	computed: {
		shouldShow() {
			return this.finished && !this.$store.state.stats.modalHidden;
		},
		gameEndStats() {
			return this.$store.state.stats.gameEndStats;
		},
		lastPuzzleEntry() {
			return this.$store.state.stats.lastPuzzleEntry;
		},
	},
	methods: {
		exitTo(destination) {
			if (destination === 'new-game') {
				this.afterLeaveAction = () => this.$router.go(-1);
				this.emitClose();
			} else if (destination === 'home') {
				this.afterLeaveAction = () => this.$router.replace({ name: 'MainMenu' });
				this.emitClose();
			} else if (destination === 'statistics') {
				this.afterLeaveAction = () => this.$router.replace({ name: 'Statistics' });
				this.emitClose();
			} else if (destination === 'play-again') {
				this.afterLeaveAction = () => {};
				this.playAgainAction().catch((err) => {
					// route to New Game screen if failed, where the message is also displayed
					console.log('Routing to new game screen because PlayAgain create-new-board failed');
					this.$router.go(-1);
				}).finally(() => {
					this.emitClose();
				})
			} else {
				console.log('No destination after leaving puzzleFinishedModal');
				this.afterLeaveAction = () => {};
				this.emitClose();
			}
		},
		async playAgainAction() {
			const { width, height, difficulty } = this.lastPuzzleEntry;
			try {
				this.$store.dispatch('puzzle/reset');
				await this.$store.dispatch('puzzle/initPuzzle', { width, height, difficulty });
				this.$store.commit('incrementPuzzleKey');
			} catch(e) {
				console.warn(e);
				console.warn('Error while trying to create new puzzle in PlayAgain');
				return Promise.reject();
			}
		},
		emitClose() {
			this.$store.commit('stats/setFinishedModalHidden', true);
		},
		afterEnterOuter() {
			this.afterEnterOuterTimeout = setTimeout(() => {
				this.transitionInner = true;
				this.fadeOutBase = true;
				this.afterEnterOuterTimeout = null;
			}, this.expandFromEncouragementDuration);
		},
		afterEnterInner() {
			this.showContent = true;
		},
		afterLeaveOuter() {
			setTimeout(() => {
				this.reset();
				this.afterLeaveAction();
			}, 100);
		},
		afterEnterBackdrop() {
			this.backdropEntered = true;
		},
		reset() {
			clearTimeout(this.afterEnterOuterTimeout);
			this.afterEnterOuterTimeout = null;
			this.transitionInner = false;
			this.fadeOutBase = false;
			this.showContent = false;
			this.show = false;
		},
		openModal() {
			this.reset();
			this.$nextTick(() => {
				const idx = Math.floor(Math.random() * GOOD_JOB_STRINGS.length);
				this.goodJobString = GOOD_JOB_STRINGS[idx];
				this.show = true;
			})
		}
	},
	watch: {
		shouldShow(value, prev) {
			if (value && !prev) {
				this.openModal();
			} else {
				this.show = false;
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
.banner-container {
	@apply bg-black text-white w-full my-auto flex justify-center items-center relative py-1;
	box-shadow: rgba(0, 0, 0, 0.35) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}
.banner {
	min-height: 2rem;
	@apply px-4 py-6;
}
.banner-text {
	@apply text-xl;
}
.backdrop {
	@apply h-full w-full text-white m-auto absolute p-6;
	background: linear-gradient(rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 35%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 1) 55%, rgba(0, 0, 0, 0.9) 65%, rgba(0, 0, 0, 0.8) 100%)
}

.finished-modal3-enter-active {
	transform: translateX(-100%);
  	animation: slideIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
.finished-modal3-enter-active .banner {
	opacity: 0;
  	animation: fadeInInner 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;	
}
.finished-modal3-enter-active .banner-container {	
	transition: box-shadow 0.5s ease;
}
.finished-modal3-enter-from .banner-container {
	box-shadow: rgba(0, 0, 0, 0) 0px 54px 55px, rgba(0, 0, 0, 0) 0px -12px 30px, rgba(0, 0, 0, 0) 0px 4px 6px, rgba(0, 0, 0, 0) 0px 12px 13px, rgba(0, 0, 0, 0) 0px -3px 5px;
}
.finished-modal3-leave-active {
	transition: opacity .2s ease;
}
.finished-modal3-leave-to {
	opacity: 0;
}
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes fadeInInner {
	0% {
		opacity: 0;		
	}
	20% {
		opacity: 0;
	}
	100% {
		opacity: 1;		
	}
}
@keyframes fadeOut {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}

.finished-modal-inner-enter-active {
	transform: scaleY(0.01) scaleX(1);
  	animation: unfoldIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
.finished-modal-inner-enter-from {
	transform: scaleY(0.01) scaleX(1);
}
@keyframes unfoldIn {
0% {
    transform: scaleY(0.005) scaleX(1);
  }
  100% {
    transform: scaleY(1) scaleX(1);
  }
}

.fade-base-leave-active {
	transition: opacity .2s ease .15s;
}
.fade-base-leave-to {
	opacity: 0;
}

.inner-content {
	@apply rounded-t-xl rounded-b-md overflow-hidden flex m-auto w-full;
	min-height: 8rem;
	opacity: 0;
}
.animate-modal-content {
	animation: modalPop .3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes modalPop {
	0% {
		opacity: 0;
		transform: scale(0.90);
	}
	100% {
		opacity: 1;
		transform: scale(1);
	}
}
</style>