import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  StickyNote, 
  Tags, 
  Wallet, 
  Share2, 
  LogOut, 
  Menu, 
  X,
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Notes / নোটসমূহ', path: '/', icon: <StickyNote size={20} /> },
    { name: 'Categories / ক্যাটেগরি', path: '/categories', icon: <Tags size={20} /> },
    { name: 'Accounts / হিসাব', path: '/accounts', icon: <Wallet size={20} /> },
    { name: 'Shared With Me', path: '/shared-accounts', icon: <Share2 size={20} /> },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <button 
        className="mobile-menu-btn d-md-none" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 1000,
          background: 'var(--surface)', border: '1px solid var(--border-color)',
          padding: '8px', borderRadius: '8px', color: 'white', cursor: 'pointer'
        }}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <BookOpen color="var(--primary)" size={28} />
          <h2>Smart Note</h2>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
