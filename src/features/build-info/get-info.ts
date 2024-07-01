import type { BuildInfoDetails } from "./types.js";

const BUILD_INFO_DETAILS = Object.freeze(__GLOBAL_BUILD_INFO_DETAILS__);

export function getBuildInfoDetails(): BuildInfoDetails {
	return BUILD_INFO_DETAILS;
}