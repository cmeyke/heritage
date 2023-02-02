import { useColorMode, Button, Flex, Spacer } from '@chakra-ui/react'
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { ethers } from "ethers";

async function connectWallet(setSigner, setAddress) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  setSigner(signer);
  setAddress(address);
}

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const displayAddress = ethers.utils.isAddress(address)
  ? `${address.slice(0, 6)}...${address.slice(
      address.length - 4,
      address.length
    )}`
  : '';
    
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
        {(address === "") ? "Connect Wallet" : displayAddress}
      </Button>
      <Spacer />
      <Button onClick={toggleColorMode}>
        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      </Button>
    </Flex>
  )
}
