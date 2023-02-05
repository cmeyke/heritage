import { useState } from 'react';
import './App.css'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar.jsx'

function App() {
  const [role, setRole] = useState("None");
  const [alive, setAlive] = useState("");
  const [timeAlive, setTimeAlive] = useState("");

  return (
    <div className="App">
      <Navbar
        role={role}
        setRole={setRole}
        setAlive={setAlive}
        setTimeAlive={setTimeAlive}
      />
      <Dashboard
        role={role}
        alive={alive}
        timeAlive={timeAlive}
      />
    </div>
  )
}

export default App
