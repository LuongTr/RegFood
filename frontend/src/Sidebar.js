import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import {
  FaHome,
  FaCamera,
  FaCalculator,
  FaChartLine,
  FaCog,
  FaUtensils,
  FaAngleLeft,
  FaAngleRight,
  FaList,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  const location = useLocation();

  // Thêm class vào body dựa trên trạng thái collapsed
  useEffect(() => {
    if (collapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [collapsed]);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="logo-section">
        <FaUtensils className="logo-icon" />
        {!collapsed && <span className="logo-text">NutriScan</span>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <FaAngleRight /> : <FaAngleLeft />}
        </button>
      </div>

      <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
        <FaHome className="icon" />
        {!collapsed && <span>Dashboard</span>}
      </Link>

      <Link to="/food-recognition" className={`nav-item ${location.pathname === "/food-recognition" ? "active" : ""}`}>
        <FaCamera className="icon" />
        {!collapsed && <span>Food Recognition</span>}
      </Link>

      <Link to="/calorie-calculator" className={`nav-item ${location.pathname === "/calorie-calculator" ? "active" : ""}`}>
        <FaCalculator className="icon" />
        {!collapsed && <span>Calorie Calculator</span>}
      </Link>

      <Link to="/nutrition-tracking" className={`nav-item ${location.pathname === "/nutrition-tracking" ? "active" : ""}`}>
        <FaChartLine className="icon" />
        {!collapsed && <span>Nutrition Tracking</span>}
      </Link>      <Link to="/diet-recommender" className={`nav-item ${location.pathname === "/diet-recommender" ? "active" : ""}`}>
        <FaUtensils className="icon" />
        {!collapsed && <span>Diet Recommender</span>}
      </Link>

      <Link to="/foods" className={`nav-item ${location.pathname === "/foods" ? "active" : ""}`}>
        <FaList className="icon" />
        {!collapsed && <span>Food Database</span>}
      </Link>

      <Link to="/settings" className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}>
        <FaCog className="icon" />
        {!collapsed && <span>Settings</span>}
      </Link>
    </div>
  );
};

export default Sidebar;
