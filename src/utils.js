import { boardTypes } from "./config";

export const dimensionsToBoardType = (w, h = w) => {
	if (w !== h) return boardTypes.RECT;
	if (w % 2 === 1) return boardTypes.ODD;
	return boardTypes.NORMAL;
}