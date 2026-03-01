export type BreadcrumbItem = {
  label: string
  onClick?: () => void
}

type AppBreadcrumbsProps = {
  items: BreadcrumbItem[]
}

export function AppBreadcrumbs({ items }: AppBreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mt-3 text-xs text-slate-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-50"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-medium text-slate-900">{item.label}</span>
            )}
            {index < items.length - 1 ? <span>/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

