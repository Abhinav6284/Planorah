import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cx } from '../../utils/cx';

export function Menu({ trigger, items, align = 'start', side = 'bottom' }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const menuId = useId();
  const navigate = useNavigate();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    listRef.current?.querySelector('[role="menuitem"]')?.focus();
    const onDown = (e) => {
      if (!listRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const select = (item) => {
    close();
    if (item.to) navigate(item.to);
    item.onSelect?.();
  };

  const onKeyDown = (e) => {
    const nodes = [...listRef.current.querySelectorAll('[role="menuitem"]')];
    const i = nodes.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); nodes[(i + 1) % nodes.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); nodes[(i - 1 + nodes.length) % nodes.length].focus(); }
    if (e.key === 'Tab') close(false);
  };

  return (
    <div className="relative">
      {trigger({
        ref: triggerRef,
        onClick: () => setOpen((o) => !o),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
      })}
      {open && (
        <div
          id={menuId}
          ref={listRef}
          role="menu"
          onKeyDown={onKeyDown}
          className={cx(
            'absolute z-50 min-w-[200px] rounded-xl border border-line bg-surface p-1 shadow-pop',
            align === 'end' ? 'right-0' : 'left-0',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {items.map((item, idx) => (item === 'divider'
            ? <div key={`d${idx}`} role="separator" className="my-1 h-px bg-line" />
            : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => select(item)}
                className={cx(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm',
                  'hover:bg-surface-hover focus:bg-surface-hover focus:outline-none',
                  item.danger ? 'text-danger' : 'text-fg',
                )}
              >
                {item.icon && <item.icon size={16} strokeWidth={1.75} className="text-muted" aria-hidden="true" />}
                {item.label}
              </button>
            )))}
        </div>
      )}
    </div>
  );
}
