import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Boarding from './pages/Boarding/Boarding';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boarding" element={<Boarding />} />
      </Routes>
    </Router>
  );
};

export default App;
