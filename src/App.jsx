import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import KennelBoarding from './pages/KennelBoarding/KennelBoarding';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kennel-boarding" element={<KennelBoarding />} />
      </Routes>
    </Router>
  );
};

export default App;
