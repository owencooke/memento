import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getUsersMementosApiUserUserIdMementoGetOptions } from "../api-client/generated/@tanstack/react-query.gen";
import { useSession } from "../context/AuthContext";
import {
  GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetData,
  GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetResponse,
} from "../api-client/generated";

const tenMinutesInMs = 10 * 60 * 1000;

interface UseImageLabelsProps {
  queryOptions?: Omit<
    UseQueryOptions<GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetData>,
    "queryFn" | "queryKey"
  >;
}

/**
 * Hook that gets all the Mementos for a user (from API or query cache),
 * with support for filtering and search.
 */
export const useMementos = ({
  queryOptions = {},
}: UseImageLabelsProps = {}) => {
  const { session } = useSession();

  const { data, refetch, isLoading } = useQuery<
    GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetResponse,
    Error
  >({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: String(session?.user.id),
      },
    }),
    // Keep previous results in cache for certain time period
    staleTime: tenMinutesInMs,
    gcTime: tenMinutesInMs,
    ...(queryOptions as any),
  });

  return {
    image_labels: data || [],
    refetch,
    isLoading,
  };
};
