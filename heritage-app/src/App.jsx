import { useState } from 'react';
import './App.css'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar.jsx'

function App() {
  const [role, setRole] = useState("None");
  const [alive, setAlive] = useState("");
  const [timeAlive, setTimeAlive] = useState("");
  const [numberOfHeirs, setNumberOfHeirs] = useState("");
  const [numberOfAppointers, setNumberOfAppointers] = useState("");

  return (
    <div className="App">
      <Navbar
        role={role}
        setRole={setRole}
        setAlive={setAlive}
        setTimeAlive={setTimeAlive}
        setNumberOfHeirs={setNumberOfHeirs}
        setNumberOfAppointers={setNumberOfAppointers}
      />
      <Dashboard
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
