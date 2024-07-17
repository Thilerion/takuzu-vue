import { shuffleInPlace } from "@/utils/random.utils.js";
import type { IPregenPuzzle } from "@/features/pregen-puzzles/services/db/models.js";
import rawPregeneratedPuzzles from "./pregenerated.json";

// Puzzles are shuffled so puzzles of the same size and difficulty are not loaded in the same order every time the db is populated
const { generatedAt, generatorVersion, puzzles } = rawPregeneratedPuzzles;
const pregeneratedPuzzles = shuffleInPlace(puzzles) as IPregenPuzzle[];
// TODO: possibly validate rawPregeneratedPuzzles as actually being an array of IPregenPuzzle
export default {
	pregeneratedPuzzles,
	generatedAt,
	generatorVersion
}