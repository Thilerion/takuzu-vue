import { readonly, ref, watch, type Ref } from "vue";

export type UseFileDialogOpts = {
	multiple?: boolean;
	accept?: string;
	onChange: (files: FileList | null) => void;
}

export type UseFileDialogReturn = {
	open: (openOpts: { reset?: boolean }) => void;
	reset: () => void;
	files: Ref<FileList | null>;
}

const defaultOpts: Required<UseFileDialogOpts> = {
	multiple: false,
	accept: "*",
	onChange: () => { }
}

export const useFileDialog = (opts: UseFileDialogOpts): UseFileDialogReturn => {
	const files = ref<FileList | null>(null);

	const input: HTMLInputElement = document.createElement("input");
	input.type = "file";

	const mergedOpts = { ...defaultOpts, ...opts };
	input.multiple = mergedOpts.multiple;
	input.accept = mergedOpts.accept;

	watch(files, (newFiles: FileList | null, prevFiles) => {
		if (newFiles === prevFiles) return;
		mergedOpts.onChange(newFiles);
	})

	input.onchange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		files.value = target.files;
	}

	const resetState = () => {
		files.value = null;
		input.value = '';
	}

	const open = ({ reset }: { reset?: boolean }) => {
		if (reset) {
			resetState();
		}
		input.click();
	}

	return {
		open,
		reset: resetState,
		files: readonly(files)
	}
}