import { estimateStorage, persistStorage } from '@/services/storage-manager.js';
import Dexie from 'dexie';
import { DbHistoryEntry } from './models.js';
import { initVersions } from './versions.js';

const db = new Dexie('StatsDB');

initVersions(db);

db.open();

db.puzzleHistory.mapToClass(DbHistoryEntry);

persistStorage({ preventPermissionPrompt: true });

export { db };