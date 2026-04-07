import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpandedPanel from '../ExpandedPanel';

describe('ExpandedPanel', () => {
  it('does not render when not expanded', () => {
    const { container } = render(
      <ExpandedPanel isExpanded={false} mode="text" onModeChange={jest.fn()} onClose={jest.fn()}>
        <div>Content</div>
      </ExpandedPanel>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when expanded', () => {
    render(
      <ExpandedPanel isExpanded={true} mode="text" onModeChange={jest.fn()} onClose={jest.fn()}>
        <div>Content</div>
      </ExpandedPanel>
    );
    expect(screen.getByText('Mentor Studio')).toBeInTheDocument();
  });

  it('calls onModeChange when voice button clicked', async () => {
    const mockModeChange = jest.fn();
    render(
      <ExpandedPanel isExpanded={true} mode="text" onModeChange={mockModeChange} onClose={jest.fn()}>
        <div>Content</div>
      </ExpandedPanel>
    );

    const voiceButton = screen.getByRole('button', { name: /switch to voice/i });
    await userEvent.click(voiceButton);
    expect(mockModeChange).toHaveBeenCalledWith('voice');
  });

  it('calls onClose when close button clicked', async () => {
    const mockClose = jest.fn();
    render(
      <ExpandedPanel isExpanded={true} mode="text" onModeChange={jest.fn()} onClose={mockClose}>
        <div>Content</div>
      </ExpandedPanel>
    );

    const closeButton = screen.getByRole('button', { name: /close ai assistant/i });
    await userEvent.click(closeButton);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('renders children content', () => {
    render(
      <ExpandedPanel isExpanded={true} mode="text" onModeChange={jest.fn()} onClose={jest.fn()}>
        <div data-testid="custom-content">My Content</div>
      </ExpandedPanel>
    );
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('shows correct header icon for voice mode', () => {
    const { rerender } = render(
      <ExpandedPanel isExpanded={true} mode="text" onModeChange={jest.fn()} onClose={jest.fn()}>
        <div>Content</div>
      </ExpandedPanel>
    );
    expect(screen.getByText('💬')).toBeInTheDocument();

    rerender(
      <ExpandedPanel isExpanded={true} mode="voice" onModeChange={jest.fn()} onClose={jest.fn()}>
        <div>Content</div>
      </ExpandedPanel>
    );
    expect(screen.getByText('🎙️')).toBeInTheDocument();
  });
});
