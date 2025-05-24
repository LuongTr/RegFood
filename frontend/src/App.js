import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Sidebar from "./Sidebar";
import Header from "./Header";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import FoodRecognition from "./pages/FoodRecognition";
import CalorieCalculator from "./pages/Calculator/Calculator";
import NutritionTracking from "./pages/NutritionTracking/NutritionTracking";
import Settings from "./pages/Settings/Settings";
import DietRecommender from "./pages/DietRecommender/DietRecommender";
import Foods from "./pages/Foods/Foods";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/signin" />;
    // return <Navigate to="/login" />;
  }
  return children;
};

function AppContent() {
  const { token } = useAuth();
  
  return (
    <>
      {token && <Header />}
      {token && <Sidebar />}
      <Routes>
        <Route path="/signin" element={!token ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/signup" element={!token ? <SignUp /> : <Navigate to="/" />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/food-recognition" element={
          <ProtectedRoute>
            <FoodRecognition />
          </ProtectedRoute>
        } />
        <Route path="/calorie-calculator" element={
          <ProtectedRoute>
            <CalorieCalculator />
          </ProtectedRoute>
        } />
        <Route path="/nutrition-tracking" element={
          <ProtectedRoute>
            <NutritionTracking />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/diet-recommender" element={
          <ProtectedRoute>
            <DietRecommender />
          </ProtectedRoute>
        } />
        <Route path="/foods" element={
          <ProtectedRoute>
            <Foods />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
