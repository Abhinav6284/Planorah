import { useId } from 'react';
import { cx } from '../../utils/cx';

const CONTROL = cx(
  'w-full rounded-md border border-line-strong bg-canvas px-3 text-sm text-fg placeholder:text-faint',
  'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
  'aria-[invalid=true]:border-danger',
);

function FieldShell({ label, hint, error, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[13px] font-medium text-fg">{label}</label>}
      {children}
      {error
        ? <p id={`${id}-msg`} className="text-xs text-danger">{error}</p>
        : hint && <p id={`${id}-msg`} className="text-xs text-faint">{hint}</p>}
    </div>
  );
}

function useFieldProps({ id, hint, error }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return {
    fieldId,
    aria: {
      id: fieldId,
      'aria-invalid': error ? 'true' : undefined,
      'aria-describedby': error || hint ? `${fieldId}-msg` : undefined,
    },
  };
}

export function Input({ label, hint, error, id, className, ...props }) {
  const { fieldId, aria } = useFieldProps({ id, hint, error });
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <input className={cx(CONTROL, 'h-9', className)} {...aria} {...props} />
    </FieldShell>
  );
}

export function Textarea({ label, hint, error, id, className, ...props }) {
  const { fieldId, aria } = useFieldProps({ id, hint, error });
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <textarea className={cx(CONTROL, 'min-h-[88px] py-2', className)} {...aria} {...props} />
    </FieldShell>
  );
}

export function Select({ label, hint, error, id, className, children, ...props }) {
  const { fieldId, aria } = useFieldProps({ id, hint, error });
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <select className={cx(CONTROL, 'h-9', className)} {...aria} {...props}>{children}</select>
    </FieldShell>
  );
}
