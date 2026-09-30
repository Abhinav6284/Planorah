import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../../context/ThemeContext';
import Sidebar from '../Sidebar';
import MobileNav from '../MobileNav';
import { NAV_ITEMS, isActive } from '../nav';

jest.mock('../../../utils/auth', () => ({ clearTokens: jest.fn(), logoutBackend: jest.fn(() => Promise.resolve()) }));

const renderAt = (path, ui) => render(
  <ThemeProvider><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></ThemeProvider>,
);

test('nav has exactly Today, Path, Mentor, Progress', () => {
  expect(NAV_ITEMS.map((i) => i.label)).toEqual(['Today', 'Path', 'Mentor', 'Progress']);
});

test('isActive matches nested paths only on segment boundary', () => {
  expect(isActive('/path/roadmap/4', '/path')).toBe(true);
  expect(isActive('/pathfinder', '/path')).toBe(false);
});

test('sidebar marks current section with aria-current', () => {
  renderAt('/path/roadmap/4', <Sidebar user={{ first_name: 'Abhinav', email: 'a@b.c' }} />);
  const nav = screen.getByRole('navigation', { name: 'Main' });
  expect(within(nav).getByRole('link', { name: 'Path' })).toHaveAttribute('aria-current', 'page');
  expect(within(nav).getByRole('link', { name: 'Today' })).not.toHaveAttribute('aria-current');
});

test('avatar menu lists career + account entries and logs out', async () => {
  const { clearTokens } = require('../../../utils/auth');
  const realLocation = window.location;
  delete window.location;
  window.location = { href: '' };
  renderAt('/today', <Sidebar user={{ first_name: 'Abhinav', email: 'a@b.c' }} />);
  userEvent.click(screen.getByRole('button', { name: /account menu/i }));
  const menu = screen.getByRole('menu');
  ['Resume', 'Portfolio', 'LinkedIn check', 'Billing', 'Settings', 'Support', 'Log out'].forEach((label) => {
    expect(within(menu).getByRole('menuitem', { name: new RegExp(label) })).toBeInTheDocument();
  });
  userEvent.click(within(menu).getByRole('menuitem', { name: 'Log out' }));
  await waitFor(() => expect(clearTokens).toHaveBeenCalled());
  expect(window.location.href).toBe('/login');
  window.location = realLocation;
});

test('mobile nav is hidden on desktop and shows 4 tabs', () => {
  renderAt('/today', <MobileNav />);
  const nav = screen.getByRole('navigation', { name: 'Main mobile' });
  expect(nav.className).toMatch(/md:hidden/);
  expect(within(nav).getAllByRole('link')).toHaveLength(4);
});
