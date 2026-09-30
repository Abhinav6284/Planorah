import { cx } from './cx';

test('joins truthy class names only', () => {
  expect(cx('a', false, null, undefined, '', 'b', 0 && 'c')).toBe('a b');
});
