import { defineStore } from "pinia";

interface PendingState {
	startTime: null,
	timeElapsed: number,
	started: false,
	running: false
}
interface StartedState {
	startTime: number,
	timeElapsed: number,
	started: true,
	running: boolean
}
interface PausedState {
	startTime: null,
	timeElapsed: number,
	started: true,
	running: false
}
type PuzzleTimerState = PendingState | StartedState | PausedState;

export const usePuzzleTimer = defineStore('puzzleTimer', {
	state: () => ({
		startTime: null,
		timeElapsed: 0,

		started: false,
		running: false
	}) as PuzzleTimerState,

	getters: {},

	actions: {
		setInitialTimeElapsed(timeElapsed: number) {
			if (this.started || this.running) {
				console.warn('Cant set initial time elapsed when timer is running or started...');
				return;
			}
			this.timeElapsed = timeElapsed;
		},
		start() {
			if (this.started && this.running) return;
			this.startTime = Date.now();
			this.started = true;
			this.running = true;
		},
		pause() {
			if (!this.running) return;
			this.$patch({
				startTime: null,
				running: false,
				timeElapsed: this.timeElapsed + (Date.now() - this.startTime)
			})
		},
		resume() {
			if (this.running) return;
			this.startTime = Date.now();
			this.running = true;
		},
		reset() {
			this.$reset();
		}
	}
})