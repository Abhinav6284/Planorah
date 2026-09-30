import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import RedirectWithParams from '../RedirectWithParams';
import HomeRoute from '../HomeRoute';

jest.mock('../../utils/auth', () => ({ getAccessToken: jest.fn() }));
const { getAccessToken } = require('../../utils/auth');

function Where() {
  const loc = useLocation();
  const params = useParams();
  return <p>{loc.pathname}{loc.hash}|{JSON.stringify(params)}</p>;
}

const at = (url, routes) => render(<MemoryRouter initialEntries={[url]}><Routes>{routes}</Routes></MemoryRouter>);

test('old roadmap deep link keeps its id', () => {
  at('/roadmap/42', [
    <Route key="o" path="/roadmap/:id" element={<RedirectWithParams to="/path/roadmap/:id" />} />,
    <Route key="n" path="/path/roadmap/:id" element={<Where />} />,
  ]);
  expect(screen.getByText('/path/roadmap/42|{"id":"42"}')).toBeInTheDocument();
});

test('multi-param exam link keeps params', () => {
  at('/planora/subject/7/plan', [
    <Route key="o" path="/planora/subject/:subjectId/plan" element={<RedirectWithParams to="/path/exam/subject/:subjectId/plan" />} />,
    <Route key="n" path="/path/exam/subject/:subjectId/plan" element={<Where />} />,
  ]);
  expect(screen.getByText('/path/exam/subject/7/plan|{"subjectId":"7"}')).toBeInTheDocument();
});

test('hash is preserved', () => {
  at('/resume/compiled/3#top', [
    <Route key="o" path="/resume/compiled/:versionId" element={<RedirectWithParams to="/career/resume/compiled/:versionId" />} />,
    <Route key="n" path="/career/resume/compiled/:versionId" element={<Where />} />,
  ]);
  expect(screen.getByText('/career/resume/compiled/3#top|{"versionId":"3"}')).toBeInTheDocument();
});

test('logged-in user on / goes to /today', () => {
  getAccessToken.mockReturnValue('tok');
  at('/', [
    <Route key="h" path="/" element={<HomeRoute><p>landing</p></HomeRoute>} />,
    <Route key="t" path="/today" element={<Where />} />,
  ]);
  expect(screen.getByText(/^\/today/)).toBeInTheDocument();
});

test('logged-out user on / sees landing', () => {
  getAccessToken.mockReturnValue(null);
  at('/', [<Route key="h" path="/" element={<HomeRoute><p>landing</p></HomeRoute>} />]);
  expect(screen.getByText('landing')).toBeInTheDocument();
});
