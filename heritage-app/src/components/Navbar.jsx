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
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import {
  MoonIcon,
  SunIcon,
  RepeatIcon,
} from '@chakra-ui/icons'

import { useState, useRef, useEffect } from 'react'
import { ethers } from "ethers";

import Heritage from '../artifacts/contracts/Heritage.sol/Heritage.json';

async function connectWallet(setSigner, setAddress, setWalletBalance, setProvider) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const network = await provider.getNetwork();
  if (network.name !== "goerli") {
    return false;
  }
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const balance = await getEthBalance(signer, null);
  setWalletBalance(balance);
  setSigner(signer);
  setProvider(provider);
  setAddress(address);
  return true;
}

async function updateContractData(contract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive) {
  if (contract !== null) {
    const balance = await getEthBalance(null, provider, contractAddress);
    setContractBalance(balance);
    const APPOINTER_ROLE = await contract.APPOINTER_ROLE();
    const HEIR_ROLE = await contract.HEIR_ROLE();
    if (await contract.hasRole(APPOINTER_ROLE, address)) {
      setRole("Appointer");
    } else if (await contract.hasRole(HEIR_ROLE, address)) {
      setRole("Heir");
    }
    const timeAlive = (await contract.timeAlive()).toNumber();
    const startTime = (await contract.startTime()).toNumber();
    const blockNumber = await provider.getBlockNumber()
    const timestamp = (await provider.getBlock(blockNumber)).timestamp;
    const alive = Math.round((startTime + timeAlive - timestamp) / (60*60*24));
    setAlive(alive);
    setTimeAlive(Math.round(timeAlive/(60*60*24)));
  }
}

async function connectContract(signer, contract, setContract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive) {
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
    updateContractData(heritage, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive);
    localStorage.setItem("contractAddress", contractAddress);
  } else {
    setContract(null);
  }
}

function DisplayContractAddress({contract, contractAddress}) {
  const address = formatAddress(contractAddress);
  return <>{contract === null || address === "" ? "Connect" : address}</>;
}

function ContractButton({signer, contract, setContract, contractAddress, setContractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive}) {
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
                    onClose();
                    connectContract(signer, contract, setContract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive);
                  }
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              onClick={() => {
                onClose();
                connectContract(signer, contract, setContract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive);
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

function formatAddress(address) {
  return ethers.utils.isAddress(address)
  ? `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`
  : '';
}

async function getEthBalance(signer, provider, address) {
  const formaterETH = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 5,
  }).format
  
  let balance = "";
  if (provider === null) {
    balance = ethers.utils.formatUnits(await signer.getBalance());
  } else {
    balance = ethers.utils.formatUnits(await provider.getBalance(address));
  }
  return formaterETH(balance);
}

function getStoredContractAddress() {
  const address = localStorage.getItem("contractAddress");
  if (address === null) {
    return "";
  } else {
    return address;
  }
}
    
export default function Navbar({role, setRole, setAlive, setTimeAlive}) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(getStoredContractAddress());
  const [walletBalance, setWalletBalance] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    connectWallet(setSigner, setAddress, setWalletBalance, setProvider, setProvider);
  }, []);

  useEffect(() => {
    connectContract(signer, contract, setContract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive);
  }, [signer]);

  return (
    <>
      <Flex as="nav" alignItems="center" padding="14px" borderBottomWidth="1px" fontSize='xl'>
        <Button onClick={async () => {
          updateContractData(contract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive);
          const balance = await getEthBalance(signer, null);
          setWalletBalance(balance);
        }}>
          <RepeatIcon />
        </Button>
        <Text marginLeft="14px">
          Wallet:
        </Text>
        <Button marginLeft="14px" onClick={async () => {
            if (address === "") {
              const connected = await connectWallet(setSigner, setAddress, setWalletBalance, setProvider, setProvider);
              if (!connected) {
                onOpen();
              }
            } else {
              console.log("already connected:", address);
            }
          }}>
          {address === "" ? "Connect" : formatAddress(address)}
        </Button>
        <Text marginLeft="14px">
        {walletBalance ? "Ξ" : ""} {walletBalance}
        </Text>
        <Text marginLeft="28px">
          Contract:
        </Text>
        <ContractButton
          signer={signer}
          contract={contract}
          setContract={setContract}
          contractAddress={contractAddress}
          setContractAddress={setContractAddress}
          setContractBalance={setContractBalance}
          provider={provider}
          setRole={setRole}
          address={address}
          setAlive={setAlive}
          setTimeAlive={setTimeAlive}
        />
        <Text marginLeft="14px">
          {contractBalance ? "Ξ" : ""} {contractBalance}
        </Text>
        <Spacer />
        <Button onClick={toggleColorMode}>
          {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              Connect Wallet
            </AlertDialogHeader>
            <AlertDialogBody>
              Heritage is alpha software and can only be used on the goerli network! Please change your wallet to goerli!
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
