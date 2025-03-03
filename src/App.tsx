import React from 'react';
import HourlyCalculator from './HourlyCalculator';
import './App.css';

function App() {
  return (
    <div className="App">
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
        <HourlyCalculator />
      </div>
    </div>
  );
}

export default App;