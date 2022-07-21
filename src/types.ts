export type Primitive = string | boolean | number | symbol | bigint | null | undefined;
export type NonNullishPrimitive = Exclude<Primitive, null | undefined>;

export function assertUnreachable(value: never): asserts value is never {
	throw new Error(`Unexpected value: ${value}`);
}