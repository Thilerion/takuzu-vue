<template>
<transition name="finished-modal" :duration="{enter: 1100, leave: 800}">
	<div class="puzzle-finished-modal w-full h-full flex">
		<div class="modal-backdrop bg-black bg-opacity-80 w-full h-full flex">
			<div class="modal-content2 bg-red-200 relative z-10">
				<BaseButton @click="emitClose">CLOSE</BaseButton>
			</div>
		</div>
	</div>
</transition>
</template>

<script>
export default {
	components: {
	},
	emits: ['exit-game'],
	computed: {
		gameEndStats() {
			return this.$store.state.stats.gameEndStats;
		},
		lastPuzzleEntry() {
			return this.$store.state.stats.lastPuzzleEntry;
		},
		modalHidden() {
			return this.$store.state.stats.modalHidden;
		}
	},
	unmounted() {
		// this.$store.dispatch('stats/clearGameEndStats');
	},
	methods: {
		emitClose() {
			this.$store.commit('stats/setModalVisibility', true);
			setTimeout(() => {
				// this.$emit('exit-game');
			}, 400);
		}
	}
};
</script>

<style lang="postcss">
/* Source for animation: https://codepen.io/designcouch/pen/obvKxm */
.finished-modal-enter-active {
	transform: scaleY(0.01) scaleX(0);
  	animation: unfoldIn 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;	
}
.finished-modal-enter-active .modal-content2 {
	transform: scale(0.8);
	opacity: 0;
  	animation: zoomIn 0.6s 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.finished-modal-leave-active {
	opacity: 1;
  	animation: fadeOut 0.5s 0.05s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}
.finished-modal-leave-active .modal-content2 {
	animation: zoomOut 0.8s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.modal-content2 {
	width: 200px;
	height: 200px;
	margin: auto;
}

@keyframes fadeOut {
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
}

@keyframes unfoldIn {
  0% {
    transform: scaleY(0.005) scaleX(0);
  }
  50% {
    transform: scaleY(0.005) scaleX(1);
  }
  100% {
    transform: scaleY(1) scaleX(1);
  }
}
@keyframes unfoldOut {
  0% {
    transform: scaleY(1) scaleX(1);
  }
  50% {
    transform: scaleY(0.005) scaleX(1);
  }
  100% {
    transform: scaleY(0.005) scaleX(0);
  }
}
@keyframes zoomIn {
  0% {
    transform: scale(0.8);
	opacity: 0;
  }
  100% {
	  opacity: 1;
	  transform: scale(1);
  }
}
@keyframes zoomOut {
  0% {
    transform: scale(1);
	opacity: 1;
  }
  100% {
    transform: scale(1.2);
	opacity: 0;
  }
}
</style>