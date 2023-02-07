import { useState } from 'react';
import './App.css'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar.jsx'

function App() {
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState("None");
  const [alive, setAlive] = useState("");
  const [timeAlive, setTimeAlive] = useState("");
  const [numberOfHeirs, setNumberOfHeirs] = useState("");
  const [numberOfAppointers, setNumberOfAppointers] = useState("");

  return (
    <div className="App">
      <Navbar
        signer={signer}
        setSigner={setSigner}
        contract={contract}
        setContract={setContract}
        setRole={setRole}
        setAlive={setAlive}
        setTimeAlive={setTimeAlive}
        setNumberOfHeirs={setNumberOfHeirs}
        setNumberOfAppointers={setNumberOfAppointers}
      />
      <Dashboard
        signer={signer}
        contract={contract}
        role={role}
        alive={alive}
        timeAlive={timeAlive}
        numberOfHeirs={numberOfHeirs}
        numberOfAppointers={numberOfAppointers}
      />
    </div>
  )
}

export default App
