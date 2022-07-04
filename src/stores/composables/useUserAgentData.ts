export interface UserAgentData {
	brands?: UADBrand[],
	mobile?: boolean,
	platform?: string,
}
export interface UADBrand {
	brand: string,
	version: number
}

declare global {
	interface Navigator {
		userAgentData?: UserAgentData
	}
}

export const useUserAgentData = () => {
	const uaData = window?.navigator?.userAgentData ?? {};
	const {
		mobile = null,
		brands = [],
		platform = null
	} = uaData;
	return { mobile, brands, platform };
}