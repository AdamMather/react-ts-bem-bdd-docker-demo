import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import StockControl from './pages/StockControl/StockControl';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock-control" element={<StockControl />} />
      </Routes>
    </Router>
  );
};

export default App;
