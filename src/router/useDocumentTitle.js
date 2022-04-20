import { ref, watch } from "vue";

export const useRouteDocumentTitle = ({
	defaultTitle = 'Takuzu',
	titlePrefix,
}) => {
	const title = ref(document.title);

	if (!title && !!defaultTitle) {
		title.value = defaultTitle;
	}

	const updateTitleWithRouteMeta = (to, from) => {
		let newTitle = to?.meta?.title;

		if (titlePrefix && newTitle) {
			newTitle = `${titlePrefix}${newTitle}`;
		} else if (titlePrefix) {
			newTitle = defaultTitle;
		}

		if (!!newTitle && newTitle !== title.value) {
			title.value = newTitle;
		}
	}

	watch(title, (newTitle, prevTitle) => {
		if (newTitle != prevTitle) document.title = newTitle;
	})

	return {
		title,
		updateTitleWithRouteMeta,
	}
}