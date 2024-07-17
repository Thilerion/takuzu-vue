import type { BasicPuzzleConfig } from "@/lib/types.js";
import type { IPregenPuzzle } from "./db/models.js";

export type GeneratePuzzleFn = (conf: BasicPuzzleConfig) => Promise<IPregenPuzzle | null>;