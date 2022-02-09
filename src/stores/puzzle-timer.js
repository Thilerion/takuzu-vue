import { defineStore } from "pinia";

export const usePuzzleTimer = defineStore('puzzleTimer', {
	state: () => ({
		startTime: null,
		timeElapsed: 0,

		started: false,
		running: false
	}),

	getters: {},

	actions: {
		setInitialTimeElapsed(timeElapsed) {
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
			const curElapsed = Date.now() - this.startTime;
			this.timeElapsed += curElapsed;

			this.running = false;
			this.startTime = null;
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