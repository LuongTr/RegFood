import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    // Fetch user profile data when component mounts
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data);
        setEditedUser(response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset editedUser to original values when canceling edit
    if (isEditing) {
      setEditedUser(user);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({
      ...editedUser,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const response = await axios.put('http://localhost:5000/api/users/profile', editedUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading && !user) {
    return (
      <div className="page-container">
        <div className="settings-container">
          <h1>Settings</h1>
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="settings-container">
          <h1>Settings</h1>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="settings-container">
        <h1>Settings</h1>
        
        <div className="settings-section">
          <h2>User Profile</h2>
          <div className="settings-card profile-card">
            {!isEditing ? (
              <>
                <div className="profile-info">
                  <div className="profile-row">
                    <span className="profile-label">Name:</span>
                    <span className="profile-value">{user?.name}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Email:</span>
                    <span className="profile-value">{user?.email}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Age:</span>
                    <span className="profile-value">{user?.age || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Gender:</span>
                    <span className="profile-value">{user?.gender || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Height:</span>
                    <span className="profile-value">{user?.height ? `${user.height} cm` : 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Weight:</span>
                    <span className="profile-value">{user?.weight ? `${user.weight} kg` : 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Activity Level:</span>
                    <span className="profile-value">{user?.activityLevel || 'Not set'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Role:</span>
                    <span className="profile-value">{user?.role}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Created:</span>
                    <span className="profile-value">{formatDate(user?.createdAt)}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Last Updated:</span>
                    <span className="profile-value">{formatDate(user?.updatedAt)}</span>
                  </div>
                </div>
                <button 
                  className="edit-button"
                  onClick={handleEditToggle}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <div className="edit-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={editedUser.name || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input 
                    type="number" 
                    id="age" 
                    name="age" 
                    value={editedUser.age || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select 
                    id="gender" 
                    name="gender" 
                    value={editedUser.gender || ''} 
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="height">Height (cm)</label>
                  <input 
                    type="number" 
                    id="height" 
                    name="height" 
                    value={editedUser.height || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input 
                    type="number" 
                    id="weight" 
                    name="weight" 
                    value={editedUser.weight || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="activityLevel">Activity Level</label>
                  <select 
                    id="activityLevel" 
                    name="activityLevel" 
                    value={editedUser.activityLevel || ''} 
                    onChange={handleInputChange}
                  >
                    <option value="">Select Activity Level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very-active">Very Active</option>
                  </select>
                </div>
                <div className="edit-buttons">
                  <button 
                    className="save-button"
                    onClick={handleSaveProfile}
                  >
                    Save
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
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