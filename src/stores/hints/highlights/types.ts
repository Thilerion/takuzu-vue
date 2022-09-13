import { LineType } from "../../../lib/constants";
import { LineId } from "../../../lib/types";
import { Vec } from "../../../lib/types";

export enum HighlightLevel {
    PRIMARY = 'SECONDARY',
    SECONDARY = 'SECONDARY'
}
export const defaultLevel = HighlightLevel.PRIMARY;

export enum HighlightType {
    CELL = 'CELL',
    LINE = 'LINE',
    AREA = 'AREA'
}

export interface CellHL {
    type: HighlightType.CELL,
    level: HighlightLevel,
    cell: Vec
}
export interface LineHL {
    type: HighlightType.LINE,
    level: HighlightLevel,
    context: {
        lineId: LineId,
        lineType: LineType,
        width: number,
        height: number
    },
    start: Vec,
    end: Vec
}
export interface AreaHL {
    type: HighlightType.AREA,
    level: HighlightLevel,
    context: {
        width: number,
        height: number
    },
    start: Vec,
    end: Vec
}

export type HighlightData = LineHL | CellHL | AreaHL;