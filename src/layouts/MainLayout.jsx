import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Layout.css';

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="glass-panel main-glass-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
