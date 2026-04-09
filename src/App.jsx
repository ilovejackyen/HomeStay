import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Booking from './pages/Booking';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Suspense fallback={<div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
