import { useSimulator } from './hooks/useSimulator';
import { Header } from './components/Header';
import { Legend } from './components/Legend';
import { ChartArea } from './components/ChartArea';
import { SummaryCards } from './components/SummaryCards';
import { Footer } from './components/Footer';
import './App.css';

export default function App() {
  const { result, updateReturn, resetReturns } = useSimulator();

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
      <Header onReset={resetReturns} />
      <Legend />
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <ChartArea result={result} onBarDrag={updateReturn} />
        </div>
        <SummaryCards stats={result.stats} />
      </div>
      <Footer />
    </div>
  );
}
