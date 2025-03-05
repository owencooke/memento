/**
 * @description Screen for viewing an collection
 * @requirements FR-3
 */
import {
  deleteCollectionApiUserUserIdCollectionIdDeleteMutation,
  getUsersCollectionsApiUserUserIdCollectionGetOptions,
  getUsersCollectionsApiUserUserIdCollectionGetQueryKey,
  getUsersMementosApiUserUserIdMementoGetOptions,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { ButtonIcon, Button } from "@/src/components/ui/button";
import {
  EditIcon,
  ShareIcon,
  TrashIcon,
  InfoIcon,
} from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useSession } from "@/src/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Box } from "@/src/components/ui/box";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/src/components/ui/heading";
import { FlatList, Pressable } from "react-native";
import MementoCard from "@/src/components/cards/MementoCard";
import DeleteCollectionModal from "@/src/components/modals/DeleteModal";
import { queryClient } from "@/src/app/_layout";

const buttonClasses = "flex-1";
const iconClasses = "w-6 h-6";

export default function ViewCollection() {
  const { session } = useSession();
  const user_id = String(session?.user.id);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: collections } = useQuery({
    ...getUsersCollectionsApiUserUserIdCollectionGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    refetchOnMount: false,
  });
  const collection = collections?.find((c) => c.id === Number(id));

  const { data: all_mementos } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    refetchOnMount: false,
  });
  const mementos = all_mementos?.filter((m) =>
    collection?.mementos.some((cm) => cm.memento_id === m.id),
  );
  const gridData = useMemo(
    () =>
      mementos?.length && mementos.length % 2
        ? [...mementos, { spacer: true }]
        : mementos,
    [mementos],
  );
  const deleteMutation = useMutation(
    deleteCollectionApiUserUserIdCollectionIdDeleteMutation(),
  );

  // TODO: Show more details
  const handleShowMoreDetails = () => console.debug("Not implemented yet");

  const handleEditCollection = () => {
    router.push(`/(app)/(screens)/(collection)/edit/${collection?.id}`);
  };

  const handleViewMemento = (id: number) => {
    router.push(`/(app)/(screens)/(memento)/${id}`);
  };

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const handleDeletePress = () => {
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    console.log("Deleting collection..."); // TODO: API call to delete
    onDelete(Number(id)); // FIXME: collection?.id is number | undefined
  };

  const onDelete = async (id: number) => {
    const path = { user_id, id };

    await deleteMutation.mutateAsync(
      { path },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getUsersCollectionsApiUserUserIdCollectionGetQueryKey({
              path: { user_id },
            }),
          });
          setDeleteModalVisible(false);
          router.dismissTo("/(app)/(tabs)/collections");
        },
        onError: (error: any) =>
          console.error("Failed to delete collection", error),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-500" edges={["bottom"]}>
      <Box className="flex-1 bg-background-100 p-6 flex gap-6">
        {collection && (
          <>
            {/* Details Card */}
            {(collection.title || collection.caption) && (
              <>
                <Heading className="p-4">
                  <Text size="3xl" bold className="mb-2">
                    {collection.title}
                  </Text>
                  <Box className="flex mt-auto font-medium">
                    <Text
                      size="xl"
                      italic
                      className="text-left font-light mb-2"
                    >
                      {collection.caption}
                    </Text>
                  </Box>
                </Heading>
                <FlatList
                  numColumns={2}
                  columnWrapperStyle={{ gap: 12 }}
                  contentContainerStyle={{ gap: 12 }}
                  showsVerticalScrollIndicator={false}
                  // TODO: Fetch and Display Mementos
                  data={gridData}
                  keyExtractor={(item, index) =>
                    "spacer" in item ? `spacer-${index}` : String(item.id)
                  }
                  renderItem={({ item }) =>
                    "spacer" in item ? (
                      <Box className="flex-1" />
                    ) : (
                      <Pressable
                        className="flex-1"
                        onPress={() => handleViewMemento(item.id)}
                      >
                        <MementoCard {...item} />
                      </Pressable>
                    )
                  }
                />
              </>
            )}
          </>
        )}
      </Box>
      {/* Options bar (info, edit, delete, share) */}
      <Box className="flex flex-row justify-between items-center bg-primary-500">
        {/* TODO: open Share options */}
        <Button size="xl" className={buttonClasses}>
          <ButtonIcon as={ShareIcon} className={iconClasses} />
        </Button>
        <Button
          size="xl"
          className={buttonClasses}
          onPress={handleShowMoreDetails}
        >
          <ButtonIcon as={InfoIcon} className={`${iconClasses}`} />
        </Button>
        <Button
          size="xl"
          className={buttonClasses}
          onPress={handleEditCollection}
        >
          <ButtonIcon as={EditIcon} className={iconClasses} />
        </Button>
        {/* TODO: open Delete confirmation modal */}
        <Button size="xl" className={buttonClasses} onPress={handleDeletePress}>
          <ButtonIcon as={TrashIcon} className={iconClasses} />
        </Button>
      </Box>

      {/* Delete Collection Modal */}
      <DeleteCollectionModal
        visible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}
