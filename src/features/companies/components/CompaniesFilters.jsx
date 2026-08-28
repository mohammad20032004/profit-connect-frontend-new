﻿import { DANGER, RADIUS } from '@/theme/tokens'
import { useState } from 'react'
import { Box, Stack, Typography, Chip, Button, Divider, Collapse } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  BusinessOutlined, FilterListOutlined, Star, Verified, TrendingUpOutlined,
  ExpandMoreOutlined, ExpandLessOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { INDUSTRY_OPTIONS, SORT_OPTIONS, RATING_OPTIONS } from './shared'

function FilterSection({ title, icon, defaultOpen = false, count, children, color }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Box sx={{ mb: 0.5, '&:last-child': { mb: 0 } }}>
      <Button
        fullWidth
        onClick={() => setOpen(!open)}
        sx={{
          justifyContent: 'space-between', textTransform: 'none',
          color: open ? color : 'text.secondary',
          fontWeight: 700, fontSize: '0.78rem', px: 1.5, py: 1, minWidth: 0,
          borderRadius: RADIUS,
          '&:hover': { bgcolor: alpha(color, 0.06) },
          transition: 'all 0.2s ease',
          bgcolor: '#fff'
        }}
        endIcon={
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {count > 0 && (
              <Box sx={{
                width: 20, height: 20, borderRadius: '50%',
                bgcolor: color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', fontWeight: 700,
              }}>
                {count}
              </Box>
            )}
            {open ? <ExpandLessOutlined sx={{ fontSize: 18 }} /> : <ExpandMoreOutlined sx={{ fontSize: 18 }} />}
          </Stack>
        }
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {icon}
          <span>{title}</span>
        </Stack>
      </Button>
      <Collapse in={open}>
        <Stack spacing={0.5} sx={{ pb: 1, px: 1.5, pt: 0.5 }}>
          {children}
        </Stack>
      </Collapse>
    </Box>
  )
}

function FilterChips({ options, selected, onChange, renderLabel }) {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {options.map((opt) => {
        const on = selected.includes(opt)
        return (
          <Chip
            key={opt}
            label={renderLabel ? renderLabel(opt) : opt}
            size="small"
            onClick={() => onChange(opt)}
            sx={{
              height: 28, minHeight: 36, fontSize: '0.7rem', fontWeight: on ? 700 : 600,
              bgcolor: on ? primary : alpha(primary, 0.06),
              color: on ? '#fff' : primary,
              border: on ? 'none' : `1px solid ${alpha(primary, 0.2)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: on ? alpha(primary, 0.85) : alpha(primary, 0.12),
              },
            }}
          />
        )
      })}
    </Stack>
  )
}

export default function CompaniesFilters({
  industries,
  onToggleIndustry,
  minRating,
  setMinRating,
  verifiedOnly,
  setVerifiedOnly,
  sortBy,
  setSortBy,
  clearFilters,
  countActive,
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const primary = theme.palette.primary.main

  return (
    <Stack spacing={0.5}>
      {/* Header */}
      <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: RADIUS,
            bgcolor: alpha(primary, 0.08),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FilterListOutlined sx={{ fontSize: 16, color: primary }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.85rem' }}>
            {t('companies.filtersTitle', 'الفلاتر')}
          </Typography>
          {countActive > 0 && (
            <Box sx={{
              ml: 'auto', px: 1, py: 0.25, borderRadius: RADIUS,
              bgcolor: alpha(primary, 0.08),
            }}>
              <Typography variant="caption" fontWeight={700} color="primary" sx={{ fontSize: '0.65rem' }}>
                {countActive}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {countActive > 0 && (
        <Box sx={{ px: 1.5, pb: 0.5 }}>
          <Button
            size="small"
            onClick={clearFilters}
            sx={{
              textTransform: 'none', fontSize: '0.7rem', color: DANGER,
              fontWeight: 600, minWidth: 0, p: 0.5,
              '&:hover': { bgcolor: alpha(DANGER, 0.06) },
            }}
          >
            {t('companies.clearAllFilters', 'مسح الكل')}
          </Button>
        </Box>
      )}

      <Divider sx={{ mx: 1.5 }} />

      {/* Industry */}
      <FilterSection
        title={t('companies.filterIndustry', 'الصناعة')}
        icon={<BusinessOutlined sx={{ fontSize: 15 }} />}
        count={industries.length}
        defaultOpen
        color={primary}
      >
        <FilterChips options={INDUSTRY_OPTIONS} selected={industries} onChange={onToggleIndustry} color={primary} />
      </FilterSection>

      <Divider sx={{ mx: 1.5 }} />

      {/* Rating */}
      <FilterSection
        title={t('companies.filterRating', 'التقييم')}
        icon={<Star sx={{ fontSize: 15 }} />}
        count={minRating ? 1 : 0}
        color={primary}
      >
        <FilterChips
          options={RATING_OPTIONS}
          selected={[minRating]}
          onChange={(v) => setMinRating(v)}
          color={primary}
          renderLabel={(v) => v === 0 ? t('companies.ratingAny', 'أي تقييم') : `${v}+`}
        />
      </FilterSection>

      <Divider sx={{ mx: 1.5 }} />

      {/* Verified */}
      <FilterSection
        title={t('companies.filterVerified', 'التوثيق')}
        icon={<Verified sx={{ fontSize: 15 }} />}
        count={verifiedOnly ? 1 : 0}
        color={primary}
      >
        <Chip
          label={t('companies.verifiedOnly', 'موثقة فقط')}
          size="small"
          onClick={() => setVerifiedOnly((v) => !v)}
          sx={{
            height: 28, minHeight: 36, fontSize: '0.7rem', fontWeight: verifiedOnly ? 700 : 600,
            bgcolor: verifiedOnly ? primary : alpha(primary, 0.06),
            color: verifiedOnly ? '#fff' : primary,
            border: verifiedOnly ? 'none' : `1px solid ${alpha(primary, 0.2)}`,
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: verifiedOnly ? alpha(primary, 0.85) : alpha(primary, 0.12) },
          }}
        />
      </FilterSection>

      <Divider sx={{ mx: 1.5 }} />

      {/* Sort */}
      <FilterSection
        title={t('companies.sortBy', 'ترتيب حسب')}
        icon={<TrendingUpOutlined sx={{ fontSize: 15 }} />}
        count={0}
        defaultOpen
        color={primary}
      >
        <FilterChips
          options={SORT_OPTIONS}
          selected={[sortBy]}
          onChange={(v) => setSortBy(v)}
          color={primary}
          renderLabel={(v) => t(`companies.${v}`)}
        />
      </FilterSection>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Divider />
      </Box>
    </Stack>
  )
}
