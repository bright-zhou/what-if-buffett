import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParameterControls } from './ParameterControls';
import { translations } from '../i18n';
import type { Language } from '../i18n';

const { langRef, setLang } = vi.hoisted(() => {
  const ref: { current: Language } = { current: 'zh' };
  return {
    langRef: ref,
    setLang: (l: Language) => {
      ref.current = l;
    },
  };
});

vi.mock('../i18n/LanguageContext', () => ({
  useLang: () => ({
    lang: langRef.current,
    t: (key: string) => translations[langRef.current][key as keyof typeof translations.zh] ?? key,
    toggleLang: () => {},
  }),
}));

const defaultParams = { leverage: 1, friction: 0 };

describe('ParameterControls', () => {
  beforeEach(() => {
    setLang('zh');
  });

  it('renders 3 buttons: friction, leverage, reset', () => {
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /摩擦成本/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /杠杆倍数/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /重置参数/ })).toBeInTheDocument();
  });

  it('friction button shows current value formatted as percentage', () => {
    render(
      <ParameterControls
        parameters={{ leverage: 1, friction: 0.025 }}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /2\.5%/ })).toBeInTheDocument();
  });

  it('leverage button shows current value formatted as multiplier', () => {
    render(
      <ParameterControls
        parameters={{ leverage: 2, friction: 0 }}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /2\.0x/ })).toBeInTheDocument();
  });

  it('initially no slider is visible', () => {
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('clicking friction button reveals vertical slider', () => {
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /摩擦成本/ }));
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('clicking active button closes the slider (toggle)', () => {
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    const frictionBtn = screen.getByRole('button', { name: /摩擦成本/ });
    fireEvent.click(frictionBtn);
    expect(screen.getByRole('slider')).toBeInTheDocument();
    fireEvent.click(frictionBtn);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('accordion: opening leverage while friction is open closes friction', () => {
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /摩擦成本/ }));
    expect(screen.getByRole('slider', { name: /摩擦成本/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /杠杆倍数/ }));
    // friction slider closed, leverage slider open
    expect(screen.queryByRole('slider', { name: /摩擦成本/ })).not.toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /杠杆倍数/ })).toBeInTheDocument();
  });

  it('clicking outside closes the open slider', () => {
    const outsideNode = (
      <div>
        <div data-testid="outside">outside</div>
        <ParameterControls
          parameters={defaultParams}
          onChange={() => {}}
          onReset={() => {}}
        />
      </div>
    );
    render(outsideNode);
    fireEvent.click(screen.getByRole('button', { name: /摩擦成本/ }));
    expect(screen.getByRole('slider')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('reset button calls onReset', () => {
    const onReset = vi.fn();
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={onReset}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /重置参数/ }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('dropdown is rendered inside a position: relative parent (anchored to button)', () => {
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /摩擦成本/ }));
    const slider = screen.getByRole('slider');
    // Find the dropdown wrapper: walk up from the slider until we find the
    // element with position: absolute that is also the slider's first
    // positioned ancestor above the Slider's own internal wrappers.
    let node: HTMLElement | null = slider;
    while (node && !(node.style.position === 'absolute' && node.style.top === '100%')) {
      node = node.parentElement;
    }
    expect(node).not.toBeNull();
    const dropdownWrapper = node as HTMLElement;
    expect(dropdownWrapper).toHaveStyle({ position: 'absolute', top: '100%' });
    const buttonWrapper = dropdownWrapper.parentElement as HTMLElement;
    expect(buttonWrapper).toHaveStyle({ position: 'relative' });
  });

  it('English: friction button label uses English text', () => {
    setLang('en');
    render(
      <ParameterControls
        parameters={defaultParams}
        onChange={() => {}}
        onReset={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /Friction Cost/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Leverage/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Parameters/ })).toBeInTheDocument();
  });
});
