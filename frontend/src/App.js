import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Sidebar from "./Sidebar";
import Header from "./Header";
import AuthPage from "./pages/auth/AuthPage";
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
    return <Navigate to="/auth" />;
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
        <Route path="/auth" element={!token ? <AuthPage /> : <Navigate to="/" />} />
        {/* Redirect older routes to new auth page */}
        <Route path="/signin" element={<Navigate to="/auth" />} />
        <Route path="/signup" element={<Navigate to="/auth" />} />
        
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
