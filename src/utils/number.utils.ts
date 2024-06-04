export const asPercentage = (value: number) => value.toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);

export const normalize = (value: number, min: number, max: number) => {
	return (value - min) / (max - min);
}