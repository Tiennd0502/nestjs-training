import type { ReactNode } from 'react'

export interface TableColumn {
  key: string
  label: ReactNode
  className?: string
}

export interface TableProps<T> {
  columns: TableColumn[]
  data: T[]
  getRowKey: (item: T, index: number) => string
  renderRow: (item: T, index: number) => ReactNode
  emptyMessage?: ReactNode
  tableClassName?: string
  headerClassName?: string
  emptyRowClassName?: string
}

export default function Table<T>({
  columns,
  data,
  getRowKey,
  renderRow,
  emptyMessage = 'No data available.',
  tableClassName = 'w-full min-w-[700px] table-fixed text-left',
  headerClassName = 'bg-surface-container text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase',
  emptyRowClassName = 'px-6 py-12 text-center text-muted-foreground',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className={tableClassName}>
        <thead className={headerClassName}>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className ?? 'px-6 py-4'}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={getRowKey(item, index)}>{renderRow(item, index)}</tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className={emptyRowClassName}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
