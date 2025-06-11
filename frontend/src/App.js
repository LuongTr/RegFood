import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import các components
import Sidebar from "./Sidebar";
import Header from "./Header";
import AuthPage from "./pages/auth/AuthPage";
import Dashboard from "./pages/Dashboard/Dashboard";
import FoodRecognition from "./pages/FoodRecognition";
import CalorieCalculator from "./pages/Calculator/Calculator";
import NutritionTracking from "./pages/NutritionTracking/NutritionTracking";
import Settings from "./pages/Settings/Settings";
import ChangePassword from "./pages/ChangePassword/ChangePassword"; // Import trang đổi mật khẩu
import DietRecommender from "./pages/DietRecommender/DietRecommender";
import Foods from "./pages/Foods/Foods";
import Accounts from "./pages/Accounts/Accounts";
import LandingPage from "./pages/LandingPage/LandingPage";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/auth" />;
  }
  return children;
};

// Role Protected Route component
const RoleProtectedRoute = ({ requiredRole, children }) => {
  const { token, hasRole } = useAuth();
  
  if (!token) {
    return <Navigate to="/auth" />;
  }
  
  if (!hasRole(requiredRole)) {
    return <Navigate to="/" />;
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
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth" element={!token ? <AuthPage /> : <Navigate to="/" />} />
        
        <Route path="/" element={ token ? (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute> ) : (<LandingPage />)
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
        {/* Thêm route mới cho trang đổi mật khẩu */}
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/diet-recommender" element={
          <ProtectedRoute>
            <DietRecommender />
          </ProtectedRoute>
        } />
        <Route path="/foods" element={
          <RoleProtectedRoute requiredRole="admin">
            <Foods />
          </RoleProtectedRoute>
        } />
        <Route path="/accounts" element={
          <RoleProtectedRoute requiredRole="admin">
            <Accounts />
          </RoleProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
