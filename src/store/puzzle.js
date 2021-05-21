import { SimpleBoard } from '../lib/board/Board';
import { sendWorkerMessage, initPuzzleWorkerReceiver } from '@/workers/generate-puzzle';

const defaultState = () => ({
	// game config
	width: null,
	height: null,
	difficulty: null,

	// game boards and state
	initialBoard: null,
	board: null,
	solution: null,
	moveList: [],

	// play/ui state
	initialized: false,
	started: false,
	paused: false,

	// game creation state/error
	loading: false,
	creationError: false,
});

const puzzleModule = {
	namespaced: true,

	modules: {
		// gameCheck
		// markedCells
	},

	state: defaultState(),

	getters: {

	},

	mutations: {
		setLoading: (state, val) => state.loading = val,
		setCreationError: (state, val) => state.creationError = val,
		setPuzzleConfig: (state, { width, height, difficulty }) => {
			state.width = width;
			state.height = height;
			state.difficulty = difficulty;
		},
		setAllBoards: (state, { board, solution, initialBoard }) => {
			state.board = board;
			state.solution = solution;
			state.initialBoard = initialBoard;
		},
		reset: state => Object.assign(state, defaultState()),
		setInitialized: (state, val) => state.initialized = val,

		// puzzle actions
		setValue: (state, {x, y, value}) => state.board.assign(x, y, value),
	},

	actions: {
		async createPuzzle({ commit }, { width, height, difficulty }) {
			commit('setLoading', true);
			
			try {
				// setup worker message receiving and sending
				const receivedDataPromise = initPuzzleWorkerReceiver();
				sendWorkerMessage({ width, height, difficulty });
				console.log('awaiting data...');
				const data = await receivedDataPromise;
				console.log('data received!');
				const {
					board: boardStr, solution: solutionStr
				} = data;

				const board = SimpleBoard.fromString(boardStr);
				const solution = SimpleBoard.fromString(solutionStr);

				commit('setAllBoards', {
					board, solution,
					initialBoard: board.copy()
				});
			} catch (e) {
				console.error('Failed creating board');
				console.warn(e);
				throw new Error(e);
			} finally {
				commit('setLoading', false);
			}		
		},
		async initPuzzle({ commit, dispatch }, puzzleConfig = {}) {
			try {
				await dispatch('createPuzzle', puzzleConfig);
				commit('setInitialized', true);
				commit('setPuzzleConfig', puzzleConfig);
			} catch (e) {
				commit('reset');
				commit('setCreationError', true);
				throw new Error(e);
			}
		}
	}

}

export default puzzleModule;