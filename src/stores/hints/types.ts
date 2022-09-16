import { PuzzleBoards } from "../../lib/types";

export enum HintType {
    MISTAKE = 'MISTAKE',
    TRIPLES = 'TRIPLES',
    BALANCE = 'BALANCE',
    ELIMINATION = 'ELIMINATION',
    ELIM_DUPE = 'ELIM_DUPE',
}

export type ActionType = 'MakeMoves';
export interface ExecuteActionArgs {
    board: SimpleBoard;
    toggle: (v: Move) => void;
}
export type HintActionExecuteFn = (puzzleStoreData: ExecuteActionArgs) => void;
export interface HintAction {
    kind: ActionType;
    label: string;
    execute: HintActionExecuteFn;
}

export interface BasicHint<Type extends HintType = HintType> {
    steps: 1;
    title: string;
    subtitle?: string;
    getMessage: () => string;
    type: Type;
    primaryAction: HintAction;
    // TODO: add createHighlights to basicHint itself
    // createHighlights: () => HintHighlightTemp[],
    // TODO: add hintValidator to basicHint, maybe required
    validate?: ({ board, solution }: PuzzleBoards) => boolean,
}
