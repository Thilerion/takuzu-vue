export enum RuleConflictType {
	MAX_CONSECUTIVE = 'three in a row',
	IMBALANCED = 'imbalanced',
	DUPLICATE_LINE = 'duplicate line'
}

export const ruleConflictTypes = [
	RuleConflictType.MAX_CONSECUTIVE,
	RuleConflictType.IMBALANCED,
	RuleConflictType.DUPLICATE_LINE
];