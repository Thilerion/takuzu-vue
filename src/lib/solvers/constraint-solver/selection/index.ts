import * as selectCell from "./select-cell.js";
import * as selectValue from "./select-value.js";

export const selectCellStrategies = {
	"random": selectCell.randomCell,
	"firstEmpty": selectCell.firstEmptyCell,
	"fewestEmptyPeers": selectCell.fewestEmptyPeersCell,
} as const;

export type SelectCellStrategyName = keyof typeof selectCellStrategies;

export const selectValueStrategies = {
	"zeroFirst": selectValue.zeroFirstValue,
	"random": selectValue.randomValue,
	"leastConstraining": selectValue.leastConstrainingValue,
} as const;

export type SelectValueStrategyName = keyof typeof selectValueStrategies;