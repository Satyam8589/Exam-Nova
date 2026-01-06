import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  const categories = [
    { id: 'ssc', name: 'SSC', icon: '📝', color: '#667eea' },
    { id: 'banking', name: 'Banking', icon: '🏦', color: '#06b6d4' },
    { id: 'railway', name: 'Railway', icon: '🚂', color: '#f59e0b' },
    { id: 'upsc', name: 'UPSC', icon: '🎓', color: '#8b5cf6' },
    { id: 'state-psc', name: 'State PSC', icon: '🏛️', color: '#ec4899' },
    { id: 'defense', name: 'Defense', icon: '⚔️', color: '#ef4444' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      loadUserCategory();
    }
  }, [user, navigate]);

  const loadUserCategory = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setSelectedCategory(userDoc.data().selectedCategory || '');
      }
    } catch (error) {
      console.error('Error loading category:', error);
    }
  };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleCategoryChange = async (categoryId) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        selectedCategory: categoryId,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSelectedCategory(categoryId);
      setMessage({ type: 'success', text: 'Category updated successfully!' });
      setIsEditingCategory(false);
      
      // Navigate to the new dashboard
      setTimeout(() => {
        navigate(`/dashboard/${categoryId}`);
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to update category: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(user, {
        displayName: displayName
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to update profile: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      setLoading(false);
      return;
    }

    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setMessage({ type: 'error', text: 'Current password is incorrect!' });
      } else {
        setMessage({ type: 'error', text: `Failed to change password: ${error.message}` });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-screen">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <h1>My Profile</h1>
          <p className="profile-subtitle">Manage your account and preferences</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-section">
          <h2>👤 Account Information</h2>
          <div className="info-card">
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Display Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="edit-input"
                  placeholder="Enter your name"
                />
              ) : (
                <span>{user.displayName || 'Not set'}</span>
              )}
            </div>
            <div className="info-item">
              <label>Account Created:</label>
              <span>{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Last Sign In:</label>
              <span>{new Date(user.metadata.lastSignInTime).toLocaleDateString()}</span>
            </div>
          </div>

          {isEditing ? (
            <div className="button-group">
              <button 
                onClick={handleUpdateProfile} 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setDisplayName(user.displayName || '');
                }} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn btn-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-section category-section">
          <h2>📚 Exam Category</h2>
          <div className="category-info">
            <p className="category-description">
              Select your preferred exam category. This will be your default dashboard.
            </p>
          </div>
          
          {isEditingCategory ? (
            <>
              <div className="category-grid">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                    style={{
                      '--category-color': category.color,
                    }}
                  >
                    <div className="category-icon">{category.icon}</div>
                    <div className="category-name">{category.name}</div>
                    {selectedCategory === category.id && (
                      <div className="check-mark">✓</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="button-group" style={{ marginTop: '20px' }}>
                <button
                  onClick={() => setIsEditingCategory(false)}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="current-category">
              {selectedCategory ? (
                <div className="selected-category-display">
                  <span className="category-badge" style={{
                    background: categories.find(c => c.id === selectedCategory)?.color
                  }}>
                    {categories.find(c => c.id === selectedCategory)?.icon}
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                  <button
                    onClick={() => setIsEditingCategory(true)}
                    className="btn btn-change"
                  >
                    Change Category
                  </button>
                </div>
              ) : (
                <div className="no-category">
                  <p>No category selected</p>
                  <button
                    onClick={() => setIsEditingCategory(true)}
                    className="btn btn-primary"
                  >
                    Select Category
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>⚙️ Preferences</h2>
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-icon">{darkMode ? '🌙' : '☀️'}</span>
              <div>
                <div className="preference-title">Dark Mode</div>
                <div className="preference-description">
                  Switch between light and dark theme
                </div>
              </div>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="profile-section">
          <h2>🔒 Change Password</h2>
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirm new password"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
