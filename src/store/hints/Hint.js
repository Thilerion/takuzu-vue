import { EMPTY } from '@/lib/constants';
import { lineTypeFromLineId } from '@/lib/utils';
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
		// TODO: replace message coords with marking on board
		const originCoords = origin.map(({ x, y }) => `(${x},${y})`).join(' / ');
		const message = `There is a ${type} somewhere on the board: ${originCoords}`;
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
	},
	[hintTypes.BALANCE]: ({ targets, origin }) => {
		const lineId = origin[0];
		const lineName = lineTypeFromLineId(lineId);

		const action = {
			label: 'Execute',
			onClick: (vm, store, hint) => {
				console.log('Executing balance hint now.');
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
		
		const message = `A ${lineName} can be balanced (${lineName}: ${lineId})`;
		const type = hintTypes.BALANCE;
		return new Hint(type, message, targets, origin, {actions: [action]});
	},
	[hintTypes.ELIMINATION]: ({ targets, source, elimType }) => {
		// TODO: duplicate-line elimination
		const lineId = source[0];
		const lineName = lineTypeFromLineId(lineId);
		const message = `Values can be eliminated from this ${lineName} (${lineId}).`;
		const type = hintTypes.ELIMINATION;


		const action = {
			label: 'Execute',
			onClick: (vm, store, hint) => {
				console.log('Executing elim hint now.');
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

		return new Hint(type, message, targets, source, { subType: elimType, actions: [action] });
	},
}