export default class Timer {
	constructor(elapsed = 0) {
		this.running = false;
		this.paused = false;

		this.savedTime = elapsed;
		this.startTime = null;
		this.updatedTime = null;

		this.elapsed = 0;
		
		this._timeout = null;
	}

	getCurrentElapsed() {
		const updatedTime = performance.now();

		if (this.savedTime) {
			return updatedTime - this.startTime + this.savedTime;
		} else {
			return updatedTime - this.startTime;
		}
	}

	start() {
		if (this.running && !this.paused) {
			console.warn('Already running timer');
			return;
		}

		this.paused = false;
		this.running = true;

		this.startTime = performance.now();

		this.tick();
	}

	tick() {
		this.updatedTime = performance.now();

		if (this.savedTime) {
			this.elapsed = this.updatedTime - this.startTime + this.savedTime;
		} else {
			this.elapsed = this.updatedTime - this.startTime;
		}

		const distanceFromSec = this.elapsed % 1000;
		const distanceToSec = Math.floor(1000 - distanceFromSec);

		this._timeout = setTimeout(() => {
			this.tick();
		}, distanceToSec);
	}

	pause() {
		if (!this.running) {
			console.warn('Cant pause if timer hasnt started yet.');
			return;
		} else if (this.paused) {
			console.warn('Cant pause if timer already paused.');
			return;
		}

		clearTimeout(this._timeout);
		this.paused = true;


		this.updatedTime = performance.now();

		if (this.savedTime) {
			this.elapsed = this.updatedTime - this.startTime + this.savedTime;
		} else {
			this.elapsed = this.updatedTime - this.startTime;
		}


		this.savedTime = this.elapsed;
	}

	reset() {
		const origPaused = this.paused;

		this.pause();

		this.elapsed = 0;
		this.savedTime = 0;
		this.startTime = null;
		this.updatedTime = null;

		if (!origPaused) {
			this.start();
		}
	}
}