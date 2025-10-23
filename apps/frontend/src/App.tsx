import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Appointments from './pages/Appointments';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          {/* Routes publiques avec navigation */}
          <Route
            path='/'
            element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path='/services'
            element={
              <>
                <Navbar />
                <Services />
                <Footer />
              </>
            }
          />
          <Route
            path='/tarifs'
            element={
              <>
                <Navbar />
                <Pricing />
                <Footer />
              </>
            }
          />
          <Route
            path='/rendez-vous'
            element={
              <>
                <Navbar />
                <Appointments />
                <Footer />
              </>
            }
          />
          <Route
            path='/contact'
            element={
              <>
                <Navbar />
                <Contact />
                <Footer />
              </>
            }
          />

          {/* Route de connexion (sans navigation) */}
          <Route path='/login' element={<Login />} />

          {/* Routes admin protégées (sans navigation) */}
          <Route
            path='/admin/dashboard'
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
