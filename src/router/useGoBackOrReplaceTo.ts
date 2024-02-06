import type { Router } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { RouteLocationRaw } from "vue-router";
import { useRoute, useRouter } from "vue-router";

export const useGoBackOrReplaceTo = (to: RouteLocationRaw) => {
	const router = useRouter();
	const route = useRoute();
	return () => goBackOrReplaceTo(to, router, route);
}

const goBackOrReplaceTo = (to: RouteLocationRaw, router: Router, route: RouteLocationNormalizedLoaded) => {
	if (route.meta?.prev == null) {
		router.replace(to);
	} else {
		router.go(-1);
	}
}