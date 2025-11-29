import { useQueryStates } from "nuqs";
import {
	createSearchParamsCache,
	createSerializer,
	parseAsString,
} from "nuqs/server";

export const searchParamsParsers = {
	query: parseAsString.withDefault("").withOptions({
		shallow: false,
	}),
	catalog: parseAsString.withDefault("").withOptions({
		shallow: false,
	}),
};

export const serialize = createSerializer(searchParamsParsers);

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

export const useSearchParams = () => useQueryStates(searchParamsParsers);
