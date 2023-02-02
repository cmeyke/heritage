import { useColorMode, Button } from '@chakra-ui/react'
import './App.css'

function App() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <div className="App">
      <header>
        <Button onClick={toggleColorMode}>
          Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
        </Button>
      </header>
    </div>
  )
}

export default App
