import type { SupportedLocale } from "@/i18n/constants";
import type { GameEndStats } from "./GameEndStats";

// Generic interface for condition results
type RecapMessageConditionResult<Data> = {
	success: false;
	data?: undefined;
} | {
	success: true;
	data: Data;
}

type RecapMessageConditionFn<Data> = (stats: GameEndStats) => RecapMessageConditionResult<Data>;

// Generic interface for recap conditions
export interface BaseRecapMessageConfig<Type, Data> {
	type: Type;
	condition: RecapMessageConditionFn<Data>;
	priority: number;
	i18nKey: (data: Data, locale: SupportedLocale) => (string | { key: string, namedProperties?: Record<string, number | string> } | null);
}
export type RecapMessageEvaluateFnResult<Type, Data> = {
	success: false, data?: undefined
} | {
	success: true,
	data: Data,
	type: Type,
	i18nKey: (locale: SupportedLocale) => ReturnType<BaseRecapMessageConfig<Type, Data>['i18nKey']>
}
export type RecapMessageEvaluateFn<Type, Data> = (stats: GameEndStats) => RecapMessageEvaluateFnResult<Type, Data>;

export const createRecapMessageConfig = <const Type extends string, Data>(conf: BaseRecapMessageConfig<Type, Data>): BaseRecapMessageConfig<Type, Data> & {
	evaluate: RecapMessageEvaluateFn<Type, Data>
} => {
	const evaluate: RecapMessageEvaluateFn<Type, Data> = (stats: GameEndStats) => {
		const conditionResult = conf.condition(stats);
		if (!conditionResult.success) {
			return { success: false }
		}
		return {
			success: true,
			data: conditionResult.data as Data,
			type: conf.type as Type,
			i18nKey: (locale: SupportedLocale) => conf.i18nKey(conditionResult.data as Data, locale)
		}
	}
	return {
		...conf,
		evaluate
	};
}