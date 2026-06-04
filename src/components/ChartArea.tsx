import { CombinedChart } from './CombinedChart';
import type { SimulationResult } from '../types';

interface ChartAreaProps {
  result: SimulationResult;
  onBarDrag: (yearIndex: number, newReturn: number) => void;
}

export function ChartArea({ result, onBarDrag }: ChartAreaProps) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 16 }}>
      <CombinedChart
        years={result.years}
        rawReturns={result.rawReturns}
        userReturn={result.userReturn}
        buffettAsset={result.buffettAsset}
        sp500Asset={result.sp500Asset}
        userAsset={result.userAsset}
        onBarDrag={onBarDrag}
      />
    </div>
  );
}
