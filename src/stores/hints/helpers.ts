import { Target } from "../../lib/types";
import { HintActionExecuteFn } from "./types";

export const basicTargetsToggleExecuteFn = (targets: Target[]): HintActionExecuteFn =>
    ({ board, toggle }) => {
        targets.forEach(({ x, y, value }) => {
            if (board.isCellEmpty(x, y)) return;
            toggle({ x, y, value });
        });
    };
