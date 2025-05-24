import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;

// import React, { useState } from "react";
// import axios from "axios";
// import './Auth.css';

// const SignUp = () => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await axios.post("http://localhost:5000/api/auth/signup", {
//         username,
//         email,
//         password,
//       });
//       // Handle response (e.g., redirect to login)
//       console.log(response.data);
//     } catch (err) {
//       setError("Failed to register, please try again.");
//     }
//   };

//   return (
//     <div className="form-box register">
//       <form onSubmit={handleSubmit}>
//         <h1>Registration</h1>
//         <div className="input-box">
//           <input
//             type="text"
//             placeholder="Username"
//             required
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           />
//           <i className="bx bxs-user"></i>
//         </div>
//         <div className="input-box">
//           <input
//             type="email"
//             placeholder="Email"
//             required
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <i className="bx bxs-envelope"></i>
//         </div>
//         <div className="input-box">
//           <input
//             type="password"
//             placeholder="Password"
//             required
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <i className="bx bxs-lock-alt"></i>
//         </div>
//         {error && <div className="error-message">{error}</div>}
//         <button type="submit" className="btn">Register</button>
//         <p>or register with social platforms</p>
//         <div className="social-icons">
//           <a href="#"><i className="bx bxl-google"></i></a>
//           <a href="#"><i className="bx bxl-facebook"></i></a>
//           <a href="#"><i className="bx bxl-github"></i></a>
//           <a href="#"><i className="bx bxl-linkedin"></i></a>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default SignUp;


