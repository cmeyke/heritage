import {
  Button,
  Heading,
  Grid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Input,
  ModalFooter,
} from "@chakra-ui/react";

import { updateAliveData } from "./Navbar";
import { useRef, useState } from "react";

async function callAlive(newTimeAlive, timeAlive, contract, provider, setAlive, setTimeAlive) {
  let time = 0;
  if (newTimeAlive != timeAlive) {
    time = newTimeAlive * 60 * 60 * 24;
  }
  const tx = await contract.alive(time);
  await tx.wait();
  updateAliveData(contract, provider, setAlive, setTimeAlive);
}

function AliveButton({alive, timeAlive, contract, provider, setAlive, setTimeAlive}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef(null);
  const [newTimeAlive, setNewTimeAlive] = useState(timeAlive);

  return <>
    <Button
      onClick={() => {
        setNewTimeAlive(timeAlive);
        onOpen();
      }}
      fontSize='xl'
    >
      {alive} {alive == 1 ? "Day" : "Days"}
    </Button>

    <Modal initialFocusRef={inputRef} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Alive Interval</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            onChange={event => {
              setNewTimeAlive(event.currentTarget.value);
            }}
            ref={inputRef}
            placeholder='Address'
            value={newTimeAlive}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                callAlive(newTimeAlive, timeAlive, contract, provider, setAlive, setTimeAlive);
                onClose();
              }
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            mr={3}
            onClick={() => {
              callAlive(newTimeAlive, timeAlive, contract, provider, setAlive, setTimeAlive);
              onClose();
            }}
          >
            OK
          </Button>
          <Button onClick={() => {
              onClose();
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>;
}

export default function Dashboard({provider, contract, role, alive, timeAlive, numberOfHeirs, numberOfAppointers, setAlive, setTimeAlive}) {
  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      padding="14px"
      spacing={10}
    >
      <GridItem colSpan="1" fontSize='xl' textAlign="left">
          <Heading marginLeft="28px">
            Contract Properties
          </Heading>
          <TableContainer padding="14px">
            <Table>
              <Tbody>
                <Tr>
                  <Td>Role</Td>
                  <Td>{role}</Td>
                </Tr>
                <Tr>
                  <Td>Alive left</Td>
                  <Td>
                    <AliveButton
                      alive={alive}
                      timeAlive={timeAlive}
                      contract={contract}
                      provider={provider}
                      setAlive={setAlive}
                      setTimeAlive={setTimeAlive}
                    />
                  </Td>
                </Tr>
                <Tr>
                  <Td>Alive Interval</Td>
                  <Td>{timeAlive} {timeAlive == 1 ? "Day" : "Days"}</Td>
                </Tr>
                <Tr>
                  <Td># Heirs</Td>
                  <Td>{numberOfHeirs}</Td>
                </Tr>
                <Tr>
                  <Td># Appointers</Td>
                  <Td>{numberOfAppointers}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
      </GridItem>
      <GridItem colSpan="2"  fontSize='xl' textAlign="left">
        <Heading>
          Send Ether
        </Heading>
      </GridItem>
    </Grid>
  )
}
