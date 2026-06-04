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

  it('exposes aria-orientation="vertical" on the slider role', () => {
    render(<Slider {...baseProps} value={0.02} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('renders a snap-tick label for each snap point, formatted', () => {
    render(
      <Slider
        {...baseProps}
        value={0}
        onChange={() => {}}
        format={v => `${(v * 100).toFixed(1)}%`}
      />
    );
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('1.0%')).toBeInTheDocument();
    expect(screen.getByText('2.0%')).toBeInTheDocument();
    expect(screen.getByText('5.0%')).toBeInTheDocument();
    expect(screen.getByText('10.0%')).toBeInTheDocument();
  });

  it('clicking a snap point fires onChange with that value', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0} onChange={onChange} />);
    const snaps = screen.getAllByRole('button', { name: /snap/i });
    fireEvent.click(snaps[2]);
    expect(onChange).toHaveBeenCalledWith(0.02);
  });

  it('ArrowUp increments value by step', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.02} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(0.021);
  });

  it('ArrowDown decrements value by step', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.02} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(0.019);
  });

  it('ArrowRight is also accepted as increment (forward-compat with horizontal)', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.02} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(0.021);
  });

  it('ArrowLeft is also accepted as decrement (forward-compat with horizontal)', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.02} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(0.019);
  });

  it('clamps ArrowUp at max', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0.10} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(0.10);
  });

  it('clamps ArrowDown at min', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0} onChange={onChange} />);
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('clicking the track at a specific Y position sets value', () => {
    const onChange = vi.fn();
    render(<Slider {...baseProps} value={0} onChange={onChange} />);
    const track = screen.getByTestId('slider-track');
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      top: 0, left: 0, right: 4, bottom: 200, width: 4, height: 200, x: 0, y: 0,
      toJSON: () => ({}),
    });
    // Click at y=100 (midpoint of 200-tall track) -> ratio 0.5 -> value 0.05
    fireEvent.mouseDown(track, { clientX: 2, clientY: 100 });
    expect(onChange).toHaveBeenCalledWith(0.05);
  });

  it('unmount cleans up document-level listeners (no error on later events)', () => {
    const { unmount } = render(<Slider {...baseProps} value={0} onChange={() => {}} />);
    const thumb = screen.getByRole('slider');
    fireEvent.mouseDown(thumb, { clientY: 0 });
    unmount();
    // After unmount, dispatching events on document should not throw
    expect(() => {
      fireEvent.mouseMove(document, { clientY: 100 });
      fireEvent.mouseUp(document);
    }).not.toThrow();
  });
});
