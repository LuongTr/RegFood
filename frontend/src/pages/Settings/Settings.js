import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="page-container">
      <div className="settings-container">
        <h1>Settings</h1>
        
        <div className="settings-section">
          <h2>Account</h2>
          <div className="settings-card">
            <button 
              className="password-button"
              onClick={handleChangePassword}
            >
              Change Password
            </button>
            
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;