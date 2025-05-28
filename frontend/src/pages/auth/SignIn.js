// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import './Auth.css';

// const SignIn = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to sign in');
//       }

//       login(data.user, data.token);
//       navigate('/');
//     } catch (err) {
//       setError(err.message);
//     }
//   };
  
//   // Handle navigation to signup page
//   const handleRegisterClick = () => {
//     navigate('/signup');
//   };

//   return (
//     <div className="auth-container">
//       <div className="container">
//         <div className="form-box login">
//           <form onSubmit={handleSubmit}>
//             <h1>Login</h1>
//             {error && <div className="error-message">{error}</div>}
//             <div className="input-box">
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//               <i className="bx bxs-user"></i>
//             </div>
//             <div className="input-box">
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//               <i className="bx bxs-lock-alt"></i>
//             </div>
//             <div className="forgot-link">
//               <a href="#">Forgot Password?</a>
//             </div>
//             <button type="submit" className="btn">Login</button>
//             <p>or login with social platforms</p>
//             <div className="social-icons">
//               <a href="#"><i className="bx bxl-google"></i></a>
//               <a href="#"><i className="bx bxl-facebook"></i></a>
//               <a href="#"><i className="bx bxl-github"></i></a>
//               <a href="#"><i className="bx bxl-linkedin"></i></a>
//             </div>
//           </form>
//         </div>

//         <div className="form-box register">
//           <form action="/signup">
//             <h1>Registration</h1>
//             <div className="input-box">
//               <input
//                 type="text"
//                 placeholder="Full Name"
//                 required
//               />
//               <i className='bx bxs-user'></i>
//             </div>
//             <div className="input-box">
//               <input
//                 type="email"
//                 placeholder="Email"
//                 required
//               />
//               <i className='bx bxs-envelope'></i>
//             </div>
//             <div className="input-box">
//               <input
//                 type="password"
//                 placeholder="Password"
//                 required
//               />
//               <i className='bx bxs-lock-alt'></i>
//             </div>
//             <button type="submit" className="btn">Register</button>
//             <p>or register with social platforms</p>
//             <div className="social-icons">
//               <a href="#"><i className='bx bxl-google'></i></a>
//               <a href="#"><i className='bx bxl-facebook'></i></a>
//               <a href="#"><i className='bx bxl-github'></i></a>
//               <a href="#"><i className='bx bxl-linkedin'></i></a>
//             </div>
//           </form>
//         </div>

//         <div className="toggle-box">
//           <div className="toggle-panel toggle-left">
//             <h1>Hello, Welcome!</h1>
//             <p>Don't have an account?</p>
//             <button className="btn register-btn" onClick={handleRegisterClick}>Register</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignIn;

// // import React, { useState } from "react";
// // import axios from "axios";
// // import './Auth.css';

// // const SignIn = () => {
// //   const [username, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [error, setError] = useState("");

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const response = await axios.post("http://localhost:5000/api/auth/login", {
// //         username,
// //         password,
// //       });
// //       // Handle response (e.g., redirect, store token)
// //       console.log(response.data);
// //     } catch (err) {
// //       setError("Invalid credentials, please try again.");
// //     }
// //   };

// //   return (
// //     <div className="form-box login">
// //       <form onSubmit={handleSubmit}>
// //         <h1>Login</h1>
// //         <div className="input-box">
// //           <input
// //             type="text"
// //             placeholder="Username"
// //             required
// //             value={username}
// //             onChange={(e) => setUsername(e.target.value)}
// //           />
// //           <i className="bx bxs-user"></i>
// //         </div>
// //         <div className="input-box">
// //           <input
// //             type="password"
// //             placeholder="Password"
// //             required
// //             value={password}
// //             onChange={(e) => setPassword(e.target.value)}
// //           />
// //           <i className="bx bxs-lock-alt"></i>
// //         </div>
// //         {error && <div className="error-message">{error}</div>}
// //         <div className="forgot-link">
// //           <a href="#">Forgot Password?</a>
// //         </div>
// //         <button type="submit" className="btn">Login</button>
// //         <p>or login with social platforms</p>
// //         <div className="social-icons">
// //           <a href="#"><i className="bx bxl-google"></i></a>
// //           <a href="#"><i className="bx bxl-facebook"></i></a>
// //           <a href="#"><i className="bx bxl-github"></i></a>
// //           <a href="#"><i className="bx bxl-linkedin"></i></a>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // };

// // export default SignIn;
