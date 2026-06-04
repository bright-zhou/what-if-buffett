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

describe('Slider - vertical orientation', () => {
  const verticalProps = {
    min: 0,
    max: 0.1,
    step: 0.001,
    snapPoints: [0, 0.01, 0.02, 0.05, 0.10] as const,
    ariaLabel: 'Vertical slider',
  };

  it('renders with aria-orientation="horizontal" by default', () => {
    render(<Slider {...verticalProps} value={0.02} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders with aria-orientation="vertical" when orientation="vertical"', () => {
    render(<Slider {...verticalProps} value={0.02} onChange={() => {}} orientation="vertical" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('hides the display value text in vertical mode', () => {
    render(
      <Slider
        {...verticalProps}
        value={0.02}
        onChange={() => {}}
        orientation="vertical"
        format={v => `${(v * 100).toFixed(1)}%`}
      />
    );
    expect(screen.queryByText('2.0%')).not.toBeInTheDocument();
  });

  it('ArrowUp increments value by step', () => {
    const onChange = vi.fn();
    render(
      <Slider {...verticalProps} value={0.02} onChange={onChange} orientation="vertical" />
    );
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(0.021);
  });

  it('ArrowDown decrements value by step', () => {
    const onChange = vi.fn();
    render(
      <Slider {...verticalProps} value={0.02} onChange={onChange} orientation="vertical" />
    );
    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(0.019);
  });

  it('clicking the track at a specific Y position sets value', () => {
    const onChange = vi.fn();
    render(
      <Slider {...verticalProps} value={0} onChange={onChange} orientation="vertical" />
    );
    // The track is the first child div of the wrapper (the one with mouseDown handler).
    // We grab it by walking: the slider (thumb) parent -> the track div.
    const thumb = screen.getByRole('slider');
    const track = thumb.parentElement as HTMLElement;
    // Stub the bounding rect: 200px tall, top at 0
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      right: 4,
      bottom: 200,
      width: 4,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    // Click at y=100 (midpoint of 200 tall track) -> ratio 0.5 -> value 0.05
    fireEvent.mouseDown(track, { clientX: 2, clientY: 100 });
    expect(onChange).toHaveBeenCalledWith(0.05);
  });

  it('clicking a snap tick snaps the value (vertical)', () => {
    const onChange = vi.fn();
    render(
      <Slider {...verticalProps} value={0} onChange={onChange} orientation="vertical" />
    );
    const snaps = screen.getAllByRole('button', { name: /snap/i });
    fireEvent.click(snaps[2]);
    expect(onChange).toHaveBeenCalledWith(0.02);
  });
});
