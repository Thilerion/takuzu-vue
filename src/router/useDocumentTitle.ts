import { ref, watch } from "vue";
import type { RouteLocationNormalized } from "vue-router";
export type UseRouteDocumentTitleOpts = {
	defaultTitle?: string;
	titlePrefix?: string;
};


export const useRouteDocumentTitle = ({
	defaultTitle = 'Takuzu',
	titlePrefix = '',
}: UseRouteDocumentTitleOpts) => {
	const title = ref(document.title);

	if (!title.value && !!defaultTitle) {
		title.value = defaultTitle;
	}

	const updateTitleWithRouteMeta = (to: RouteLocationNormalized) => {
		const metaTitle = to.meta?.title;

		let newTitle = metaTitle ? `${titlePrefix}${metaTitle}` : null;

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