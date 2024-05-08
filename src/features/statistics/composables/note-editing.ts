import { createSharedComposable } from "@vueuse/core";
import { useStatisticsNextStore } from "../store.js";
import { ref, computed } from "vue";
import type { StatsDbExtendedStatisticDataEntry } from "@/services/db/stats-db/models.js";

export const useNoteEditing = createSharedComposable(() => {
	// If editing a puzzle's note, store its id
	const editingNoteId = ref<number | null>(null);
	const isEditingNote = computed(() => editingNoteId.value != null);
	const statsNextStore = useStatisticsNextStore();
	const updateNote = (id: number, note: string | undefined) => statsNextStore.updateNote(id, note);

	const currentlyEditedItem = computed((): StatsDbExtendedStatisticDataEntry | null => {
		if (editingNoteId.value == null) return null;
		return statsNextStore.historyItems!.find(i => i.id === editingNoteId.value)!;
	})
	const originalNote = computed((): string | undefined => currentlyEditedItem.value?.note);
	const unsavedNote = ref("");

	const startEditing = async (id: number) => {
		if (editingNoteId.value != null && editingNoteId.value !== id) {
			// If already editing a note, save it first
			await saveUpdatedNote();
		}
		editingNoteId.value = id;
		unsavedNote.value = statsNextStore.historyItems!.find(i => i.id === editingNoteId.value)?.note ?? "";
	}
	const cancelEditing = () => {
		editingNoteId.value = null;
		unsavedNote.value = "";
	}
	const saveUpdatedNote = async () => {
		if (editingNoteId.value == null) return;
		if (unsavedNote.value.trim() === "") {
			// Should remove note if unsaved note is empty
			await updateNote(editingNoteId.value, undefined);
		} else {
			await updateNote(editingNoteId.value, unsavedNote.value);
		}
		editingNoteId.value = null;
		unsavedNote.value = "";
	}

	return {
		editingNoteId,
		isEditingNote,

		originalNote,
		unsavedNote,
		startEditing,
		cancelEditing,
		saveUpdatedNote,
	}
})