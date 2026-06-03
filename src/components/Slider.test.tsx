import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Slider } from './Slider';

describe('Slider', () => {
  const baseProps = {
    min: 0,
    max: 0.1,
    step: 0.001,
    snapPoints: [0, 0.01, 0.02, 0.05, 0.10] as const,
    ariaLabel: 'Test slider',
  };

  it('renders the current value via format function', () => {
    render(
      <Slider
        {...baseProps}
        value={0.02}
        onChange={() => {}}
        format={v => `${(v * 100).toFixed(1)}%`}
      />
    );
    expect(screen.getByText('2.0%')).toBeInTheDocument();
  });

  it('clicking a snap point fires onChange with that value', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0} onChange={onChange} />);
    const snaps = screen.getAllByRole('button', { name: /snap/i });
    // snapPoints = [0, 0.01, 0.02, 0.05, 0.10]; click index 2 (0.02)
    fireEvent.click(snaps[2]);
    expect(onChange).toHaveBeenCalledWith(0.02);
  });

  it('ArrowRight increases value by step', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.02} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(0.021);
  });

  it('ArrowLeft decreases value by step', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.02} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(0.019);
  });

  it('clamps ArrowRight at max', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.10} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(0.10);
  });

  it('clamps ArrowLeft at min', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('unmount cleans up document-level listeners (no error on later events)', () => {
    const { unmount } = render(<Slider {...baseProps} value={0} onChange={() => {}} />);
    const thumb = screen.getByRole('slider');
    fireEvent.mouseDown(thumb, { clientX: 0 });
    unmount();
    // After unmount, dispatching events on document should not throw
    expect(() => {
      fireEvent.mouseMove(document, { clientX: 100 });
      fireEvent.mouseUp(document);
    }).not.toThrow();
  });
});
