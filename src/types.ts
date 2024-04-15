export type Primitive = string | boolean | number | symbol | bigint | null | undefined;
export type NonNullishPrimitive = Exclude<Primitive, null | undefined>;

/** PickOptional accepts an object and one or more properties of that object, and returns a type with those properties marked as optional, keeping the rest of the original type the same. */
export type PickOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** PickRequired accepts an object and one or more properties of that object, and returns a type with those properties marked as required, keeping the rest of the original type the same. */
export type PickRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** PartialExcept accepts an object and one or more properties of that object, and returns a type with all properties markeda as optional, except for the the specified properties. */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

type NonFunctionKeyNames<T> = Exclude<{
	[key in keyof T] : T[key] extends () => void ? never : key;
  }[keyof T], undefined>;
   
export type RemoveFunctions<T> = Pick<T, NonFunctionKeyNames<T>>;