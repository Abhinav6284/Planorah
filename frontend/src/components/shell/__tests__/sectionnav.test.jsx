import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../../context/ThemeContext';
import SectionNav from '../SectionNav';
import AvatarMenu from '../AvatarMenu';

const at = (path, ui) => render(<ThemeProvider><MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter></ThemeProvider>);
const hrefs = () => within(screen.getByRole('navigation', { name: 'Section' })).getAllByRole('link').map((a) => a.getAttribute('href'));

test('Path section links to roadmaps, exams and projects; exams active on exam pages', () => {
  at('/path/exam/subject/7', <SectionNav />);
  expect(hrefs()).toEqual(['/path', '/path/exam', '/path/projects']);
  expect(screen.getByRole('link', { name: 'Exams' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: 'Roadmaps' })).not.toHaveAttribute('aria-current');
});

test('Today section links to overview, tasks and calendar', () => {
  at('/today/calendar', <SectionNav />);
  expect(hrefs()).toEqual(['/today', '/today/tasks', '/today/calendar']);
  expect(screen.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
});

test('no section nav on Mentor', () => {
  at('/mentor', <SectionNav />);
  expect(screen.queryByRole('navigation', { name: 'Section' })).not.toBeInTheDocument();
});

test('avatar menu reaches ATS and compiled resumes', () => {
  at('/today', <AvatarMenu user={{ first_name: 'A' }} />);
  userEvent.click(screen.getByRole('button', { name: /account menu/i }));
  expect(screen.getByRole('menuitem', { name: 'Find your fit' })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: 'Compiled resumes' })).toBeInTheDocument();
});
