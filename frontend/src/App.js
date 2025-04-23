import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

import Dashboard from "./pages/Dashboard/Dashboard";
import FoodRecognition from "./pages/FoodRecognition";
import CalorieCalculator from "./pages/Calculator/Calculator";
import NutritionTracking from "./pages/NutritionTracking/NutritionTracking";

function App() {
  return (
    <Router>
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/food-recognition" element={<FoodRecognition />} />
        <Route path="/calorie-calculator" element={<CalorieCalculator />} />
        <Route path="/nutrition-tracking" element={<NutritionTracking />} />
      </Routes>
    </Router>
  );
}

export default App;
