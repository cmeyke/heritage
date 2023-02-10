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
  const [heirs, setHeirs] = useState([]);
  const [appointers, setAppointers] = useState([]);
  const [reload, setReload] = useState(false);


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
        setHeirs={setHeirs}
        setAppointers={setAppointers}
        reload={reload}
        setReload={setReload}
      />
      <Dashboard
        provider={provider}
        contract={contract}
        contractAddress={contractAddress}
        role={role}
        alive={alive}
        timeAlive={timeAlive}
        numberOfHeirs={numberOfHeirs}
        setNumberOfHeirs={setNumberOfHeirs}
        numberOfAppointers={numberOfAppointers}
        setNumberOfAppointers={setNumberOfAppointers}
        setAlive={setAlive}
        setTimeAlive={setTimeAlive}
        heirs={heirs}
        setHeirs={setHeirs}
        appointers={appointers}
        setAppointers={setAppointers}
        reload={reload}
        setReload={setReload}
      />
    </div>
  )
}

export default App
