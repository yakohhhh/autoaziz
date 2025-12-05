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
  AdminCustomers,
} from './pages';
import AdminPlanningWeek from './pages/admin/AdminPlanningWeek';
import AdminPlanningMobile from './pages/admin/AdminPlanningMobile';
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
                <AdminPlanningWeek />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/planning-mobile'
            element={
              <ProtectedRoute>
                <AdminPlanningMobile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/planning-old'
            element={
              <ProtectedRoute>
                <AdminPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/customers'
            element={
              <ProtectedRoute>
                <AdminCustomers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
