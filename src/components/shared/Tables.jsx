import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Trash2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Buttons'
import { NoSearchResults } from './EmptyStates'

export function ReusableTable({ 
  columns = [], 
  data = [], 
  selectable = false, 
  onSelectionChange,
  actions = [], 
  onView,
  onDelete
}) {
  const [selectedRows, setSelectedRows] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Toggle selection for a single row
  const toggleRow = (index) => {
    const updated = { ...selectedRows, [index]: !selectedRows[index] }
    setSelectedRows(updated)
    if (onSelectionChange) {
      const selectedItems = data.filter((_, idx) => updated[idx])
      onSelectionChange(selectedItems)
    }
  }

  // Toggle selection for all rows
  const toggleAll = () => {
    const allSelected = Object.keys(selectedRows).length === data.length
    const updated = {}
    if (!allSelected) {
      data.forEach((_, idx) => { updated[idx] = true })
    }
    setSelectedRows(updated)
    if (onSelectionChange) {
      onSelectionChange(!allSelected ? data : [])
    }
  }

  // Handle Sort
  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Sorted Data calculation
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [data, sortConfig])

  const allChecked = data.length > 0 && Object.keys(selectedRows).length === data.length

  if (data.length === 0) {
    return <NoSearchResults />
  }

  return (
    <div className="w-full space-y-4">
      {/* Bulk Actions Panel */}
      {selectable && Object.keys(selectedRows).length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-between animate-in slide-in-from-top-1 duration-200">
          <span className="text-xs font-semibold text-primary">
            {Object.keys(selectedRows).length} items selected
          </span>
          <div className="flex gap-2">
            {actions.map((act) => (
              <Button 
                key={act.label} 
                variant="outline" 
                size="sm" 
                onClick={() => act.onClick && act.onClick(data.filter((_, idx) => selectedRows[idx]))}
              >
                {act.label}
              </Button>
            ))}
            {onDelete && (
              <Button 
                variant="danger" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => onDelete(data.filter((_, idx) => selectedRows[idx]))}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Grid container */}
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-foreground">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground select-none">
              {selectable && (
                <th className="px-4 py-3.5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={allChecked} 
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th 
                  key={col.header} 
                  onClick={() => col.sortable && requestSort(col.accessor)}
                  className={cn(
                    "px-4 py-3.5",
                    col.sortable && "cursor-pointer hover:bg-muted/80 transition-colors"
                  )}
                >
                  <div className="flex items-center gap-1.5 capitalize">
                    {col.header}
                    {col.sortable && sortConfig.key === col.accessor && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
              {(onView || onDelete) && <th className="px-4 py-3.5 w-24 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => {
              const isRowChecked = !!selectedRows[rowIndex]
              return (
                <tr 
                  key={rowIndex} 
                  className={cn(
                    "border-b border-border last:border-none transition-colors hover:bg-muted/20",
                    isRowChecked && "bg-primary/5"
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        checked={isRowChecked} 
                        onChange={() => toggleRow(rowIndex)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, colIndex) => {
                    const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]
                    return (
                      <td key={colIndex} className="px-4 py-3 text-sm text-foreground">
                        {value}
                      </td>
                    )
                  })}
                  {(onView || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onView && (
                          <button 
                            onClick={() => onView(row)}
                            className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-muted cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete([row])}
                            className="h-7 w-7 inline-flex items-center justify-center rounded border border-border hover:bg-destructive/10 text-destructive hover:text-destructive cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TablePagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-4 mt-4 select-none">
      <span className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="flex items-center gap-1"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
