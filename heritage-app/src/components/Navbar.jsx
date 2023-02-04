import {
  useDisclosure,
  useColorMode,
  Button,
  Flex,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Input,
} from '@chakra-ui/react'
import {
  MoonIcon,
  SunIcon,
  HamburgerIcon,
} from '@chakra-ui/icons'

import { useState, useRef } from 'react'
import { ethers } from "ethers";

import Heritage from '../artifacts/contracts/Heritage.sol/Heritage.json';

async function connectWallet(setSigner, setAddress) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  setSigner(signer);
  setAddress(address);
}

async function connectContract(signer, contract, setContract, contractAddress, setContractAddress) {
  if (signer !== null && ethers.utils.isAddress(contractAddress)) {
    if (contract !== null) {
      const address = await contract.address;
      if (address.toLowerCase() === contractAddress.toLowerCase()) {
        console.log("contract already connected");
        return;
      }
    }

    const heritage = new ethers.Contract(contractAddress, Heritage.abi, signer);
    setContract(heritage);
  } else {
    setContract(null);
  }
}

function DisplayContractAddress({contract, contractAddress}) {
  const address = displayAddress(contractAddress);
  return <>{contract === null || address === "" ? "Contract" : address}</>;
}

function ContractButton({signer, contract, setContract, contractAddress, setContractAddress}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const addressRef = useRef(null);

  return (
    <>
      <Button marginLeft="14px" onClick={onOpen}>
        <DisplayContractAddress contract={contract} contractAddress={contractAddress} />
      </Button>

      <Modal initialFocusRef={addressRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contract Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Input
                onChange={event => setContractAddress(event.currentTarget.value)}
                ref={addressRef}
                placeholder='Address'
                value={contractAddress}
                onKeyPress={event => {
                  if (event.key === 'Enter') {
                    connectContract(signer, contract, setContract, contractAddress, setContractAddress);
                    onClose();
                  }
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                connectContract(signer, contract, setContract, contractAddress, setContractAddress);
                onClose();
              }}>
                OK
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function displayAddress(address) {
  return ethers.utils.isAddress(address)
  ? `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`
  : '';
}
    
export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState("");

  return (
    <Flex as="nav" alignItems="center" padding="14px" borderBottomWidth="1px" fontSize='xl'>
      <Button>
        <HamburgerIcon />
      </Button>
      <Button marginLeft="14px" onClick={() => {
          if (address === "") {
            connectWallet(setSigner, setAddress);
          } else {
            console.log("already connected:", address);
          }
        }}>
        {address === "" ? "Connect Wallet" : displayAddress(address)}
      </Button>
      <ContractButton
        signer={signer}
        contract={contract}
        setContract={setContract}
        contractAddress={contractAddress}
        setContractAddress={setContractAddress}
      />
      <Spacer />
      <Button onClick={toggleColorMode}>
        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      </Button>
    </Flex>
  )
}
