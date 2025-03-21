import { useQuery } from "@tanstack/react-query";
import { getUsersMementosApiUserUserIdMementoGetOptions } from "../api-client/generated/@tanstack/react-query.gen";
import { useSession } from "../context/AuthContext";

/**
 * Hook that gets the memento data from cache for a specific memento ID.
 */
export const useMementos = () => {
  const { session } = useSession();

  const { data, refetch } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: String(session?.user.id),
      },
    }),
  });

  const mementos = data || [];

  return { mementos, refetch };
};
