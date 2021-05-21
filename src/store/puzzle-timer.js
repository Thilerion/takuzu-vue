const puzzleTimerModule = {

	namespaced: true,

	state: () => ({
		startTime: null,
		timeElapsed: 0,

		// current state
		started: false,
		running: false,
	}),

	getters: {

	},

	mutations: {
		setInitialTimeElapsed: (state, timeElapsed) => {
			if (state.started || state.running) {
				console.warn('Cant set initial time elapsed when timer is running or started...');
				return;
			}
			state.timeElapsed = timeElapsed;
		},
		start: state => {
			if (state.started && state.running) return;
			state.startTime = Date.now();
			state.started = true;
			state.running = true;
		},
		pause: state => {
			if (!state.running) {
				return;
			}
			const curElapsed = Date.now() - state.startTime;
			state.timeElapsed += curElapsed;

			state.running = false;
			state.startTime = null;
		},
		resume: state => {
			if (state.running) return;
			state.startTime = Date.now();
			state.running = true;
		},
		reset: state => {
			state.startTime = null;
			state.timeElapsed = 0;
			state.started = false;
			state.running = false;
		},
	},

	actions: {

	}

};

export default puzzleTimerModule;