import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getUsersMementosApiUserUserIdMementoGetOptions } from "../api-client/generated/@tanstack/react-query.gen";
import { useSession } from "../context/AuthContext";
import { useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";
import { BoundingBox } from "@/src/components/inputs/LocationInput";
import {
  GetUsersMementosApiUserUserIdMementoGetData,
  GetUsersMementosApiUserUserIdMementoGetResponse,
} from "../api-client/generated";

interface MementoFilters {
  start_date: string | null;
  end_date: string | null;
  bbox: BoundingBox | null;
}

const tenMinutesInMs = 10 * 60 * 1000;

interface UseMementosProps {
  initialFilters?: MementoFilters;
  queryOptions?: Omit<
    UseQueryOptions<GetUsersMementosApiUserUserIdMementoGetData>,
    "queryFn" | "queryKey"
  >;
}

/**
 * Hook that gets all the Mementos for a user (from API or query cache),
 * with support for filtering and search.
 */
export const useMementos = ({
  initialFilters = { start_date: null, end_date: null, bbox: null },
  queryOptions = {},
}: UseMementosProps = {}) => {
  const { session } = useSession();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<MementoFilters>(initialFilters);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters],
  );

  const debouncedQueryParams = useDebounce(
    {
      start_date: filters.start_date ?? undefined,
      end_date: filters.end_date ?? undefined,
      min_lat: filters.bbox?.southwest.lat ?? undefined,
      min_long: filters.bbox?.southwest.lng ?? undefined,
      max_lat: filters.bbox?.northeast.lat ?? undefined,
      max_long: filters.bbox?.northeast.lng ?? undefined,
      text: searchText?.trim() || undefined,
    },
    600,
  );

  const { data, refetch, isLoading } = useQuery<
    GetUsersMementosApiUserUserIdMementoGetResponse,
    Error
  >({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: String(session?.user.id),
      },
      query: debouncedQueryParams,
    }),
    // Keep previous results in cache for certain time period
    staleTime: tenMinutesInMs,
    gcTime: tenMinutesInMs,
    // Keep showing previous data while loading new result
    placeholderData: (previousData) => previousData,
    ...(queryOptions as any),
  });

  return {
    mementos: data || [],
    refetch,
    isLoading,
    activeFilterCount,
    setFilters,
    searchText,
    setSearchText,
  };
};
