import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div key={location.pathname} className="route-transition">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
