// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from "react";
import FoodRegconition from "./pages/FoodRecognition";
import Sidebar from "./Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
            {/* <Route path="/" element={<Dashboard />} /> */}
            <Route path="/food-recognition" element={<FoodRegconition />} />
            {/* <Route path="/calorie-calculator" element={<CalorieCalculator />} />
            <Route path="/nutrition-tracking" element={<NutritionTracking />} /> */}
          </Routes>
    </Router>
    // <div>
    //   <h1>Food Ingredient Recognition</h1>
    //   <UploadImage />
    //   <Sidebar />
    // </div>
  );
}

export default App;
