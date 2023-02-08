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
  Input,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import {
  MoonIcon,
  SunIcon,
  RepeatIcon,
} from '@chakra-ui/icons'

import { useState, useRef, useEffect } from 'react'
import { ethers } from "ethers";

import Heritage from '../artifacts/contracts/Heritage.sol/Heritage.json';
import { AddressAlert } from './Dashboard';

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

export async function updateAliveData(contract, provider, setAlive, setTimeAlive) {
  const timeAlive = (await contract.timeAlive()).toNumber();
  const startTime = (await contract.startTime()).toNumber();
  const blockNumber = await provider.getBlockNumber()
  const timestamp = (await provider.getBlock(blockNumber)).timestamp;
  const alive = Math.round((startTime + timeAlive - timestamp) / (60*60*24));
  setAlive(alive);
  setTimeAlive(Math.round(timeAlive/(60*60*24)));
}

async function updateContractData(contract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers) {
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
    updateAliveData(contract, provider, setAlive, setTimeAlive);
    const numberOfHeirs = await contract.getRoleMemberCount(HEIR_ROLE);
    setNumberOfHeirs(numberOfHeirs.toNumber());
    const numberOfAppointers = await contract.getRoleMemberCount(APPOINTER_ROLE);
    setNumberOfAppointers(numberOfAppointers.toNumber());
  }
}

async function connectContract(signer, contract, setContract, newAddress, setContractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers) {
  if (signer !== null && ethers.utils.isAddress(newAddress)) {
    const heritage = new ethers.Contract(newAddress, Heritage.abi, signer);
    setContract(heritage);
    setContractAddress(newAddress);
    updateContractData(heritage, newAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers);
    localStorage.setItem("contractAddress", newAddress);
    return true;
  }
  return false;
}

function DisplayContractAddress({contract, contractAddress}) {
  const address = formatAddress(contractAddress);
  return <>{contract === null || address === "" ? "Connect" : address}</>;
}

function ShowBusy({busy}) {
  if (busy) {
    return <Spinner />;
  }
  return <></>;
}

function DeploySuccess({contractAddress}) {
  if (contractAddress !== "") {
    return <>
      <Alert marginTop={3} status='success'>
        <AlertIcon />
          New contract address: {contractAddress}
      </Alert>
    </>;
  }
  return <></>;
}

function DeployButton({signer}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef(null);
  const [amount, setAmount] = useState("0");
  const [busy, setBusy] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [heirAddress, setHeirAddress] = useState("");
  const [alive, setAlive] = useState("365");

  return <>
    <Button
      colorScheme='red'
      onClick={onOpen}
    >
      Deploy New
    </Button>

    <Modal
      initialFocusRef={inputRef}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deploy New Heritage Contract</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Initial Ether Amount:
            </Text>
            <Input
              type='number'
              onChange={event => {
                setAmount(event.currentTarget.value);
              }}
              ref={inputRef}
              placeholder='Amount'
              value={amount}
            />
            <Text marginTop={3}>
              Alive Interval:
            </Text>
            <Input
              type='number'
              onChange={event => {
                setAlive(event.currentTarget.value);
              }}
              placeholder='Alive Interval'
              value={alive}
            />
            <Text marginTop={3}>
              Heir Address:
            </Text>
            <Input
              onChange={event => {
                setHeirAddress(event.currentTarget.value);
              }}
              placeholder='Heir Address'
              value={heirAddress}
            />
            <DeploySuccess
              contractAddress={contractAddress}
            />
          </ModalBody>
          <ModalFooter>
            <ShowBusy
              busy={busy}
            />
            <Button
              ml={3}
              mr={3}
              colorScheme='red'
              onClick={() => {
                async function deploy() {
                  setBusy(true);
                  setContractAddress("");
                  const value = ethers.utils.parseEther(amount);
                  const Contract = new ethers.ContractFactory(Heritage.abi, Heritage.bytecode, signer);
                  const contract = await Contract.deploy(heirAddress, alive*60*60*24, { value: value });                                
                  setContractAddress(contract.address);
                  setBusy(false);
                }
                if (!busy) {
                  deploy();
                }  
              }}>
                Deploy
            </Button>
            <Button
              onClick={() => {
                if (!busy) {
                  onClose();
                }
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  </>;
}

function ContractButton({signer, contract, setContract, contractAddress, setContractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const addressRef = useRef(null);
  const [newAddress, setNewAddress] = useState(contractAddress);
  const [validAddress, setValidAddress] = useState(true);

  return (
    <>
      <Button marginLeft="14px" onClick={onOpen}>
        <DisplayContractAddress contract={contract} contractAddress={contractAddress} />
      </Button>

      <Modal initialFocusRef={addressRef} isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contract Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              onChange={event => {
                setNewAddress(event.currentTarget.value);
              }}
              ref={addressRef}
              placeholder='Address'
              value={newAddress}
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  if (ethers.utils.isAddress(newAddress)) {
                    setValidAddress(true);
                    onClose();
                    connectContract(signer, contract, setContract, newAddress, setContractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers);  
                  } else {
                    setValidAddress(false);
                  }
                }
              }}
            />
            <AddressAlert
              validAddress={validAddress}
              marginTop="14px"
              marginLeft="0px"        
            /> 
          </ModalBody>
          <ModalFooter>
            <DeployButton
              signer={signer}
            />
            <Spacer />
            <Button
              ml={3}
              mr={3}
              onClick={() => {
                if (ethers.utils.isAddress(newAddress)) {
                  setValidAddress(true);
                  onClose();
                  connectContract(signer, contract, setContract, newAddress, setContractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers);
                } else {
                  setValidAddress(false);
                }
              }}>
                OK
            </Button>
            <Button
              onClick={() => {
                setNewAddress(contractAddress);
                onClose();
              }}
            >
              Cancel
            </Button>
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
    
export default function Navbar({signer, provider, setProvider, setSigner, contract, contractAddress, setContractAddress, setContract, setRole, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers}) {
  const { colorMode, toggleColorMode } = useColorMode();
  const [address, setAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    connectWallet(setSigner, setAddress, setWalletBalance, setProvider, setProvider);
  }, []);

  useEffect(() => {
    connectContract(signer, contract, setContract, contractAddress, setContractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers);
  }, [signer]);

  return (
    <>
      <Flex as="nav" alignItems="center" padding="14px" borderBottomWidth="1px" fontSize='xl'>
        <Button onClick={async () => {
          updateContractData(contract, contractAddress, setContractBalance, provider, setRole, address, setAlive, setTimeAlive, setNumberOfHeirs, setNumberOfAppointers);
          const balance = await getEthBalance(signer, null);
          setWalletBalance(balance);
        }}>
          <RepeatIcon />
        </Button>
        <Text marginLeft="14px">
          Wallet:
        </Text>
        <Button marginLeft="14px" onClick={async () => {
            const connected = await connectWallet(setSigner, setAddress, setWalletBalance, setProvider, setProvider);
            if (!connected) {
              onOpen();
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
          setNumberOfHeirs={setNumberOfHeirs}
          setNumberOfAppointers={setNumberOfAppointers}
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
