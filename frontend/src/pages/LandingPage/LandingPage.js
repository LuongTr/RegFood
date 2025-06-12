import React from "react";
import Navbar from "./Navbar";
import "./LandingPage.css";
import picture from "./landing_picture.png";
import about from "./Copilot_20250612_210232.png";
import { FaEnvelope, FaGlobe, FaMapMarkerAlt } from "react-icons/fa";

const LandingPage = () => {
  return (
    <div>
      <Navbar />

      <section className="landing-hero">
        <div className="text-content">
          <h1>Meal Recommendation System</h1>
          <h3>Based on User's Health</h3>
          <p>Personalized meal suggestions tailored to your dietary needs and health goals.</p>
          <a href="/auth" className="btn-get-started">Get Started</a>
        </div>
        <div className="image-content">
          <img src={picture} alt="Meal system" />
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content-wrapper">
          <div className="about-text">
            <h2>About Us</h2>
            <h3>Helping You Make Better Food Choices</h3>
            <p>
              At NutriScan, we believe that food is more than just fuel—it's a key to better health 
              and well-being. Our mission is to help people make informed and personalized 
              meal choices based on your unique health data. By leveraging cutting-edge 
              technology, we provide tailored meal recommendations that align with dietary 
              needs and simply aiming for a balanced diet.
            </p>
          </div>
          <div className="about-image">
            <img src={about} alt="About NutriScan" className="about-img" />
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="contact-content">
          <h2>Contact Us</h2>
          <p>Have questions or need assistance? We'd love to hear from you!</p>
          
          <div className="contact-info-wrapper">
            <div className="contact-info-item">
              <FaEnvelope className="contact-icon" />
              <span>NutriScan@gmail.com</span>
            </div>
            
            <div className="contact-info-item">
              <FaGlobe className="contact-icon" />
              <span>www.nutrial.com</span>
            </div>
            
            <div className="contact-info-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>Available globally</span>
            </div>
            
            <div className="contact-info-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>Available globally</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
