export function Skeleton({ className = '' }) {
  return <div className={['skeleton', className].join(' ')} />
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className={`h-3 ${i === 0 ? 'w-32' : i === 1 ? 'w-40' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </>
  )
}
