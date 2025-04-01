import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getUsersImageLabelsApiUserUserIdMementoImageLabelsGetOptions } from "../api-client/generated/@tanstack/react-query.gen";
import { useSession } from "../context/AuthContext";
import {
  GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetData,
  GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetResponse,
} from "../api-client/generated";

interface UseImageLabelsProps {
  queryOptions?: Omit<
    UseQueryOptions<GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetData>,
    "queryFn" | "queryKey"
  >;
}

/**
 * Hook that gets all the image labels for image associated with users mementos
 */
export const useImageLabels = ({
  queryOptions = {},
}: UseImageLabelsProps = {}) => {
  const { session } = useSession();

  const { data, refetch, isLoading } = useQuery<
    GetUsersImageLabelsApiUserUserIdMementoImageLabelsGetResponse,
    Error
  >({
    ...getUsersImageLabelsApiUserUserIdMementoImageLabelsGetOptions({
      path: {
        user_id: String(session?.user.id),
      },
    }),
    ...(queryOptions as any),
  });

  return {
    image_labels: data || [],
    refetch,
    isLoading,
  };
};
