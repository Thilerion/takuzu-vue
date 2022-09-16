import { LineType, EMPTY } from "../../lib/constants";
import { LineId, Target, Vec } from "../../lib/types";
import { HintAction, HintType } from "./types";
import { basicTargetsToggleExecuteFn } from './helpers';
import { lineTypeFromLineId } from "../../lib/utils";

// region BASIC BALANCE
type BasicBalanceHintInputData = {
    targets: Target[];
    origin: [LineId];
};
const createBasicBalanceHintMessage = (lineName: LineType, lineId: LineId) => {
    return `A ${lineName} can be balanced. Look at ${lineName} ${lineId}`;
};
export const createBasicBalanceHint = (data: BasicBalanceHintInputData) => {
    const { targets, origin } = data;
    const [lineId] = origin;
    const lineName = lineTypeFromLineId(lineId);

    const getMessage = () => createBasicBalanceHintMessage(lineName, lineId);
    const title = `Line balance`;
    const subtitle = `${lineName}`;
    const primaryAction: HintAction = {
        kind: 'MakeMoves',
        label: 'Execute',
        execute: basicTargetsToggleExecuteFn(targets),
    };

    // TODO: private data for hint highlights maybe?
    const ctxData = { lineName, lineId };

    return {
        steps: 1 as const,
        type: HintType.BALANCE as const,
        title,
        subtitle,
        getMessage,
        primaryAction,
    };
};
// endregion

// region BASIC TRIPLES
type TriplesSubType = 'sandwich' | 'double';
type TriplesOrigin = [Vec, Vec];
type BasicTriplesHintInputData = {
    targets: Target[];
    origin: TriplesOrigin;
    type: TriplesSubType;
};
const createBasicTriplesHintMessage = (
    subType: TriplesSubType,
    origin: TriplesOrigin
) => {
    const [originA, originB] = origin;
    const originCoordsA = `${originA.x},${originA.y}`;
    const originCoordsB = `${originB.x},${originB.y}`;
    const originCoordsStr = `(${originCoordsA}) / (${originCoordsB})`;
    return `There is a ${subType} somewhere on the board: ${originCoordsStr}`;
};
export const createBasicTriplesHint = (data: BasicTriplesHintInputData) => {
    const { targets, origin, type: subType } = data;
    const getMessage = () => createBasicTriplesHintMessage(subType, origin);
    const title = `Max consecutive`;
    const subtitle = subType;
    const primaryAction: HintAction = {
        kind: 'MakeMoves',
        label: 'Execute',
        execute: basicTargetsToggleExecuteFn(targets),
    };
    return {
        steps: 1 as const,
        type: HintType.TRIPLES as const,
        title,
        subtitle,
        getMessage,
        primaryAction,
    };
};
//endregion

//region BASIC MISTAKE HINT
export const createBasicMistakeHint = (data: { cells: Vec[] }) => {
    const { cells } = data;
    const getMessage = () => {
        if (cells.length > 1) {
            return "It seems you've made some mistakes.";
        }
        return "It seems you've made a mistake.";
    };
    const title = cells.length > 1 ? 'Mistakes' : 'Mistake';
    const primaryAction: HintAction = {
        kind: 'MakeMoves',
        label: 'Fix',
        execute: ({ board, toggle }) => {
            for (const { x, y } of cells) {
                if (board.isCellEmpty(x, y)) continue;
                toggle({ x, y, value: EMPTY });
            }
        },
    };
    return {
        steps: 1 as const,
        type: HintType.MISTAKE as const,
        title,
        getMessage,
        primaryAction,
    };
};
//endregion

// region BASIC ELIMINATION HINT
type ElimSubType = `${number}-${number}`;
type BasicEliminationHintInputData = {
    targets: Target[];
    source: LineId[];
    elimType: ElimSubType;
};
export const createBasicEliminationHint = (
    data: BasicEliminationHintInputData
) => {
    const { targets, source, elimType } = data;

    const [lineId] = source;
    const lineName = lineTypeFromLineId(lineId);
    const getMessage = () => {
        return `Values can be eliminated from this ${lineName} (${lineId}).`;
    };
    const title = 'Elimination';
    const primaryAction: HintAction = {
        kind: 'MakeMoves',
        label: 'Execute',
        execute: basicTargetsToggleExecuteFn(targets),
    };
    return {
        steps: 1 as const,
        type: HintType.ELIMINATION as const,
        title,
        subtitle: elimType,
        getMessage,
        primaryAction,
    };
};
//endregion

// region BASIC ELIM_DUPE HINT
type BasicElimDupeHintInputData = BasicEliminationHintInputData & {
    targetLine: LineId;
};
export const createBasicElimDupeHint = (data: BasicElimDupeHintInputData) => {
    const { targets, elimType, targetLine, source } = data;
    const title = 'Possible duplicate lines';
    const subtitle = elimType;

    const lineId = targetLine;
    const lineName = lineTypeFromLineId(lineId);

    const sourceLines = source.join(',');
    const getMessage = () =>
        `${titleCase(
            lineName
        )} ${lineId} has potential duplicate ${lineName}s: "${sourceLines}". Values can be eliminated from this ${lineName}.`;

    const primaryAction: HintAction = {
        kind: 'MakeMoves',
        label: 'Execute',
        execute: basicTargetsToggleExecuteFn(targets),
    };

    return {
        steps: 1 as const,
        type: HintType.ELIM_DUPE as const,
        title,
        subtitle,
        getMessage,
        primaryAction,
    };
};
//endregion

function titleCase(str: string) {
    return str[0].toUpperCase() + str.slice(1);
}
type CreateHintByTypeMap = {
    [HintType.MISTAKE]: typeof createBasicMistakeHint,
    [HintType.TRIPLES]: typeof createBasicTriplesHint,
    [HintType.BALANCE]: typeof createBasicBalanceHint,
    [HintType.ELIMINATION]: typeof createBasicEliminationHint,
    [HintType.ELIM_DUPE]: typeof createBasicElimDupeHint,
}
export function createBasicHint<
    T extends keyof CreateHintByTypeMap,
    Fn extends CreateHintByTypeMap[T],
    Ret extends ReturnType<Fn>
>(
    type: T,
    data: Parameters<Fn>[0]
) {
    return hintGenerators[type](data as any) as Ret;
}