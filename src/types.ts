export type Primitive = string | boolean | number | symbol | bigint | null | undefined;
export type NonNullishPrimitive = Exclude<Primitive, null | undefined>;