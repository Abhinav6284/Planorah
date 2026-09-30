import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Button, Input, ListRow, EmptyState, Badge } from '..';

const inRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

test('Button renders a link when `to` is given', () => {
  inRouter(<Button to="/today">Go</Button>);
  expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/today');
});

test('Button is disabled and busy while loading', () => {
  inRouter(<Button loading>Save</Button>);
  const btn = screen.getByRole('button', { name: /save/i });
  expect(btn).toBeDisabled();
  expect(btn).toHaveAttribute('aria-busy', 'true');
});

test('Button primary uses accent fill', () => {
  inRouter(<Button>Start</Button>);
  expect(screen.getByRole('button', { name: 'Start' }).className).toMatch(/bg-accent/);
});

test('Input links label and marks errors', () => {
  inRouter(<Input label="Email" error="Required" />);
  const input = screen.getByLabelText('Email');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Required')).toHaveAttribute('id', input.getAttribute('aria-describedby'));
});

test('ListRow with onClick is a button and fires', () => {
  const onClick = jest.fn();
  inRouter(<ListRow title="REST APIs" meta="40m" onClick={onClick} />);
  userEvent.click(screen.getByRole('button', { name: /rest apis/i }));
  expect(onClick).toHaveBeenCalled();
});

test('EmptyState renders title, text and action', () => {
  inRouter(<EmptyState title="No tasks" text="Create a path" action={<Button>New path</Button>} />);
  expect(screen.getByText('No tasks')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'New path' })).toBeInTheDocument();
});

test('Badge accent tone uses accent-text', () => {
  inRouter(<Badge tone="accent">Strong</Badge>);
  expect(screen.getByText('Strong').className).toMatch(/text-accent-text/);
});
