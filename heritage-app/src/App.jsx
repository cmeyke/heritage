import { useState } from 'react';
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar.jsx'

function getStoredContractAddress() {
  const address = localStorage.getItem("contractAddress");
  if (address === null) {
    return "";
  } else {
    return address;
  }
}

function App() {
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState(getStoredContractAddress());
  const [role, setRole] = useState("None");
  const [alive, setAlive] = useState("");
  const [timeAlive, setTimeAlive] = useState("");
  const [numberOfHeirs, setNumberOfHeirs] = useState("");
  const [numberOfAppointers, setNumberOfAppointers] = useState("");
  const [provider, setProvider] = useState(null);

  return (
    <div className="App">
      <Navbar
        signer={signer}
        provider={provider}
        setProvider={setProvider}
        setSigner={setSigner}
        contract={contract}
        contractAddress={contractAddress}
        setContractAddress={setContractAddress}
        setContract={setContract}
        setRole={setRole}
        setAlive={setAlive}
        setTimeAlive={setTimeAlive}
        setNumberOfHeirs={setNumberOfHeirs}
        setNumberOfAppointers={setNumberOfAppointers}
      />
      <Dashboard
        provider={provider}
        contract={contract}
        contractAddress={contractAddress}
        role={role}
        alive={alive}
        timeAlive={timeAlive}
        numberOfHeirs={numberOfHeirs}
        numberOfAppointers={numberOfAppointers}
        setAlive={setAlive}
        setTimeAlive={setTimeAlive}
      />
    </div>
  )
}

export default App
