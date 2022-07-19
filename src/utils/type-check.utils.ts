import type { NonNullishPrimitive, Primitive } from "@/types";

function getTypeWithObjectToString(val: unknown) {
	const res = Object.prototype.toString.call(val).replace(/[\][]/g, '').split(' ');
	return res.length ? res[1] : res[0];
}
export function isPrimitive(val: unknown): val is Primitive {
	const res = getTypeWithObjectToString(val);
	return [
		'String',
		'Boolean',
		'Number',
		'Symbol',
		'BigInt',
		'Null',
		'Undefined'
	].includes(res);
}
export function isNonNullishPrimitive(val: unknown): val is NonNullishPrimitive {
	return isPrimitive(val) && val != null;
}