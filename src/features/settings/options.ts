import type { RulerType } from './types';

export const rulerType = {
	NONE: '',
	COORDS: 'coords',
	COUNT_REMAINING: 'remainingCount',
	COUNT_CURRENT: 'currentCount'
} as const satisfies Record<string, RulerType>;

export const CheckButtonOption = {
	DISABLED: 'disabled',
	RULE_VIOLATIONS: 'ruleViolations',
	INCORRECT_VALUES: 'incorrectValues'
} as const;