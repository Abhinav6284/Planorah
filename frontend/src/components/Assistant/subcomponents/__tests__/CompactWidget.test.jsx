import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompactWidget from '../CompactWidget';

describe('CompactWidget', () => {
  it('renders button when not expanded', () => {
    const mockToggle = jest.fn();
    render(<CompactWidget isExpanded={false} onToggle={mockToggle} />);

    const button = screen.getByRole('button', { name: /open ai assistant/i });
    expect(button).toBeInTheDocument();
  });

  it('hides when expanded', () => {
    const mockToggle = jest.fn();
    const { container } = render(<CompactWidget isExpanded={true} onToggle={mockToggle} />);

    expect(container.firstChild).toBeNull();
  });

  it('calls onToggle when clicked', async () => {
    const mockToggle = jest.fn();
    render(<CompactWidget isExpanded={false} onToggle={mockToggle} />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
