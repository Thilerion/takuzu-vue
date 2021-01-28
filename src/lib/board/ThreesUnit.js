import { COLUMN, ROW } from "../constants";

export class ThreesUnit {
	constructor(x, y, type, board) {
		this._board = board;

		this.x = x;
		this.y = y;
		this.type = type;

		this.id = `${type === ROW ? 'h' : 'v'}-${x},${y}`;


		this.coords = [
			this.getCoords(0),
			this.getCoords(1),
			this.getCoords(2),
		]
		this._values = null;
	}

	get values() {
		if (this._values == null) {
			this._values = this.coords.map(({ x, y }) => {
				return this._board.get(x, y);
			})
		}
		return this._values;
	}

	toString() {
		return this.values.join('');
	}

	getCoords(i) {
		const coord = { x: this.x, y: this.y };
		if (this.type === ROW) coord.x += i;
		else if (this.type === COLUMN) coord.y += i;
		return coord;
	}
	
	getAllCoords() {
		return this.coords.map(coord => {
			return { x: coord.x, y: coord.y };
		});
	}
}