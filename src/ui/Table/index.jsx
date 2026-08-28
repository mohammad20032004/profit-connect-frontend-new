﻿import { RADIUS } from '@/theme/tokens'
import { useState, useMemo } from 'react'
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

function Table({
  columns = [],
  rows = [],
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  total: controlledTotal,
  onPageChange,
  onRowsPerPageChange,
  selectable = false,
  selected = [],
  onSelectionChange,
  sortable = true,
  initialSortBy,
  initialSortDir = 'asc',
  loading = false,
  emptyMessage = 'No data available',
  sx,
}) {
  const [internalPage, setInternalPage] = useState(0)
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState(initialSortBy || '')
  const [sortDir, setSortDir] = useState(initialSortDir)
  const [internalSelected, setInternalSelected] = useState([])

  const isControlled = controlledPage !== undefined
  const page = isControlled ? controlledPage : internalPage
  const rowsPerPage = isControlled ? controlledRowsPerPage || 10 : internalRowsPerPage
  const total = isControlled ? controlledTotal || rows.length : rows.length
  const selectedItems = isControlled ? selected : internalSelected

  const handleSort = (col) => {
    if (!sortable) return
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const sortedRows = useMemo(() => {
    if (!sortBy) return rows
    return [...rows].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal)
        return sortDir === 'asc' ? cmp : -cmp
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [rows, sortBy, sortDir])

  const paginatedRows = useMemo(() => {
    if (isControlled) return sortedRows
    const start = page * rowsPerPage
    return sortedRows.slice(start, start + rowsPerPage)
  }, [sortedRows, page, rowsPerPage, isControlled])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = paginatedRows.map((_, i) => page * rowsPerPage + i)
      const newSelected = isControlled ? all : all
      if (isControlled && onSelectionChange) onSelectionChange(newSelected)
      else setInternalSelected(newSelected)
    } else {
      if (isControlled && onSelectionChange) onSelectionChange([])
      else setInternalSelected([])
    }
  }

  const handleSelect = (index) => {
    const current = [...selectedItems]
    const idx = current.indexOf(index)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(index)
    if (isControlled && onSelectionChange) onSelectionChange(current)
    else setInternalSelected(current)
  }

  const handlePageChange = (_, newPage) => {
    if (isControlled && onPageChange) onPageChange(newPage)
    else setInternalPage(newPage)
  }

  const handleRowsPerPageChange = (e) => {
    const val = parseInt(e.target.value, 10)
    if (isControlled && onRowsPerPageChange) onRowsPerPageChange(val)
    else {
      setInternalRowsPerPage(val)
      setInternalPage(0)
    }
  }

  return (
    <Paper
      sx={(theme) => ({
        borderRadius: RADIUS,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        overflow: 'hidden',
        ...sx,
      })}
    >
      <TableContainer sx={{ overflowX: 'auto' }}>
        <MuiTable aria-label="Data table">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={paginatedRows.length > 0 && selectedItems.length === paginatedRows.length}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < paginatedRows.length}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'Select all rows' }}
                    sx={{ color: alpha('#000', 0.2), '&.Mui-checked': { color: 'primary.main' } }}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || 'start'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: (theme) => `2px solid ${theme.palette.divider}`,
                    py: 2,
                  }}
                >
                  {sortable && col.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === col.key}
                      direction={sortBy === col.key ? sortDir : 'asc'}
                      onClick={() => handleSort(col.key)}
                      sx={{
                        '&.Mui-active': { color: 'primary.main', fontWeight: 700 },
                        '& .MuiTableSortLabel-icon': { color: 'primary.main !important' },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }} role="status" aria-live="polite">
                    {loading && <CircularProgress size={20} />}
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                      {loading ? 'Loading...' : emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rowIndex) => {
                const globalIndex = page * rowsPerPage + rowIndex
                const isSelected = selectedItems.includes(globalIndex)
                return (
                  <TableRow
                    key={row.id || rowIndex}
                    hover
                    selected={isSelected}
                    onClick={selectable ? () => handleSelect(globalIndex) : undefined}
                    onKeyDown={selectable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(globalIndex); } } : undefined}
                    tabIndex={selectable ? 0 : undefined}
                    role={selectable ? 'row' : undefined}
                    sx={{
                      cursor: selectable ? 'pointer' : 'default',
                      '&:last-child td': { borderBottom: 'none' },
                      '&.Mui-selected': { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04) },
                      '&:hover': { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02) },
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          inputProps={{ 'aria-label': `Select row ${rowIndex + 1}` }}
                          sx={{ color: alpha('#000', 0.2), '&.Mui-checked': { color: 'primary.main' } }}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => {
                      const cellValue = col.render ? col.render(row) : row[col.key]
                      return (
                        <TableCell
                          key={col.key}
                          align={col.align || 'start'}
                          sx={{
                            fontSize: '0.88rem',
                            color: 'text.primary',
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                            py: 1.8,
                          }}
                        >
                          {cellValue}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={(theme) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
          '.MuiTablePagination-toolbar': { minHeight: 52 },
          '.MuiTablePagination-select': { borderRadius: RADIUS },
        })}
      />
    </Paper>
  )
}

function StatusChip({ label, color = 'default' }) {
  const colorMap = {
    success: { bg: 'success.light', text: 'success.dark' },
    error: { bg: 'error.light', text: 'error.dark' },
    warning: { bg: 'warning.light', text: 'warning.dark' },
    info: { bg: 'info.light', text: 'info.dark' },
    default: { bg: 'grey.100', text: 'text.secondary' },
  }
  const c = colorMap[color] || colorMap.default
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: c.bg,
        color: c.text,
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: 20,
      }}
    />
  )
}

function TableActions({ children, sx }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, ...sx }}>
      {children}
    </Box>
  )
}

export { Table, StatusChip, TableActions }
export default Table
