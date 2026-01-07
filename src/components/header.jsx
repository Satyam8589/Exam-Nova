import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './header.css';
import { auth, db } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const dropdownRef = useRef(null);

  // Fetch user's role from Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navItems = [
    { path: '/exams', label: 'Browse Exams', icon: '📋' },
    { path: '/bookmarks', label: 'My Exams', icon: '⭐', requiresAuth: true },
    { path: '/reminders', label: 'Reminders', icon: '🔔', requiresAuth: true },
  ];

  if (userRole === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: '⚙️', requiresAuth: true });
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/exams" className="logo">
          
          <span className="logo-text">ExamNova</span>
        </Link>
        
        <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navItems.filter(item => !item.requiresAuth || user).map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="actions">
          {user ? (
            <div className="profile-menu" ref={dropdownRef}>
              <button 
                className="profile-trigger" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User menu"
              >
                <span className="user-avatar">👤</span>
                <span className="user-name-mobile">{user.displayName || user.email?.split('@')[0]}</span>
                <span className="dropdown-arrow">{profileDropdownOpen ? '▲' : '▼'}</span>
              </button>

              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">👤</div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-name">{user.displayName || 'User'}</div>
                      <div className="dropdown-email">{user.email}</div>
                      {userRole === 'admin' && <div className="dropdown-role">Admin</div>}
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link 
                    to="/bookmarks" 
                    className="dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <span className="dropdown-icon">⭐</span>
                    <span>My Exams</span>
                  </Link>

                  <div className="dropdown-item dark-mode-toggle">
                    <span className="dropdown-icon">{darkMode ? '🌙' : '☀️'}</span>
                    <span>Dark Mode</span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={darkMode}
                        onChange={toggleDarkMode}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item logout-item" onClick={handleSignOut}>
                    <span className="dropdown-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-login">🔐 Login</Link>
          )}
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
			</div>
		</header>
	);
};

export default Header;
