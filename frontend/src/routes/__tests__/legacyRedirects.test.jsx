import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, generatePath } from 'react-router-dom';
import { LEGACY_REDIRECTS, legacyRedirectRoutes } from '../legacyRedirects';

function Where() {
  const { pathname, hash } = useLocation();
  return <p data-testid="where">{pathname}{hash}</p>;
}

const fill = (pattern) => pattern.replace(/:(\w+)/g, (_, name) => `${name}-1`);

test('old in-app link /roadmap goes to /path', () => {
  expect(LEGACY_REDIRECTS).toContainEqual({ from: '/roadmap', to: '/path' });
});

test.each(LEGACY_REDIRECTS.map((r) => [r.from, r.to]))('%s redirects to %s with params kept', (from, to) => {
  render(
    <MemoryRouter initialEntries={[fill(from)]}>
      <Routes>
        {legacyRedirectRoutes()}
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
  const expected = to.includes('#') ? to : generatePath(to, Object.fromEntries([...from.matchAll(/:(\w+)/g)].map(([, n]) => [n, `${n}-1`])));
  expect(screen.getByTestId('where')).toHaveTextContent(expected);
});
