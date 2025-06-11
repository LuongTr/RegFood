import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">NutriScan</div>
      <ul>
        <li><a href="#about">About Us</a></li>
        <li><a href="#contact">Contact</a></li>
        {/* <li><Link to="/auth" className="btn-get-started">Get Started</Link></li> */}
        <li><a href="/auth" className="get-started">Get Started</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
