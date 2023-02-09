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
  Alert,
  AlertIcon,
  List,
  ListItem,
  Box,
} from "@chakra-ui/react";

import { updateAliveData } from "./Navbar";
import { useRef, useState } from "react";

import { ethers } from "ethers";

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

    <Modal initialFocusRef={inputRef} isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Renew Alive</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Alive Interval Days:
          <Input
            type="number"
            onChange={event => {
              setNewTimeAlive(event.currentTarget.value);
            }}
            ref={inputRef}
            placeholder='Alive Interval Days'
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

export function AddressAlert({validAddress, marginTop, marginLeft}) {
  if (validAddress) {
    return <></>;
  }
  return <>
    <Alert marginTop={marginTop}  marginLeft={marginLeft} status='error'>
    <AlertIcon />
      Not a valid ethereum address!
    </Alert>
  </>
}

function BalanceAlert({sufficientBalance}) {
  if (sufficientBalance) {
    return <></>;
  }
  return <>
    <Alert marginTop="14px"  marginLeft="14px" status='error'>
    <AlertIcon />
      Insufficient balance!
    </Alert>
  </>
}

function SendEther({contract, provider, contractAddress}) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [validAddress, setValidAddress] = useState(true);
  const [sufficientBalance, setSufficientBalance] = useState(true);

  return <>
    <Heading marginLeft="14px">
      Send Ether
    </Heading>
    <AddressAlert
      validAddress={validAddress}
      marginTop="14px"
      marginLeft="14px"
    />
    <BalanceAlert
      sufficientBalance={sufficientBalance}
    />
    <TableContainer>
      <Table>
        <Tbody>
          <Tr>
            <Td w="1px">Recipient:</Td>
            <Td>
              <Input
                onChange={event => {
                  setRecipientAddress(event.currentTarget.value);
                }}
                placeholder="Recipient's Address"
              />
            </Td>
          </Tr>
          <Tr>
            <Td w="1px">Amount:</Td>
            <Td>
              <Input
                onChange={event => {
                  setSendAmount(event.currentTarget.value);
                }}
                placeholder="Amount"
                type="number"
                value={sendAmount}
              />
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Button
                fontSize='xl'
                onClick={() => {
                  async function transfer() {
                    const value = ethers.utils.parseEther(sendAmount);
                    const balance = await provider.getBalance(contractAddress);
                    if (balance >= value) {
                      setSufficientBalance(true);
                      const tx = await contract.executeTransaction(recipientAddress, value, "0x");
                      await tx.wait();
                    } else {
                      setSufficientBalance(false);
                    }
                  }
                  if (ethers.utils.isAddress(recipientAddress)) {
                    setValidAddress(true);
                    transfer();
                  } else {
                    setValidAddress(false);
                  }
                }}
              >
                Send
              </Button>
            </Td>
            <Td>
              <Button
                fontSize='xl'
                onClick={() => {
                  async function max() {
                    const balance = await provider.getBalance(contractAddress);
                    const amount = ethers.utils.formatUnits(balance);
                    setSendAmount(amount);
                  }
                  max();
                }}
              >
                Max
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  </>;
}

function RoleManagement() {
  return <>
    <Heading marginLeft="14px" marginTop="14px">
      Role Management
    </Heading>
  </>;
}

function ListArray({array, heading}) {
  if (array.length > 0) {
    return <Box marginLeft="28px" fontSize='lg'>
      <Heading size="lg" marginBottom="8px">
        {heading}
      </Heading>
      <List>
        {array.map(elem => <ListItem marginBottom="4px" key={elem}>{elem}</ListItem>)}
      </List>
    </Box>;
  }
  return <></>;
}

export default function Dashboard({provider, contract, contractAddress, role, alive, timeAlive, numberOfHeirs, numberOfAppointers, setAlive, setTimeAlive, heirs, appointers}) {
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
                  <Td>
                    {numberOfHeirs}
                  </Td>
                </Tr>
                <Tr>
                  <Td># Appointers</Td>
                  <Td>
                    {numberOfAppointers}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
          <ListArray
            array={heirs}
            heading="Heirs:"
          />
          <ListArray
            array={appointers}
            heading="Appointers:"
          />
      </GridItem>
      <GridItem colSpan="2"  fontSize='xl' textAlign="left">
        <SendEther
          contract={contract}
          provider={provider}
          contractAddress={contractAddress}
        />
        <RoleManagement />
      </GridItem>
    </Grid>
  )
}
