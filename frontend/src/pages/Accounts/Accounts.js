import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Accounts.css';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaTrash, FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars } from 'react-icons/fa';

const Accounts = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { token, user: currentUser } = useAuth();
    const [deleteSuccess, setDeleteSuccess] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        const handleSidebarChange = () => {
            setSidebarCollapsed(document.body.classList.contains('sidebar-collapsed'));
        };

        // Initial check
        handleSidebarChange();

        // Create a MutationObserver to watch for class changes on body
        const observer = new MutationObserver(handleSidebarChange);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Fetch users on component mount and when search changes
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/users/all${search ? `?search=${search}` : ''}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data.data);
                setLoading(false);
                setError(null);
            } catch (err) {
                setError('Failed to fetch users');
                setLoading(false);
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, [token, search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user ${userName}?`)) {
            try {
                setDeleteSuccess(null);
                setDeleteError(null);
                await axios.delete(`http://localhost:5000/api/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(users.filter(user => user._id !== userId));
                setDeleteSuccess(`User ${userName} deleted successfully`);
                
                // Tự động ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    setDeleteSuccess(null);
                }, 3000);
            } catch (err) {
                console.error('Error deleting user:', err);
                setDeleteError(err.response?.data?.message || 'Failed to delete user');
                
                // Tự động ẩn thông báo lỗi sau 3 giây
                setTimeout(() => {
                    setDeleteError(null);
                }, 3000);
            }
        }
    };

    return (
        <div className={`accounts-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <div className="accounts-header">
                <h1>User Accounts Management</h1>
                <div className="search-container">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
            </div>

            {deleteSuccess && <div className="success-message">{deleteSuccess}</div>}
            {deleteError && <div className="error-message">{deleteError}</div>}

            {loading ? (
                <div className="loading">Loading users...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="users-grid">
                    {users.length === 0 ? (
                        <div className="no-users">No users found</div>
                    ) : (
                        users.map(user => (
                            <div className="user-card" key={user._id}>
                                <div className="user-header">
                                    <div className="user-avatar">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-role-badge" data-role={user.role}>
                                        {user.role}
                                    </div>
                                </div>
                                <div className="user-info">
                                    <h3 className="user-name">
                                        <FaUser className="info-icon" />
                                        {user.name}
                                    </h3>
                                    <p className="user-email">
                                        <FaEnvelope className="info-icon" />
                                        {user.email}
                                    </p>
                                    {user.gender && (
                                        <p className="user-gender">
                                            <FaVenusMars className="info-icon" />
                                            {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                                        </p>
                                    )}
                                    {user.age && (
                                        <p className="user-age">
                                            <FaCalendarAlt className="info-icon" />
                                            {user.age} years old
                                        </p>
                                    )}
                                    <p className="user-date">
                                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="user-actions">
                                    {/* Không hiển thị nút xóa cho tài khoản hiện tại đang đăng nhập */}
                                    {currentUser.id !== user._id && (
                                        <button 
                                            className="delete-btn" 
                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Accounts;