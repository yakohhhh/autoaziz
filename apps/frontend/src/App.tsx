import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer, ProtectedRoute } from './components';
import {
  Home,
  Services,
  Pricing,
  Appointments,
  Contact,
  Login,
  AdminDashboard,
  AdminPlanning,
} from './pages';
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
          <Route
            path='/admin/planning'
            element={
              <ProtectedRoute>
                <AdminPlanning />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
