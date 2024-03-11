type Grid<T> = T[][];

export const array2d = <T = unknown>(width: number, height = width, value: T) => {
	return Array(height).fill(null).map(() => Array(width).fill(value));
}
export const cloneArray2d = <T>(arr2: Grid<T>): Grid<T> => {
	return arr2.map(row => [...row]);
}