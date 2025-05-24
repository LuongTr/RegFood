// Login.js
import React, { useState } from 'react';
import './Login.css';
import axios from 'axios'; // assuming you're using axios

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setSuccess('Login successful!');
      console.log(response.data); // maybe store token, redirect, etc.
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axios.post('/api/auth/register', { email, password });
      setSuccess('Registration successful!');
      console.log(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="login-page">
      <div className={`container ${!isLoginMode ? 'login-mode' : ''}`}>
        {/* Login Form */}
        <div className="form-section login">
          <h1>Sign In</h1>
          <form onSubmit={handleLogin}>
            <div className="input-box">
              <i>✉️</i>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-box">
              <i>🔒</i>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div className="forgot-password">
              <a href="#">Forgot your password?</a>
            </div>
            <button type="submit" className="btn">Sign In</button>
            <p className="social-text">Or Sign in with social platforms</p>
            <div className="social-icons">
              <a href="#">F</a>
              <a href="#">G</a>
              <a href="#">T</a>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className="form-section register">
          <h1>Sign Up</h1>
          <form onSubmit={handleRegister}>
            <div className="input-box">
              <i>✉️</i>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-box">
              <i>🔒</i>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <button type="submit" className="btn">Sign Up</button>
            <p className="social-text">Or Sign up with social platforms</p>
            <div className="social-icons">
              <a href="#">F</a>
              <a href="#">G</a>
              <a href="#">T</a>
            </div>
          </form>
        </div>

        {/* Blue Panel */}
        <div className="blue-section">
          <h1>{isLoginMode ? "New here?" : "Already have an account?"}</h1>
          <p>{isLoginMode ? "Sign up and discover great content!" : "Log in to access your account."}</p>
          <button className="btn" onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
