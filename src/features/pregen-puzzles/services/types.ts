import type { BasicPuzzleConfig } from "@/lib/types.js";
import type { IPregenPuzzle } from "@/services/db/puzzles-db/models.js";

export type GeneratePuzzleFn = (conf: BasicPuzzleConfig) => Promise<IPregenPuzzle | null>;