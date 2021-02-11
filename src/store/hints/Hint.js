import { EMPTY } from '@/lib/constants';
import hintTypes from './hint-types';

let lastHintId = -1;

class Hint {
	constructor(type, message, targets, source = [], optionalData = {}) {
		this.id = ++lastHintId;
		this.message = message;
		this.targets = targets;
		this.source = source;

		this.type = type;

		const { subType, actions = [] } = optionalData;
		this.subType = subType;
		this.actions = actions;
	}
}

export const hintGenerators = {
	[hintTypes.MISTAKE]: (cells) => {
		const message = cells.length > 1 ?
			"It seems you've made some mistakes." :
			"It seems you've made a mistake.";
		const type = hintTypes.MISTAKE;
		const targets = [...cells];
		const source = [];
		return new Hint(type, message, targets, source);
	},
	[hintTypes.TRIPLES]: ({ targets, origin, type }) => {
		const message = `There is a ${type} somewhere on the board.`;
		const hintType = hintTypes.TRIPLES;
		const subType = type;

		const action = {
			label: 'Execute',
			onClick: (vm, store, hint) => {
				console.log('Executing triples hint now.');
				console.log(store.state.game);
				const board = store.state.game.board;
				hint.targets.forEach(target => {
					const { x, y, value } = target;
					const boardValue = board.get(x, y);
					if (boardValue !== EMPTY) return;
					store.dispatch('setValue', { x, y, value });
				})
			}
		}

		return new Hint(hintType, message, targets, origin, { subType, actions: [action] });
	}
}