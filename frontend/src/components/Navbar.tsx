import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <Link to='/' className='navbar-logo'>
          Auto Aziz
        </Link>
        <ul className='navbar-menu'>
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to='/'>Accueil</Link>
          </li>
          <li className={location.pathname === '/services' ? 'active' : ''}>
            <Link to='/services'>Services</Link>
          </li>
          <li className={location.pathname === '/tarifs' ? 'active' : ''}>
            <Link to='/tarifs'>Tarifs</Link>
          </li>
          <li className={location.pathname === '/rendez-vous' ? 'active' : ''}>
            <Link to='/rendez-vous'>Rendez-vous</Link>
          </li>
          <li className={location.pathname === '/contact' ? 'active' : ''}>
            <Link to='/contact'>Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
