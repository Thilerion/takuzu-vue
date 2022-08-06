import type { Vec } from "@/lib/types";
import type { MarkedMistake } from "./types";

export const vecToMark = ({ x, y }: Vec): MarkedMistake => `${x},${y}`;
export const markToVec = (str: MarkedMistake): Vec => {
	const [x, y] = str.split(',').map(Number) as [number, number];
	return { x, y };
}

export const markedMistakeFromCellOrString = (cellOrMark: Vec | MarkedMistake): MarkedMistake => {
	return typeof cellOrMark === 'string' ? cellOrMark : vecToMark(cellOrMark);
}