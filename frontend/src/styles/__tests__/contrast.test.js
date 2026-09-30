import fs from 'fs';
import path from 'path';

// Parses tokens.css and checks WCAG contrast for text and focus tokens in both themes.
const css = fs.readFileSync(path.join(__dirname, '..', 'tokens.css'), 'utf8');
const block = (selector) => {
  const body = css.split(selector)[1].split('}')[0];
  return Object.fromEntries([...body.matchAll(/--(p-[\w-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]));
};
const dark = block(':root {');
const light = { ...dark, ...block('html.light {') };

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe.each([['dark', dark], ['light', light]])('%s theme', (_, t) => {
  const backgrounds = ['p-bg', 'p-bg-subtle', 'p-surface'];
  test.each(['p-text', 'p-text-muted', 'p-text-faint', 'p-accent-text'])('%s is readable (>= 4.5:1)', (fg) => {
    backgrounds.forEach((bg) => expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5));
  });
  test('focus ring is visible (>= 3:1)', () => {
    backgrounds.forEach((bg) => expect(ratio(t['p-focus'], t[bg])).toBeGreaterThanOrEqual(3));
  });
});
