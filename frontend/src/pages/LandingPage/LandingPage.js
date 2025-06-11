import React from "react";
import Navbar from "./Navbar";
import "./LandingPage.css";
import picture from "./landing_picture.png";

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

      <section id="about" className="section">
        <h2>About Us</h2>
        <p>We help people make better meal choices based on their health data.</p>
      </section>

      <section id="contact" className="section">
        <h2>Contact</h2>
        <p>Email us at: NutriScan@gmail.com</p>
      </section>
    </div>
  );
};

export default LandingPage;
