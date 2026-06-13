import { useEffect } from 'react';
import { useSimulator } from './hooks/useSimulator';
import { Header } from './components/Header';
import { ParameterControls } from './components/ParameterControls';
import { Legend } from './components/Legend';
import { ChartArea } from './components/ChartArea';
import { Hints } from './components/Hints';
import { SummaryCards } from './components/SummaryCards';
import { Footer } from './components/Footer';
import { useLang } from './i18n/useLang';
import './App.css';

export default function App() {
  const { result, parameters, updateReturn, setParameters, resetAll } = useSimulator();
  const { lang, t } = useLang();

  // i18n-aware: append lang-appropriate tagline to <title> and sync <html lang>
  // so tab title, on-page language, and AT all stay aligned. og:title /
  // og:locale stay English (outbound-first for SEO); zh_CN is alternate.
  useEffect(() => {
    document.title = `${t('app.title')} — ${t('app.titleTagline')}`;
    document.documentElement.lang = lang;
  }, [lang, t]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
      <Header onReset={resetAll} />
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
          onChange={setParameters}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <ChartArea result={result} onBarDrag={updateReturn} />
        </div>
        <SummaryCards stats={result.stats} />
      </div>
      <Hints />
      <Footer />
    </div>
  );
}
