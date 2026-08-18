import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, Link as RouterLink } from 'react-router-dom'
import {
  Box, Paper, Typography, Stack, Chip, alpha, CircularProgress, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  ToggleButton, ToggleButtonGroup, useMediaQuery, Divider,
} from '@mui/material'
import {
  PaymentsOutlined, VerifiedOutlined, HourglassTopOutlined, AccountBalanceWalletOutlined,
  SearchOutlined, ClearAllOutlined, ReceiptLongOutlined, ArrowUpward, ArrowDownward,
  AttachMoneyOutlined, CalendarMonthOutlined, PersonOutlined, InfoOutlined,
  ArrowForwardOutlined, ArrowBackOutlined, SwapHorizOutlined,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { TextField } from '@/ui'
import { getMyPayments, releasePayment } from '@/services/projectService'
import { getWallet, requestWithdrawal } from '@/services/walletService'
import { formatDate, formatCurrency, COLORS } from '@/features/myProject/[id]/manage/components/manageConstants'

const PAY_STATUS = {
  held: { color: COLORS.warning, labelKey: 'manage.escrowStatus.held' },
  released: { color: COLORS.success, labelKey: 'manage.escrowStatus.released' },
  refunded: { color: COLORS.error, labelKey: 'manage.escrowStatus.refunded' },
  cancelled: { color: '#5C5580', labelKey: 'manage.escrowStatus.cancelled' },
}

const METHODS = [
  { value: 'Visa', color: '#1A1F71', bg: '#EEF1FF', short: 'VISA' },
  { value: 'Mastercard', color: '#EB001B', bg: '#FFF0EE', short: 'MC' },
  { value: 'American Express', color: '#2E77BC', bg: '#EDF6FF', short: 'AMEX' },
  { value: 'PayPal', color: '#003087', bg: '#EEF4FF', short: 'PayPal' },
  { value: 'Apple Pay', color: '#111111', bg: '#F4F4F4', short: 'Apple' },
]

const methodMeta = (value) => METHODS.find((m) => m.value === value) || METHODS[0]

const fullName = (user) => {
  if (!user) return ''
  if (typeof user === 'string') return user
  const prof = user.profile || {}
  return [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.name || user.email || ''
}

const projectTitle = (p) => (p.project && typeof p.project === 'object' ? p.project.title : p.projectTitle) || ''
const projectIdOf = (p) => (p.project && typeof p.project === 'object' ? p.project._id : p.projectId) || ''

const paymentRef = (p) => p.reference || p.referenceNo || p.transactionRef || `#${(p._id || '').slice(-8)}`

export default function PaymentsView() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get('projectId') || ''

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [dir, setDir] = useState('all')
  const [status, setStatus] = useState('all')
  const [releaseTarget, setReleaseTarget] = useState(null)
  const [releasingId, setReleasingId] = useState(null)

  const [balance, setBalance] = useState(0)
  const [walletLoading, setWalletLoading] = useState(true)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [iban, setIban] = useState('')
  const [holderName, setHolderName] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true)
    try {
      const res = await getWallet()
      if (res?.success) setBalance(res.data.wallet?.balance ?? 0)
    } catch { /* ignore */ } finally {
      setWalletLoading(false)
    }
  }, [])

  useEffect(() => { fetchWallet() }, [fetchWallet])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sent, received] = await Promise.all([
        getMyPayments({ direction: 'sent' }),
        getMyPayments({ direction: 'received' }),
      ])
      const merged = [
        ...((sent?.data || []).map((p) => ({ ...p, _dir: 'sent' }))),
        ...((received?.data || []).map((p) => ({ ...p, _dir: 'received' }))),
      ]
      const seen = new Set()
      const unique = []
      merged.forEach((p) => {
        const key = p._id
        if (!seen.has(key)) { seen.add(key); unique.push(p) }
      })
      setPayments(unique)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return payments.filter((p) => {
      if (dir !== 'all' && p._dir !== dir) return false
      if (status !== 'all' && p.status !== status) return false
      if (projectFilter && projectIdOf(p) !== projectFilter) return false
      if (!q) return true
      const haystack = [
        p.note, projectTitle(p), paymentRef(p), fullName(p.payee), fullName(p.payer),
        p.method, String(p.amount), p.status,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [payments, dir, status, projectFilter, query])

  const totals = useMemo(() => filtered.reduce((acc, p) => {
    const a = Number(p.amount) || 0
    acc.total += a
    if (p.status === 'held') acc.held += a
    if (p.status === 'released') acc.released += a
    return acc
  }, { total: 0, held: 0, released: 0 }), [filtered])

  const handleRelease = async (p) => {
    setReleasingId(p._id)
    setError('')
    try {
      const res = await releasePayment(p._id)
      if (res?.success) {
        setReleaseTarget(null)
        fetchAll()
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setReleasingId(null)
    }
  }

  const clearAll = () => {
    setQuery('')
    setDir('all')
    setStatus('all')
    setSearchParams({})
  }

  const openWithdraw = () => {
    setAmount('')
    setBankName('')
    setIban('')
    setHolderName('')
    setError('')
    setSuccess('')
    setWithdrawOpen(true)
  }

  const handleWithdraw = async () => {
    const num = Number(amount)
    if (!amount || isNaN(num) || num <= 0) {
      setError(t('profile.invalidAmount', 'Enter a valid amount'))
      return
    }
    if (num > balance) {
      setError(t('profile.exceedBalance', 'Amount exceeds your available balance'))
      return
    }
    if (!bankName.trim() || !iban.trim() || !holderName.trim()) {
      setError(t('profile.requireBankDetails', 'Bank name, IBAN and holder name are required'))
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await requestWithdrawal({
        amount: num,
        method: 'bank_transfer',
        accountDetails: { bankName: bankName.trim(), iban: iban.trim(), holderName: holderName.trim() },
      })
      if (res?.success) {
        setWithdrawOpen(false)
        setSuccess(t('profile.withdrawSuccess', 'Withdrawal request submitted'))
        fetchWallet()
        setTimeout(() => setSuccess(''), 4000)
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const statItem = (label, value, color, icon) => (
    <Box sx={{ flex: 1, minWidth: 140, textAlign: 'center', p: 1.5, borderRadius: 2.5, bgcolor: alpha(color, 0.06), border: '1px solid', borderColor: alpha(color, 0.2) }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={800} sx={{ color, lineHeight: 1.15 }}>{formatCurrency(value)}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', fontWeight: 700 }}>{label}</Typography>
    </Box>
  )

  const projectChipLabel = (() => {
    if (!projectFilter) return ''
    const found = payments.find((p) => projectIdOf(p) === projectFilter)
    return found ? projectTitle(found) || projectFilter : projectFilter
  })()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1140, mx: 'auto' }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: '0 6px 20px rgba(31,10,59,0.04)' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary,
            }}>
              <PaymentsOutlined />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight="bold">{t('payments.title', 'Payments')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {t('payments.subtitle', 'Track every payment, escrow release and refund across your projects.')}
              </Typography>
            </Box>
            <Chip icon={<ReceiptLongOutlined />} label={t('payments.count', '{{count}} payments', { count: filtered.length })}
              size="small" sx={{ fontWeight: 700, bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary }} />
            <Button variant="contained" color="success" size="small" onClick={openWithdraw} disabled={walletLoading || balance <= 0} startIcon={<SwapHorizOutlined />}>
              {t('profile.withdraw', 'Withdraw')}
            </Button>
          </Stack>

          {projectChipLabel && (
            <Chip
              icon={<ArrowForwardOutlined sx={{ fontSize: 14 }} />}
              label={t('payments.projectFilter', 'Project: {{name}}', { name: projectChipLabel })}
              onDelete={() => setSearchParams({})}
              size="small"
              sx={{ mt: 1.5, fontWeight: 700, bgcolor: alpha(COLORS.navy, 0.08), color: COLORS.navy, maxWidth: '100%' }}
            />
          )}
        </Paper>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
          {statItem(t('payments.total', 'Total payments'), totals.total, COLORS.navy, <AccountBalanceWalletOutlined sx={{ fontSize: 18 }} />)}
          {statItem(t('payments.inEscrow', 'In escrow'), totals.held, COLORS.warning, <HourglassTopOutlined sx={{ fontSize: 18 }} />)}
          {statItem(t('payments.released', 'Released'), totals.released, COLORS.success, <VerifiedOutlined sx={{ fontSize: 18 }} />)}
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'flex-start' }}>
          {/* Sidebar filters */}
          <Paper variant="outlined" sx={{
            p: 2, borderRadius: 2.5,
            width: { xs: '100%', md: 260 }, flexShrink: 0,
            position: { md: 'sticky' }, top: { md: 24 }, zIndex: 2,
          }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                {t('payments.filters', 'Filters')}
              </Typography>
              <TextField
                label={t('payments.searchPlaceholder', 'Search by note, project, reference...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                size="small"
                slotProps={{
                  input: { startAdornment: <SearchOutlined sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} /> },
                }}
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 700 }}>
                  {t('payments.direction', 'Direction')}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={dir}
                  onChange={(_, v) => v && setDir(v)}
                  aria-label={t('payments.direction', 'Direction')}
                  sx={{ width: '100%' }}
                >
                  <ToggleButton value="all" sx={{ flex: 1 }}>{t('payments.all', 'All')}</ToggleButton>
                  <ToggleButton value="sent" sx={{ flex: 1 }}>{t('payments.sent', 'Sent')}</ToggleButton>
                  <ToggleButton value="received" sx={{ flex: 1 }}>{t('payments.received', 'Received')}</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <FormControl size="small" fullWidth>
                <InputLabel>{t('payments.status', 'Status')}</InputLabel>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} label={t('payments.status', 'Status')}>
                  <MenuItem value="all">{t('payments.statusAll', 'All statuses')}</MenuItem>
                  <MenuItem value="held">{t('manage.escrowStatus.held', 'Held')}</MenuItem>
                  <MenuItem value="released">{t('manage.escrowStatus.released', 'Released')}</MenuItem>
                  <MenuItem value="refunded">{t('manage.escrowStatus.refunded', 'Refunded')}</MenuItem>
                  <MenuItem value="cancelled">{t('manage.escrowStatus.cancelled', 'Cancelled')}</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" size="small" startIcon={<ClearAllOutlined />} onClick={clearAll} fullWidth sx={{ height: 40 }}>
                {t('payments.clearFilters', 'Clear filters')}
              </Button>
            </Stack>
          </Paper>

          <Box sx={{ flex: 1, minWidth: 0 }}>

        {success && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1.25, p: 1.5, borderRadius: 1.5, bgcolor: alpha('#16A34A', 0.08), textAlign: 'center', fontWeight: 600, mb: 2 }}>
            {success}
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error.main" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(COLORS.error, 0.08), textAlign: 'center', fontWeight: 600, mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={24} />
            <Typography variant="caption" color="text.secondary">...</Typography>
          </Stack>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, borderStyle: 'dashed' }}>
            <PaymentsOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
            <Typography color="text.secondary">
              {payments.length === 0 ? t('payments.noPayments', 'No payments yet') : t('payments.noResults', 'No payments match your filters')}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((p) => {
              const cfg = PAY_STATUS[p.status] || PAY_STATUS.held
              const mm = methodMeta(p.method)
              const isSent = p._dir === 'sent'
              const isHeld = p.status === 'held'
              return (
                <Paper key={p._id} variant="outlined" sx={{
                  p: 2, borderRadius: 2.5,
                  borderColor: isHeld ? alpha(cfg.color, 0.4) : p.status === 'released' ? alpha(COLORS.success, 0.35) : 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': { boxShadow: '0 6px 20px rgba(31,10,59,0.08)', borderColor: alpha(theme.palette.primary.main, 0.3) },
                }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(cfg.color, 0.1), color: cfg.color,
                    }}>
                      {isHeld ? <HourglassTopOutlined /> : p.status === 'released' ? <VerifiedOutlined /> : <ReceiptLongOutlined />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography variant="body1" fontWeight={700}>{p.note || t('payments.payment', 'Payment')}</Typography>
                        <Chip label={t(`manage.escrowStatus.${p.status}`, p.status)} size="small"
                          sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, color: cfg.color, bgcolor: alpha(cfg.color, 0.1) }} />
                        <Chip label={isSent ? t('payments.sent', 'Sent') : t('payments.received', 'Received')} size="small"
                          sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, color: isSent ? COLORS.navy : COLORS.purple, bgcolor: alpha(isSent ? COLORS.navy : COLORS.purple, 0.1) }}
                          icon={isSent ? <ArrowUpward sx={{ fontSize: 12 }} /> : <ArrowDownward sx={{ fontSize: 12 }} />} />
                      </Stack>

                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                        {isSent
                          ? <ArrowForwardOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                          : <ArrowBackOutlined sx={{ fontSize: 14, color: '#5C5580' }} />}
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
                          {projectTitle(p) || t('payments.untitledProject', 'Untitled project')}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <AttachMoneyOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body1" fontWeight={800} color="primary.main">{formatCurrency(p.amount)}</Typography>
                        </Stack>
                        {p.status === 'released' && (Number(p.netAmount) > 0 || Number(p.fee) > 0) && (
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <VerifiedOutlined sx={{ fontSize: 15, color: COLORS.success }} />
                            <Typography variant="caption" color="success.main" fontWeight={700}>
                              {t('payments.net', 'Net')}: {formatCurrency(p.netAmount)}
                              {Number(p.fee) > 0 && ` • ${t('payments.fee', 'Fee')}: ${formatCurrency(p.fee)}`}
                            </Typography>
                          </Stack>
                        )}
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <Box sx={{
                            minWidth: 16, px: 0.5, py: 0.2, borderRadius: 0.8,
                            color: mm.color, bgcolor: alpha(mm.color, 0.1),
                            fontSize: '0.6rem', fontWeight: 800, textAlign: 'center',
                          }}>
                            {mm.value === 'Apple Pay' ? 'AP' : mm.short}
                          </Box>
                          <Typography variant="caption" color="text.secondary">{t(`manage.method.${p.method}`, p.method)}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <CalendarMonthOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                          <Typography variant="caption" color="text.secondary">{formatDate(p.createdAt, lang)}</Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1.5} sx={{ mt: 0.75, flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <ReceiptLongOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                          <Typography variant="caption" color="text.secondary" dir="ltr">{paymentRef(p)}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <PersonOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                          <Typography variant="caption" color="text.secondary">
                            {isSent
                              ? `${t('payments.payee', 'Payee')}: ${fullName(p.payee) || t('payments.you', 'You')}`
                              : `${t('payments.payer', 'Payer')}: ${fullName(p.payer) || t('payments.you', 'You')}`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    {isHeld && isSent && (
                      <Tooltip title={t('manage.releasePay', 'Release to Wallet')}>
                        <span>
                          <IconButton size="small" color="success" onClick={() => setReleaseTarget(p)} disabled={releasingId === p._id}>
                            {releasingId === p._id ? <CircularProgress size={16} /> : <VerifiedOutlined sx={{ fontSize: 19 }} />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        )}

        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <InfoOutlined sx={{ fontSize: 14 }} />
          {t('payments.hint', 'Payments you receive are held in escrow until the payer releases them. A platform fee may be deducted from the released amount.')}
        </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Release confirmation dialog */}
      <Dialog open={!!releaseTarget} onClose={() => { if (!releasingId) setReleaseTarget(null) }} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <VerifiedOutlined sx={{ color: COLORS.success }} />
            <Typography variant="h6" fontWeight={800}>{t('manage.releaseTitle', 'Release Payment')}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {releaseTarget && (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{
                p: 2, borderRadius: 2, bgcolor: alpha(COLORS.success, 0.05), borderColor: alpha(COLORS.success, 0.25),
                textAlign: 'center',
              }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>{releaseTarget.note || t('payments.payment', 'Payment')}</Typography>
                <Typography variant="h6" fontWeight={800} color="success.main">{formatCurrency(releaseTarget.amount)}</Typography>
              </Paper>
              <Box sx={{
                p: 1.75, borderRadius: 2, border: '1px dashed',
                borderColor: alpha(COLORS.warning, 0.5), bgcolor: alpha(COLORS.warning, 0.05),
                display: 'flex', alignItems: 'flex-start', gap: 1,
              }}>
                <InfoOutlined sx={{ fontSize: 18, color: COLORS.warning, mt: 0.2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {t('manage.releaseConfirm', 'Release this payment to the recipient\'s wallet? The platform fee will be deducted.')}
                </Typography>
              </Box>
            </Stack>
          )}
          {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1.5 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setReleaseTarget(null)} disabled={!!releasingId}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="success" onClick={() => handleRelease(releaseTarget)} disabled={!releaseTarget || !!releasingId} startIcon={<VerifiedOutlined />}>
            {t('manage.confirmRelease', 'Release')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 800 }}>{t('profile.withdrawTitle', 'Withdraw Funds')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#16A34A', 0.06), border: '1px solid', borderColor: alpha('#16A34A', 0.2), textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{t('profile.availableBalance', 'Available balance')}</Typography>
              <Typography variant="h6" fontWeight={800} color="success.main">{formatCurrency(balance)}</Typography>
            </Box>
            <TextField label={t('profile.withdrawAmount', 'Amount')} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} inputProps={{ min: 0 }} />
            <TextField label={t('profile.withdrawMethod', 'Withdrawal Method')} value={t('profile.bankTransfer', 'Bank Transfer')} disabled />
            <TextField label={t('profile.bankName', 'Bank Name')} value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Al Rajhi Bank" />
            <TextField label={t('profile.iban', 'IBAN')} value={iban} onChange={(e) => setIban(e.target.value)} placeholder="SA00 0000 0000 0000 0000 0000" dir="ltr" />
            <TextField label={t('profile.holderName', 'Account Holder')} value={holderName} onChange={(e) => setHolderName(e.target.value)} />
            <Typography variant="caption" color="text.secondary" sx={{ bgcolor: alpha('#D97706', 0.07), p: 1, borderRadius: 1.5, border: '1px dashed', borderColor: alpha('#D97706', 0.35), lineHeight: 1.6 }}>
              {t('profile.withdrawNote', 'Your request will be reviewed by the support team. The amount moves to "Held" until approval.')}
            </Typography>
          </Stack>
          {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1.5 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setWithdrawOpen(false)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="success" onClick={handleWithdraw} disabled={saving} startIcon={<SwapHorizOutlined />}>
            {t('profile.confirmWithdraw', 'Submit Request')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
