import { useEffect } from 'react';
import { useSimulator } from './hooks/useSimulator';
import { useIdleHint } from './hooks/useIdleHint';
import { Header } from './components/Header';
import { ParameterControls } from './components/ParameterControls';
import { Legend } from './components/Legend';
import { ChartArea } from './components/ChartArea';
import { Hints } from './components/Hints';
import { SummaryCards } from './components/SummaryCards';
import { Footer } from './components/Footer';
import { useLang } from './i18n/useLang';
import type { Parameters } from './parameters/apply';
import './App.css';

export default function App() {
  const { result, parameters, updateReturn, setParameters, resetAll } = useSimulator();
  const { shouldBreath, reset: resetIdleHint } = useIdleHint();
  const { lang, t } = useLang();

  const handleBarDrag = (yearIndex: number, newReturn: number) => {
    resetIdleHint();
    updateReturn(yearIndex, newReturn);
  };

  const handleParametersChange = (next: Parameters) => {
    resetIdleHint();
    setParameters(next);
  };

  const handleTimeNavigate = () => {
    resetIdleHint();
  };

  // i18n-aware: append lang-appropriate tagline to <title> and sync <html lang>
  // so tab title, on-page language, and AT all stay aligned. og:title /
  // og:locale stay English (outbound-first for SEO); zh_CN is alternate.
  useEffect(() => {
    document.title = `${t('app.title')} — ${t('app.titleTagline')}`;
    document.documentElement.lang = lang;
  }, [lang, t]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
      <Header onReset={resetAll} shouldBreath={shouldBreath} />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        padding: '8px 0',
        position: 'relative',
      }}>
        <Legend />
        <ParameterControls
          parameters={parameters}
          onChange={handleParametersChange}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <ChartArea
            result={result}
            onBarDrag={handleBarDrag}
            onTimeNavigate={handleTimeNavigate}
          />
        </div>
        <SummaryCards stats={result.stats} />
      </div>
      <Hints />
      <Footer />
    </div>
  );
}
