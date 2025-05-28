// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import './Auth.css';

// const SignUp = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           password: formData.password
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to sign up');
//       }

//       login(data.user, data.token);
//       navigate('/');
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   // Handle navigation to signin page
//   const handleLoginClick = () => {
//     navigate('/signin');
//   };

//   return (
//     <div className="auth-container">
//       <div className="container active">
//         <div className="form-box register">
//           <form onSubmit={handleSubmit}>
//             <h1>Registration</h1>
//             {error && <div className="error-message">{error}</div>}
//             <div className="input-box">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Full Name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//               />
//               <i className="bx bxs-user"></i>
//             </div>
//             <div className="input-box">
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//               <i className="bx bxs-envelope"></i>
//             </div>
//             <div className="input-box">
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 minLength={6}
//               />
//               <i className="bx bxs-lock-alt"></i>
//             </div>
//             <div className="input-box">
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 placeholder="Confirm Password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 required
//                 minLength={6}
//               />
//               <i className="bx bxs-lock-alt"></i>
//             </div>
//             <button type="submit" className="btn">Register</button>
//             <p>or register with social platforms</p>
//             <div className="social-icons">
//               <a href="#"><i className="bx bxl-google"></i></a>
//               <a href="#"><i className="bx bxl-facebook"></i></a>
//               <a href="#"><i className="bx bxl-github"></i></a>
//               <a href="#"><i className="bx bxl-linkedin"></i></a>
//             </div>
//           </form>
//         </div>
        
//         <div className="toggle-box">
//           <div className="toggle-panel toggle-right">
//             <h1>Welcome Back!</h1>
//             <p>Already have an account?</p>
//             <button className="btn login-btn" onClick={handleLoginClick}>Login</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;


