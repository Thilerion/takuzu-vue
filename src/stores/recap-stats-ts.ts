import { DbHistoryEntry } from '@/services/stats/db/models/index';
import type { PuzzleStateData } from '@/services/stats/db/models/DbHistoryEntry';
import { defineStore } from 'pinia';
import { db as StatsDB } from '@/services/stats/db';
import { useMainStore } from './main';
import type { BasicPuzzleConfig, BoardShape, DifficultyKey } from '@/lib/types';
import { createRecapGameEndStats } from '@/services/stats/recap-stats';

/*
puzzleStore:
    recapStatsStore.addFinishedPuzzleToHistory(finishedPuzzleState)
PuzzleRecapContent.vue:
    saveNote()
    toggleFavorite()
    initilaized, count, currentTimeElapsed, best, previousBest, average, isFavorite, isSavedToDb, lastPuzzleEntry
    lastPuzzleEntry.note, .width, .height, .difficulty
    getRecapMessageType(recapStatsStore), getRecordMessageData(r, recapStatsStore)
usePuzzleRecapModalAction
    lastPuzzleEnrty
    hideModal()
PuzzleRecap.vue
    modalShown
*/

interface RecapModalStats {
    count: number, // count for puzzleConfig
    best: number | null,
    previousBest: number | null,
    average: number | null,
    previousAverage: number | null,
}
interface RecapSummaryData {
    countToday: number,
    previousCount: number,
    isTimeRecord: boolean,
    currentTimeElapsed: number,

    itemsPlayedWithDifficulty: number,
    itemsPlayedWithSize: number,

    totalSolved: number,
    totalSolvedToday: number,
    
    sizesPlayed: (BoardShape & { cells: number })[],
    difficultiesPlayed: DifficultyKey[],
    puzzleConfigsPlayed: (BasicPuzzleConfig & { cells: number })[],

    isReplay: boolean,
    previousPlays: DbHistoryEntry[]
}

type LoadedRecapStatsState = {
    modalShown: boolean,
    initialized: true,
    
    basics: RecapModalStats,
    summaries: RecapSummaryData,

    lastPuzzleEntry: DbHistoryEntry
}
type EmptyRecapStatsState = {
    modalShown: boolean,
    initialized: false,
    basics: null | Partial<RecapModalStats>,
    summaries: null | Partial<RecapSummaryData>,

    lastPuzzleEntry: null | DbHistoryEntry
}
type RecapStatsState = LoadedRecapStatsState | EmptyRecapStatsState;

const getEmptyState = (): EmptyRecapStatsState => ({
    modalShown: false,
    initialized: false,
    
    basics: null,
    summaries: null,
    lastPuzzleEntry: null
})

export const useRecapStatsTsStore = defineStore('recapStatsTs', {
    state: () => getEmptyState() as RecapStatsState,

    getters: {
        modalHidden: state => !state.modalShown,
        isSavedToDb: (state) => checkIsSavedToDb(state.lastPuzzleEntry),
        isFavorite: (state) => !!(state?.lastPuzzleEntry?.flags?.favorite),

        isFirstSolvedWithPuzzleConfig: state => state.initialized && state.summaries.previousCount === 0 && state.basics.count === 1,
		isFirstSolvedWithDifficulty: state => state.initialized && state.summaries.itemsPlayedWithDifficulty === 1,
		isFirstSolvedWithSize: state => state.initialized && state.summaries.itemsPlayedWithSize === 1,
    },

    actions: {
        reset() {
            this.$reset();
        },
        hideModal() {
            this.modalShown = false;
        },
        showModal() {
            this.modalShown = true;
        },

        async markFavorite(val = true) {
            if (!this.isSavedToDb) {
                console.warn('Cannot mark as favorite because puzzle is not saved to database.');
				return;
            }
            const { id, flags: currentFlags = {} } = this.lastPuzzleEntry!;
            const newFlags = {
                ...currentFlags,
                favorite: val ? 1 : 0 as 1 | 0
            }
            try {
                const success = await StatsDB.updateHistoryItem(id!, {
                    flags: newFlags
                });
                if (success) {
                    this.lastPuzzleEntry!.flags = {...newFlags};
                } else {
                    console.warn(`Could not set puzzle as "favorite = ${val}"`);
                }
                return success;
            } catch(e) {
                console.warn(`Could not set puzzle as "favorite = ${val}"`);
				console.error(e);
				return false;
            }
        },
        toggleFavorite(val?: boolean) {
            if (val == null) {
                val = !this.isFavorite;
            }
            return this.markFavorite(val);
        },
        async saveNote(note?: string | null | undefined) {
            if (!this.isSavedToDb) {
                console.warn('Cannot set note because puzzle is not saved to database.');
				return;
            }
            const id = this.lastPuzzleEntry!.id!;
            const note2 = note == null ? undefined : note;
            try {
                const success = await StatsDB.updateHistoryItem(id, {
                    note: note2
                })
                if (success) {
					console.log('Succesfully saved note.');
					this.lastPuzzleEntry!.note = note2;
				} else {
					console.error('Could not save note.');
				}
				return success;
			} catch (e) {
				console.warn('Error in saving note.');
				console.error(e);
				return false;
			}
        },

        async addFinishedPuzzleToHistory(pState: PuzzleStateData) {
            const entry = DbHistoryEntry.fromPuzzleState(pState);
            const shouldSave = !pState.assistance?.cheatsUsed || useMainStore().featureToggles.addPuzzleToHistoryWithCheats.isEnabled;

            if (shouldSave) {
                addFinishedPuzzleToDb(entry);
                if (entry.id == null) {
                    throw new Error('Add finsihed puzzle to db did not correctly add an id.');
                }
                console.log('Puzzle saved to history');
            }
            if (!shouldSave) {
                console.warn('Cheats used; will not save entry to history!');
            }
            
            this.setPuzzleEntry({ entry });
            this.initializeGameEndStats();
            return entry;
        },
        setPuzzleEntry({ entry }: { entry: DbHistoryEntry }) {
            this.lastPuzzleEntry = {
                ...entry
            };
        },

        setModalData(data: RecapModalStats) {
            this.basics = data;
        },
        setSummaryData(data: RecapSummaryData) {
            this.summaries = data;
        },
        async initializeGameEndStats() {
            const entry = this.lastPuzzleEntry!;
            const { timeElapsed: currentTimeElapsed } = entry;

            const data = await createRecapGameEndStats(entry);
            const { best, previousBest, average, previousAverage, count, ...restData } = data;

            const modalData: RecapModalStats = { count, best, previousAverage, average, previousBest };
            this.setModalData(modalData);

            const {
                difficultyCount: itemsPlayedWithDifficulty,
                sizeCount: itemsPlayedWithSize,
                ...restSummaryData
            } = restData;
            const summaryData: RecapSummaryData = {
                ...restSummaryData,
                currentTimeElapsed,
                itemsPlayedWithDifficulty,
                itemsPlayedWithSize
            };
            this.setSummaryData(summaryData);
            this.showModal();
            this.initialized = true;
        }
    }
})

async function addFinishedPuzzleToDb(entry: DbHistoryEntry) {
    try {
        const id = await StatsDB.addHistoryItem(entry, true);
        if (id == null || typeof id != 'number') {
            throw new Error('Did not receive a correct id after saving history entry.');
        }
        entry.id = id;
        return entry;
    } catch(e) {
        console.error(e);
        console.warn('Could not save history entry!');
        return entry;
    }
}

function checkIsSavedToDb(entry: DbHistoryEntry | null): entry is Omit<DbHistoryEntry, 'id'> & { id: number } {
    return entry != null && entry.id != null;
}