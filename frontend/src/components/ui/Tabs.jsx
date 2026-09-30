import { cx } from '../../utils/cx';

export function Tabs({ tabs, value, onChange }) {
  const onKeyDown = (e, index) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    onChange(next.id);
    e.currentTarget.parentElement.querySelector(`[data-tab="${next.id}"]`)?.focus();
  };

  return (
    <div role="tablist" className="flex gap-5 border-b border-line">
      {tabs.map((tab, i) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            data-tab={tab.id}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cx(
              '-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:text-fg',
              selected ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
