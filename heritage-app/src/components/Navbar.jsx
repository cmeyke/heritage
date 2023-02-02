import { useColorMode, Button, Flex, Spacer, Text, Center } from '@chakra-ui/react'
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons'

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex as="nav" alignItems="center" padding="14px" borderBottomWidth="1px">
      <Button>
        <HamburgerIcon />
      </Button>
      <Spacer />
      <Text fontSize='xl'>
        Heritage
      </Text>
      <Spacer />
      <Button onClick={toggleColorMode}>
        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
      </Button>
    </Flex>
  )
}
