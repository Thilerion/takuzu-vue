export type ConstraintResult = {
	changed: boolean,
	error?: null
} | {
	changed: false,
	error: string
};