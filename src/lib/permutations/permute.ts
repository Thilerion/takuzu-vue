export default function permuteUnique<T>(arr: T[]) {
	const perms: T[][] = [];
	_permuteRemaining(arr, perms);
	return perms;
}

const _permuteRemaining = (arr: unknown[], perms: unknown[][], index = 0, n = arr.length) => {
	if (index >= n) {
		perms.push([...arr]);
		return;
	}

	for (let i = index; i < n; i++) {
		if (_shouldSwap(arr, index, i)) {
			_swap(arr, index, i);
			_permuteRemaining(arr, perms, index + 1, n);
			_swap(arr, index, i);
		}
	}
}

const _shouldSwap = (arr: unknown[], start: number, cur: number) => {
	for (let i = start; i < cur; i++) {
		if (arr[i] === arr[cur]) return false;
	}
	return true;
}
const _swap = (arr: unknown[], idxA: number, idxB: number) => {
	const temp = arr[idxA];
	arr[idxA] = arr[idxB];
	arr[idxB] = temp;
}