import React from "react";
import { ButtonText, Button } from "../ui/button";
import { Heading } from "../ui/heading";
import {
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Modal,
} from "../ui/modal";
import { Image } from "../ui/image";
import { Photo } from "@/src/hooks/usePhotos";

interface BackgroundRemovalModalProps {
  photo: Photo;
  accept: () => void;
  reject: () => void;
}

export default function BackgroundRemovalModal({
  photo,
  accept,
  reject,
}: BackgroundRemovalModalProps) {
  return (
    // Modal will be unrendered after accept/reject
    <Modal isOpen={true} testID="modal-background-removal">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Use removed background?</Heading>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <Image
            source={{ uri: photo.uri }}
            className="h-full w-auto aspect-square"
            alt=""
            resizeMode="contain"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            action="secondary"
            onPress={reject}
            className="mr-2"
            testID="modal-background-removal-decline"
          >
            <ButtonText>Keep Original</ButtonText>
          </Button>
          <Button
            action="primary"
            onPress={accept}
            testID="modal-background-removal-confirm"
          >
            <ButtonText>Confirm</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
