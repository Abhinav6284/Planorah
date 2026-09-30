import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Dialog, Tabs } from '..';

function MenuHarness({ onLogout = () => {} }) {
  return (
    <MemoryRouter>
      <Menu
        trigger={(p) => <button {...p}>Account</button>}
        items={[{ label: 'Settings', to: '/settings' }, 'divider', { label: 'Log out', onSelect: onLogout, danger: true }]}
      />
      <p>outside</p>
    </MemoryRouter>
  );
}

test('Menu opens, Esc closes and returns focus to trigger', () => {
  render(<MenuHarness />);
  const trigger = screen.getByRole('button', { name: 'Account' });
  userEvent.click(trigger);
  expect(screen.getByRole('menu')).toBeInTheDocument();
  expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('Menu closes on outside click', () => {
  render(<MenuHarness />);
  userEvent.click(screen.getByRole('button', { name: 'Account' }));
  userEvent.click(screen.getByText('outside'));
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('Menu arrow keys move focus and Enter selects', () => {
  const onLogout = jest.fn();
  render(<MenuHarness onLogout={onLogout} />);
  userEvent.click(screen.getByRole('button', { name: 'Account' }));
  userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('menuitem', { name: 'Log out' })).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(onLogout).toHaveBeenCalled();
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('Dialog traps Esc and labels itself', () => {
  const onClose = jest.fn();
  render(<Dialog open onClose={onClose} title="Start focus">Body</Dialog>);
  expect(screen.getByRole('dialog', { name: 'Start focus' })).toBeInTheDocument();
  userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalled();
});

test('Dialog renders nothing when closed', () => {
  render(<Dialog open={false} onClose={() => {}} title="X">Body</Dialog>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

function TabsHarness() {
  const [v, setV] = useState('a');
  return <Tabs tabs={[{ id: 'a', label: 'Roadmaps' }, { id: 'b', label: 'Exams' }]} value={v} onChange={setV} />;
}

test('Tabs select on click and move with arrow keys', () => {
  render(<TabsHarness />);
  const first = screen.getByRole('tab', { name: 'Roadmaps' });
  expect(first).toHaveAttribute('aria-selected', 'true');
  first.focus();
  userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Exams' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: 'Exams' })).toHaveFocus();
});
