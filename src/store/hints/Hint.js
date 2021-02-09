import hintTypes from './hint-types';

let lastHintId = -1;

class Hint {
	constructor(type, message, targets, source = []) {
		this.id = ++lastHintId;
		this.message = message;
		this.targets = targets;
		this.source = source;

		this.type = type;
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
}