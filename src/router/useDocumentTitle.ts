import { ref, watch } from "vue";
import type { RouteLocationNormalized } from "vue-router";

export type UseRouteDocumentTitleOpts = {
	defaultTitle: string;
	titlePrefix: string;
};

export const useRouteDocumentTitle = ({
	defaultTitle,
	titlePrefix,
}: UseRouteDocumentTitleOpts) => {
	const title = ref(document.title);

	if (!title.value && !!defaultTitle) {
		title.value = defaultTitle;
	}

	const updateTitleWithRouteMeta = (to: RouteLocationNormalized) => {
		const metaTitle = to.meta?.title;

		if (metaTitle === '') {
			// use base title, probably Home route
			title.value = defaultTitle;
			return;
		} else if (metaTitle == null) {
			// previously would do nothing here, which means previous route's title would persist
			// however, because route.meta is merged from parent to child in current Vue Router version, this means we should use the default title here
			title.value = defaultTitle;
			return;
		}

		const newTitle = `${titlePrefix}${metaTitle}`;
		title.value = newTitle;
	}

	watch(title, (newTitle, prevTitle) => {
		if (newTitle != prevTitle) document.title = newTitle;
	})

	return {
		title,
		updateTitleWithRouteMeta,
	}
}