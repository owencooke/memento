import React, { useState } from "react";
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
import { FormControl } from "../ui/form-control";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "../ui/checkbox";
import { VStack } from "../ui/vstack";
import { CheckIcon } from "../ui/icon";

interface AutofillFieldsModalProps {
  location: string;
  date: Date;
  accept: (selected: { location: boolean; date: boolean }) => void;
  reject: () => void;
}

export default function AutofillFieldsModal({
  location,
  date,
  accept,
  reject,
}: AutofillFieldsModalProps) {
  const [useLocation, setUseLocation] = useState(true);
  const [useDate, setUseDate] = useState(true);

  return (
    <Modal isOpen={true}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Use derived metadata?</Heading>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <FormControl>
            <VStack space="sm">
              <Checkbox isChecked={useLocation} onChange={setUseLocation}>
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel className="flex-1">
                  Use location: {location}
                </CheckboxLabel>
              </Checkbox>
              <Checkbox isChecked={useDate} onChange={setUseDate}>
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel className="flex-1">
                  Use date: {date.toISOString()}
                </CheckboxLabel>
              </Checkbox>
            </VStack>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button action="secondary" onPress={reject} className="mr-2">
            <ButtonText>Decline</ButtonText>
          </Button>
          <Button
            action="primary"
            onPress={() => accept({ location: useLocation, date: useDate })}
          >
            <ButtonText>Confirm</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
