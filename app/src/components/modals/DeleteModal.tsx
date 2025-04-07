import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/src/components/ui/modal";
import { Text } from "@/src/components/ui/text";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Icon, TrashIcon } from "@/src/components/ui/icon";
import { Box } from "@/src/components/ui/box";
import { Heading } from "../ui/heading";

type DeleteModalProps = {
  visible: boolean;
  type: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteModal({
  visible,
  type,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!visible) return null;

  return (
    <Modal isOpen={visible} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent className="max-w-[305px] items-center">
        <ModalHeader>
          <Box className="w-[56px] h-[56px] rounded-full bg-background-error items-center justify-center">
            <Icon as={TrashIcon} className="stroke-error-600" size="xl" />
          </Box>
        </ModalHeader>
        <ModalBody className="mt-0 mb-4">
          <Heading size="md" className="text-typography-950 mb-2 text-center">
            Delete {type[0].toUpperCase() + type.slice(1)}
          </Heading>
          <Text size="sm" className="text-typography-500 text-center">
            Are you sure you want to delete this {type}? This action cannot be
            undone.
          </Text>
        </ModalBody>
        <ModalFooter className="w-full">
          <Button
            action="secondary"
            onPress={onClose}
            size="sm"
            variant="outline"
            className="flex-grow"
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button
            testID="delete-modal-confirm"
            onPress={onConfirm}
            size="sm"
            className="flex-grow"
          >
            <ButtonText>Delete</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
