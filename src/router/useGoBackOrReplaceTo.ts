import { useRoute, useRouter, type RouteLocationNormalizedLoaded, type Router } from "vue-router";

export const useGoBackOrReplaceTo = (to: { name: string }) => {
	const router = useRouter();
	const route = useRoute();
	return () => goBackOrReplaceTo(to, router, route);
}

const goBackOrReplaceTo = (to: { name: string }, router: Router, route: RouteLocationNormalizedLoaded) => {
	/* if (route.meta?.prev == null) {
		router.replace(to);
	} else {
		const resolvedTo = router.resolve(to);
		const historyState = router.options.history.state;
		if (historyState.back != null && historyState.back === resolvedTo.fullPath) {
			router.go(-1);
		} else {
			router.replace(to);
		}
	} */
	if (route.meta?.prev == null) {
		router.replace(to);
	} else if (route.meta?.prev.name !== to.name) {
		router.push(to);
	} else {
		router.go(-1);
	}
}

export const tryGoBack = (fallbackTo: string | { name: string }, router: Router, route: RouteLocationNormalizedLoaded) => {
	if (route.meta?.prev == null) {
		router.replace(fallbackTo);
	} else {
		router.go(-1);
	}
}