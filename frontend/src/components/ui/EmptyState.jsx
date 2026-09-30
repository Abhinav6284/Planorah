export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-6 py-12 text-center">
      {Icon && <Icon size={20} strokeWidth={1.75} className="text-faint" aria-hidden="true" />}
      <div>
        <p className="text-sm font-semibold text-fg">{title}</p>
        {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}
