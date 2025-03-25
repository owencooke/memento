import { useQuery } from "@tanstack/react-query";
import { getUsersMementosApiUserUserIdMementoGetOptions } from "../api-client/generated/@tanstack/react-query.gen";
import { useSession } from "../context/AuthContext";
import { useState } from "react";
import { useDebounce } from "./useDebounce";
import { BoundingBox } from "@/src/components/inputs/LocationInput";

interface MementoFilters {
  start_date: string | null;
  end_date: string | null;
  bbox: BoundingBox | null;
}

const tenMinutesInMs = 10 * 60 * 1000;

/**
 * Hook that gets all the Mementos for a user (from API or query cache),
 * with support for filtering and search.
 */
export const useMementos = () => {
  const { session } = useSession();

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<MementoFilters>({
    start_date: null,
    end_date: null,
    bbox: null,
  });

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

  const { data, refetch, isLoading } = useQuery({
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
  });

  return {
    mementos: data || [],
    refetch,
    isLoading,
    filters,
    setFilters,
    searchText,
    setSearchText,
  };
};
