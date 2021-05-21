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
		start: state => {
			state.startTime = Date.now();
			state.started = true;
			state.running = true;
		},
		pause: state => {
			const curElapsed = Date.now() - state.startTime;
			state.timeElapsed += curElapsed;

			state.running = false;
			state.startTime = null;
		},
		resume: state => {
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