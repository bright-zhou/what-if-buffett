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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
      <Header />
      <Legend />
      <ChartArea result={result} onBarDrag={updateReturn} />
      <SummaryCards stats={result.stats} />
      <Footer onReset={resetReturns} />
    </div>
  );
}
