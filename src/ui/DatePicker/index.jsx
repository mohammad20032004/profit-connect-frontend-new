import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  IconButton,
  TextField as MuiTextField,
  Popover,
  Stack,
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const monthsAr = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const daysAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

function DatePicker({
  label = 'Select date',
  value,
  onChange,
  minDate,
  maxDate,
  format = 'YYYY-MM-DD',
  sx,
}) {
  const isAr = document.documentElement.lang === 'ar'
  const monthNames = isAr ? monthsAr : months
  const dayNames = isAr ? daysAr : days

  const [anchorEl, setAnchorEl] = useState(null)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  const [selected, setSelected] = useState(value ? new Date(value) : null)
  const inputRef = useRef()

  useEffect(() => {
    if (value) setSelected(new Date(value))
  }, [value])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

  const formatDate = (d) => {
    const yy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    if (format === 'DD/MM/YYYY') return `${dd}/${mm}/${yy}`
    if (format === 'MM/DD/YYYY') return `${mm}/${dd}/${yy}`
    return `${yy}-${mm}-${dd}`
  }

  const handlePrev = () => setViewDate(new Date(year, month - 1, 1))
  const handleNext = () => setViewDate(new Date(year, month + 1, 1))

  const handleDayClick = (day) => {
    const d = new Date(year, month, day)
    setSelected(d)
    setAnchorEl(null)
    if (onChange) onChange(formatDate(d))
  }

  const isDisabled = (day) => {
    const d = new Date(year, month, day)
    if (minDate && d < new Date(minDate)) return true
    if (maxDate && d > new Date(maxDate)) return true
    return false
  }

  const open = Boolean(anchorEl)

  const calCells = []
  for (let i = 0; i < firstDay; i++) {
    calCells.push(<Box key={`empty-${i}`} sx={{ width: 36, height: 36 }} />)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${month}-${d}`
    const isToday = dateStr === todayStr
    const isSelected = selected && selected.getDate() === d &&
      selected.getMonth() === month && selected.getFullYear() === year
    calCells.push(
      <Box
        key={d}
        onClick={() => !isDisabled(d) && handleDayClick(d)}
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          cursor: isDisabled(d) ? 'not-allowed' : 'pointer',
          backgroundColor: isSelected ? '#3D1C6E' : isToday ? 'rgba(61, 28, 110, 0.08)' : 'transparent',
          color: isSelected ? '#fff' : isDisabled(d) ? '#D4CFE0' : '#1F0A3B',
          fontWeight: isToday || isSelected ? 600 : 400,
          fontSize: '0.85rem',
          '&:hover': !isDisabled(d) && !isSelected ? { backgroundColor: 'rgba(61, 28, 110, 0.06)' } : {},
          transition: 'all 0.15s ease',
        }}
      >
        {d}
      </Box>
    )
  }

  const displayValue = selected ? formatDate(selected) : ''

  return (
    <>
      <MuiTextField
        ref={inputRef}
        label={label}
        value={displayValue}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <CalendarTodayIcon sx={{ fontSize: 18, color: '#8F86AD', cursor: 'pointer' }} />
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: '#fff',
            cursor: 'pointer',
            '& fieldset': { borderColor: 'rgba(31, 10, 59, 0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(61, 28, 110, 0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#3D1C6E', borderWidth: 2 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#3D1C6E' },
          ...sx,
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            border: '1px solid rgba(31, 10, 59, 0.08)',
            boxShadow: '0 18px 40px rgba(31, 10, 59, 0.08)',
            overflow: 'visible',
          },
        }}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <IconButton size="small" onClick={handlePrev}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {monthNames[month]} {year}
            </Typography>
            <IconButton size="small" onClick={handleNext}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: '2px', justifyContent: 'center' }}>
            {dayNames.map((d) => (
              <Box
                key={d}
                sx={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 600, color: '#8F86AD',
                }}
              >
                {d}
              </Box>
            ))}
            {calCells}
          </Box>
        </Box>
      </Popover>
    </>
  )
}

function DateRange({ labelStart = 'Start date', labelEnd = 'End date', value, onChange, sx }) {
  const [start, setStart] = useState(value?.start || '')
  const [end, setEnd] = useState(value?.end || '')

  const handleStart = (v) => {
    setStart(v)
    if (onChange) onChange({ start: v, end })
  }

  const handleEnd = (v) => {
    setEnd(v)
    if (onChange) onChange({ start, end: v })
  }

  return (
    <Stack direction="row" spacing={2} sx={sx}>
      <DatePicker label={labelStart} value={start} onChange={handleStart} />
      <DatePicker label={labelEnd} value={end} onChange={handleEnd} minDate={start} />
    </Stack>
  )
}

export { DatePicker, DateRange }
export default DatePicker
