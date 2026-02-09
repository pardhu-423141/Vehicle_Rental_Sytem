import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import type { JSX } from 'react';

// Import Components
// Ensure these files are also renamed to .tsx if you are migrating fully
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';

export default function App(): JSX.Element {
  return (
    <Router>
      <Toaster position="top-center" />
      
      {/* Navbar appears on all pages */}
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}