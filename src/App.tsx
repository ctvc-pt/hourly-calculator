import HourlyCalculator from './components/HourlyCalculator';

function App() {
  return (
    <div className="App max-w-6xl mx-auto p-4">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Hourly Rate Calculator</h1>
      </header>
      <HourlyCalculator />
    </div>
  );
}

export default App;