import { useRoute, useRouter, type RouteLocationNormalizedLoaded, type Router } from "vue-router";

export const useGoBackOrReplaceTo = (to: { name: string }) => {
	const router = useRouter();
	const route = useRoute();
	return () => goBackOrReplaceTo(to, router, route);
}

const goBackOrReplaceTo = (to: { name: string }, router: Router, route: RouteLocationNormalizedLoaded) => {
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