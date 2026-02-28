import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Registrachia from './registration/Registrachia'
import Boards from './Boards/Boards'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Registrachia />} />
        <Route path="/boards" element={<Boards />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)