<template>
	<transition name="finished-modal3" :duration="{enter: 500, leave: 200}" @after-enter="afterEnterOuter" appear @after-leave="afterLeaveOuter">
		<div class="modal-wrapper w-full h-full flex" v-show="show">
			<transition name="finished-modal-inner" @after-enter="afterEnterInner">
				<div class="flex modal-expander backdrop" v-if="transitionInner">
					<div class="inner-content bg-white text-black w-full py-4 px-6 m-auto" :class="{'opacity-0': !showContent }">
						<PuzzleFinishedModalStats
							v-show="gameEndStats.width && lastPuzzleEntry.width"
							:stats="gameEndStats"
							:last-puzzle="lastPuzzleEntry"
							@exit-to="exitTo"
						/>
					</div>
				</div>
			</transition>
			<transition name="fade-base">
			<div class="encouragement-container" v-show="!fadeOutBase">
				<div class="encouragement" @click="emitClose">
					<div class="encouragement-text">{{goodJobString}}</div>
				</div>
			</div>
			</transition>
		</div>
	</transition>
</template>

<script>
import PuzzleFinishedModalStats from './PuzzleFinishedModalStats';

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
		PuzzleFinishedModalStats,
	},
	data() {
		return {
			transitionInner: false,
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
				console.warn('TODO: implement play again from modal');
				this.afterLeaveAction = () => {};
				this.playAgainAction();
				this.emitClose();
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
				console.warn('Error while trying to create new puzzle in PlayAgain')
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
			const idx = Math.floor(Math.random() * GOOD_JOB_STRINGS.length);
			this.goodJobString = GOOD_JOB_STRINGS[idx];
			this.show = true;
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
.encouragement-container {
	@apply bg-black text-white w-full my-auto flex justify-center items-center relative py-1;
	box-shadow: rgba(0, 0, 0, 0.35) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
}
.encouragement {
	min-height: 2rem;
	@apply px-4 py-6;
}
.encouragement-text {
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
.finished-modal3-enter-active .encouragement {
	opacity: 0;
  	animation: fadeInInner 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;	
}
.finished-modal3-enter-active .encouragement-container {	
	transition: box-shadow 0.5s ease;
}
.finished-modal3-enter-from .encouragement-container {
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
	@apply rounded overflow-hidden;
	transition: opacity .5s ease;
	min-height: 8rem;
}
</style>