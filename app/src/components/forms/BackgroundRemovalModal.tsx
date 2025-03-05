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
}

export default function BackgroundRemovalModal({
  photo,
}: BackgroundRemovalModalProps) {
  return (
    <Modal isOpen={true} onClose={() => {}}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Use removed background?</Heading>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <Image
            source={{ uri: photo.uri }}
            className="w-full h-48 rounded-md"
            alt="Processed"
            resizeMode="contain"
          />
        </ModalBody>
        <ModalFooter>
          <Button
            action="secondary"
            // onPress={closeProcessingModal}
            className="mr-2"
          >
            <ButtonText>Keep Original</ButtonText>
          </Button>
          <Button
            action="primary"
            // onPress={acceptProcessedPhoto}
            // disabled={!processedPhoto}
          >
            <ButtonText>Confirm</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
