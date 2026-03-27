import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Registrachia from './registration/Registrachia'
import Boards from './Loading/Brain'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './registration/Login';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Registrachia />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)