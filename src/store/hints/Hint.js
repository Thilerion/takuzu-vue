import hintTypes from './hint-types';

let lastHintId = -1;

class Hint {
	constructor(type, message, targets, source = [], additionalData = {}) {
		this.id = ++lastHintId;
		this.message = message;
		this.targets = targets;
		this.source = source;

		this.type = type;

		const { subType } = additionalData;
		this.subType = subType;
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
		return new Hint(hintType, message, targets, origin, { subType });
	}
}