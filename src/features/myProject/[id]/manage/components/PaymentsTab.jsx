import { useState, useEffect, useCallback } from 'react'
import {
  Box, Paper, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, useMediaQuery, alpha, Avatar, CircularProgress, Snackbar, Alert,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AddOutlined, PaymentsOutlined, DeleteOutlined, CheckCircleOutlineOutlined,
  AttachMoneyOutlined, CalendarMonthOutlined, ReceiptLongOutlined, SavingsOutlined,
  LockOutlined, Apple, InfoOutlined, PersonOutlined, VerifiedOutlined, HourglassTopOutlined,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { TextField } from '@/ui'
import { depositPayment, getProposals, getMyPayments, releasePayment } from '@/services/projectService'
import { SectionHeader, StatCard } from './ManageShared'
import { COLORS, formatDate, formatCurrency } from './manageConstants'
import { scaleIn, staggerContainer } from '@/utils/animations'

const ESCROW_STATUS = {
  held: { color: COLORS.warning, labelKey: 'manage.escrowStatus.held', icon: <HourglassTopOutlined /> },
  released: { color: COLORS.success, labelKey: 'manage.escrowStatus.released', icon: <VerifiedOutlined /> },
  refunded: { color: COLORS.error, labelKey: 'manage.escrowStatus.refunded', icon: <ReceiptLongOutlined /> },
  cancelled: { color: '#5C5580', labelKey: 'manage.escrowStatus.cancelled', icon: <DeleteOutlined /> },
}

const METHODS = [
  { value: 'Visa', color: '#1A1F71', bg: '#EEF1FF', short: 'VISA' },
  { value: 'Mastercard', color: '#EB001B', bg: '#FFF0EE', short: 'MC' },
  { value: 'American Express', color: '#2E77BC', bg: '#EDF6FF', short: 'AMEX' },
  { value: 'PayPal', color: '#003087', bg: '#EEF4FF', short: 'PayPal' },
  { value: 'Apple Pay', color: '#111111', bg: '#F4F4F4', short: 'Apple' },
  { value: 'ShamCash', color: '#1B8C5A', bg: '#EEFBF3', short: 'ShamCash', logo: '/logo/shamcash.jpg' },
]

const CARD_METHODS = ['Visa', 'Mastercard', 'American Express']

const methodMeta = (value) => METHODS.find((m) => m.value === value) || METHODS[0]

const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

const sameProject = (p, id) => {
  const proj = p.project || {}
  const pid = p.projectId || proj._id || proj.id || proj
  return pid === id || String(pid) === String(id)
}

const paymentRef = (p) => p.reference || p.referenceNo || p.transactionRef || `#${(p._id || '').slice(-8)}`

const fullName = (user) => {
  if (!user) return ''
  if (typeof user === 'string') return user
  const prof = user.profile || {}
  return [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.name || user.email || ''
}

const payeeName = (p) => fullName(p.payee)

function MethodCard({ m, selected, onSelect }) {
  const { t } = useTranslation()
  return (
    <Box
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
      sx={{
        flex: '1 1 0', minWidth: 96, cursor: 'pointer',
        borderRadius: 1.5, p: 1.5, textAlign: 'center',
        border: '2px solid', userSelect: 'none',
        borderColor: selected ? m.color : 'divider',
        bgcolor: selected ? m.bg : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: m.color, transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
      }}
    >
      <Box sx={{ height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, fontWeight: 800, fontSize: '0.9rem', letterSpacing: 1 }}>
        {m.value === 'Apple Pay' ? <Apple sx={{ fontSize: 24 }} /> : m.logo
          ? <Box component="img" src={m.logo} alt={m.short} sx={{ width: 24, height: 24, borderRadius: 0.5, objectFit: 'cover' }} />
          : m.short}
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: selected ? 700 : 500, color: selected ? m.color : 'text.secondary' }}>
        {t(`manage.method.${m.value}`)}
      </Typography>
    </Box>
  )
}

function CardPreview({ form, currency }) {
  const m = methodMeta(form.method)
  return (
    <Box sx={{
      borderRadius: 1.5, p: 2.5, color: '#fff',
      background: `linear-gradient(135deg, ${m.color} 0%, ${alpha(m.color, 0.72)} 100%)`,
      boxShadow: `0 10px 24px ${alpha(m.color, 0.35)}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{ position: 'absolute', top: -30, right: -20, width: 110, height: 110, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)' }} />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600 }}>
          {form.method === 'American Express' ? 'AMERICAN EXPRESS' : m.short}
        </Typography>
        <PaymentsOutlined sx={{ fontSize: 22, opacity: 0.9 }} />
      </Stack>
      <Typography variant="h6" fontWeight={800} letterSpacing={1.5} dir="ltr" sx={{ textAlign: 'left' }}>
        {form.cardNumber || 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢'}
      </Typography>
      <Stack direction="row" sx={{ mt: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.75, display: 'block' }}>CARD HOLDER</Typography>
          <Typography variant="body2" fontWeight={600} dir="ltr">FREELANCER</Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.75, display: 'block' }}>EXPIRY</Typography>
          <Typography variant="body2" fontWeight={600} dir="ltr">{form.cardExpiry || 'MM/YY'}</Typography>
        </Box>
        <Typography variant="h6" fontWeight={800}>{formatCurrency(Number(form.amount) || 0, currency)}</Typography>
      </Stack>
    </Box>
  )
}

export default function PaymentsTab({ id, overview, onChanged }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const currency = overview.budget?.currency || 'USD'

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', dueDate: '', method: 'Visa', note: '', cardNumber: '', cardExpiry: '', cardCvv: '', shamcashReceiver: '', shamcashPersonal: '', shamcashPhoto: null })
  const [saving, setSaving] = useState(false)
  const [releasingId, setReleasingId] = useState(null)
  const [releaseTarget, setReleaseTarget] = useState(null)
  const [, setError] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' })
  const [accepted, setAccepted] = useState(null)
  const [loadingPayee, setLoadingPayee] = useState(true)
  const [payeeId, setPayeeId] = useState(null)

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = useCallback(() => {
    setLoading(true)
    getMyPayments({ direction: 'sent' })
      .then((res) => {
        const list = res?.data || []
        setInvoices(Array.isArray(list) ? list.filter((p) => sameProject(p, id)) : [])
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    let active = true
    getProposals(id)
      .then((res) => {
        if (!active) return
        const list = res?.data || []
        setAccepted(Array.isArray(list) ? list.find((p) => p.status === 'Accepted') || null : null)
      })
      .catch(() => { if (active) setAccepted(null) })
      .finally(() => { if (active) setLoadingPayee(false) })
    return () => { active = false }
  }, [id])

  const teamMembers = (overview.team || [])
    .filter((m) => m.status !== 'Removed' && (m.freelancer?._id || m.freelancerId))
    .map((m) => {
      const user = m.freelancer || {}
      const prof = user.profile || {}
      const name = [prof.firstName, prof.lastName].filter(Boolean).join(' ')
        || user.email || user.name || t('manage.unknownMember', 'Member')
      return {
        id: user._id || m.freelancerId,
        proposalId: m.proposalId || null,
        name,
        avatar: prof.avatar,
        role: m.role || '',
      }
    })

  const acceptedUserId = accepted?.freelancer?._id || accepted?.userId?._id || accepted?.userId || null
  const defaultPayee = teamMembers.find((m) => m.id === acceptedUserId) || teamMembers[0] || null
  const selectedPayee = teamMembers.find((m) => m.id === payeeId) || defaultPayee

  const isCard = CARD_METHODS.includes(form.method)

  const total = invoices.reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const heldTotal = invoices.filter((p) => p.status === 'held').reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const releasedTotal = invoices.filter((p) => p.status === 'released').reduce((s, p) => s + (Number(p.amount) || 0), 0)

  const openAdd = () => {
    setOpen(true)
    setForm({ title: '', amount: '', dueDate: '', method: 'Visa', note: '', cardNumber: '', cardExpiry: '', cardCvv: '', shamcashReceiver: '', shamcashPersonal: '', shamcashPhoto: null })
    setError('')
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }))

  const setCardNumber = (e) => setForm((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))
  const setCardExpiry = (e) => setForm((prev) => ({ ...prev, cardExpiry: formatExpiry(e.target.value) }))
  const setCardCvv = (e) => setForm((prev) => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))

  const handleAdd = async () => {
    if (!form.amount) {
      setError(t('manage.requireAmount', 'Amount is required'))
      return
    }
    if (isCard && !form.cardNumber) {
      setError(t('manage.requireCard', 'Card number is required'))
      return
    }
    if (form.method === 'ShamCash') {
      if (!form.shamcashReceiver) {
        setError(t('manage.requireShamcashReceiver', 'Receiver code is required'))
        return
      }
      if (!form.shamcashPersonal) {
        setError(t('manage.requireShamcashPersonal', 'Personal code is required'))
        return
      }
    }
    if (!selectedPayee) {
      setError(teamMembers.length === 0
        ? t('manage.noTeamMembers', 'No team members yet. Add members before paying.')
        : t('manage.selectPayee', 'Select the member you want to pay'))
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        projectId: id,
        amount: Number(form.amount),
        method: form.method,
        note: form.note.trim(),
      }
      if (selectedPayee.proposalId) {
        payload.proposalId = selectedPayee.proposalId
      } else {
        payload.payeeId = selectedPayee.id
      }
      const res = await depositPayment(payload)
      if (res?.success) {
        setOpen(false)
        onChanged()
        fetchInvoices()
      } else {
        setSnackbar({ open: true, message: res?.message || t('common.error'), severity: 'error' })
      }
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || err.message || t('common.error'), severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleRelease = async (p) => {
    setReleasingId(p._id)
    setError('')
    try {
      const res = await releasePayment(p._id)
      if (res?.success) {
        setReleaseTarget(null)
        onChanged()
        fetchInvoices()
      } else {
        setSnackbar({ open: true, message: res?.message || t('common.error'), severity: 'error' })
      }
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || err.message || t('common.error'), severity: 'error' })
    } finally {
      setReleasingId(null)
    }
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <SectionHeader icon={<PaymentsOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.payments', 'Payments')} />
        <Button size="small" variant="contained" onClick={openAdd} startIcon={<AddOutlined />}>
          {t('manage.addPayment', 'Add Payment')}
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
        <StatCard icon={<SavingsOutlined sx={{ fontSize: 20 }} />} label={t('manage.totalAmount', 'Total')} value={total} color={COLORS.navy} index={0} />
        <StatCard icon={<HourglassTopOutlined sx={{ fontSize: 20 }} />} label={t('manage.held', 'Held')} value={heldTotal} color={COLORS.warning} index={1} />
        <StatCard icon={<VerifiedOutlined sx={{ fontSize: 20 }} />} label={t('manage.released', 'Released')} value={releasedTotal} color={COLORS.success} index={2} />
      </Stack>

      {loading ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={22} />
          <Typography variant="caption" color="text.secondary">...</Typography>
        </Stack>
      ) : invoices.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 1.5, borderStyle: 'dashed' }}>
          <ReceiptLongOutlined sx={{ fontSize: 44, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
          <Typography color="text.secondary">{t('manage.noInvoices', 'No payments yet')}</Typography>
        </Paper>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Stack spacing={1.5}>
            <AnimatePresence>
              {invoices.map((p, i) => {
                const cfg = ESCROW_STATUS[p.status] || ESCROW_STATUS.held
                const mm = methodMeta(p.method)
                const payee = payeeName(p)
                return (
                  <motion.div
                    key={p._id}
                    custom={i}
                    variants={scaleIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    layout
                  >
                    <Paper variant="outlined" sx={{
                      p: 2, borderRadius: 1.5,
                      borderColor: p.status === 'held' ? alpha(cfg.color, 0.4) : p.status === 'released' ? alpha(COLORS.success, 0.35) : 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': { boxShadow: '0 6px 20px rgba(31,10,59,0.08)', borderColor: alpha(theme.palette.primary.main, 0.3) },
                    }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                        <Box sx={{
                          width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: alpha(cfg.color, 0.1), color: cfg.color,
                        }}>
                          {cfg.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="body1" fontWeight={700}>{p.note || t('manage.untitledPayment', 'Payment')}</Typography>
                            <Chip label={t(cfg.labelKey, p.status)} size="small"
                              sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, color: cfg.color, bgcolor: alpha(cfg.color, 0.1) }} />
                          </Stack>
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <AttachMoneyOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body1" fontWeight={700} color="primary.main">{formatCurrency(p.amount, currency)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <CalendarMonthOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                              <Typography variant="caption" color="text.secondary">{formatDate(p.createdAt, lang)}</Typography>
                            </Stack>
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
                              <ReceiptLongOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                              <Typography variant="caption" color="text.secondary" dir="ltr">{paymentRef(p)}</Typography>
                            </Stack>
                          </Stack>
                          {payee && (
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.5 }}>
                              <PersonOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                              <Typography variant="caption" color="text.secondary">
                                {t('manage.payeeLabel', 'Payee')}: {payee}
                              </Typography>
                            </Stack>
                          )}
                          {p.note && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{p.note}</Typography>}
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          {p.status === 'held' && (
                            <Button
                              variant="contained"
                              color="secondary"
                              startIcon={releasingId === p._id ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <VerifiedOutlined sx={{ fontSize: 16 }} />}
                              onClick={() => setReleaseTarget(p)}
                              disabled={releasingId === p._id}
                              sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'none', px: 2, minHeight: 40, whiteSpace: 'nowrap' }}
                            >
                              {t('manage.releasePay', 'تحرير')}
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </Stack>
        </motion.div>
      )}

      {/* Integrated payment dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth fullScreen={isMobile}
        sx={{ '& .MuiDialog-paper': { borderRadius: isMobile ? 0 : 2.5, maxWidth: 580 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <PaymentsOutlined sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={800}>{t('manage.depositTitle', 'Make a Payment')}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25}>
            <Box sx={{
              p: 1.75, borderRadius: 1.5, border: '1px dashed',
              borderColor: alpha(COLORS.warning, 0.5), bgcolor: alpha(COLORS.warning, 0.05),
              display: 'flex', alignItems: 'center', gap: 1,
            }}>
              <LockOutlined sx={{ fontSize: 18, color: COLORS.warning }} />
              <Typography variant="caption" color="text.secondary">{t('manage.demoNote', 'Demo environment â€” no real payment is processed.')}</Typography>
            </Box>

            {loadingPayee ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', py: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">...</Typography>
              </Stack>
            ) : teamMembers.length === 0 ? (
              <Paper variant="outlined" sx={{
                p: 1.5, borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: alpha(COLORS.warning, 0.06), borderColor: alpha(COLORS.warning, 0.4),
              }}>
                <InfoOutlined sx={{ fontSize: 20, color: COLORS.warning }} />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {t('manage.noTeamMembers', 'No team members yet. Add members before paying.')}
                </Typography>
              </Paper>
            ) : (
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={700}>{t('manage.payTo', 'Payable to')}</Typography>
                  {selectedPayee && (
                    <Chip size="small" label={selectedPayee.proposalId ? t('manage.acceptedChip', 'Accepted proposal') : t('manage.teamChip', 'Team member')}
                      sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, color: selectedPayee.proposalId ? COLORS.success : COLORS.navy, bgcolor: alpha(selectedPayee.proposalId ? COLORS.success : COLORS.navy, 0.1) }} />
                  )}
                </Stack>
                <Stack spacing={1} sx={{ maxHeight: 190, overflowY: 'auto', pr: 0.5 }}>
                  {teamMembers.map((m) => {
                    const selected = selectedPayee?.id === m.id
                    return (
                      <Box key={m.id} onClick={() => setPayeeId(m.id)}
                        sx={{
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 1.5,
                          border: '2px solid', userSelect: 'none',
                          borderColor: selected ? COLORS.success : 'divider',
                          bgcolor: selected ? alpha(COLORS.success, 0.06) : 'background.paper',
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: selected ? COLORS.success : alpha(theme.palette.primary.main, 0.4) },
                        }}>
                        <Avatar src={m.avatar} sx={{ width: 38, height: 38, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                          {m.name.charAt(0)?.toUpperCase() || <PersonOutlined sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>{m.name}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{m.role || t('manage.noRole', 'No role')}</Typography>
                        </Box>
                        {selected && <CheckCircleOutlineOutlined sx={{ color: COLORS.success }} />}
                      </Box>
                    )
                  })}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, lineHeight: 1.5 }}>
                  {t('manage.acceptedProposalHint', 'The amount is held in escrow until the project is completed, then released to the selected member\'s wallet.')}
                </Typography>
              </Box>
            )}

            <TextField label={t('manage.amount', 'Amount')} type="number" value={form.amount} onChange={set('amount')}
              inputProps={{ min: 0 }} sx={{ '& input': { fontSize: '1.1rem', fontWeight: 800 } }} />

            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{t('manage.chooseMethod', 'Select Payment Method')}</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {METHODS.map((m) => (
                  <MethodCard key={m.value} m={m} selected={form.method === m.value} onSelect={() => setForm((prev) => ({ ...prev, method: m.value }))} />
                ))}
              </Stack>
            </Box>

            {isCard ? (
              <>
                <CardPreview form={form} currency={currency} />
                <Typography variant="body2" fontWeight={700}>{t('manage.cardDetails', 'Card Details')}</Typography>
                <TextField label={t('manage.cardNumber', 'Card Number')} value={form.cardNumber} onChange={setCardNumber} placeholder={t('manage.cardNumberPlaceholder', '1234 5678 9012 3456')}
                  inputProps={{ inputMode: 'numeric' }} dir="ltr" />
                <Stack direction="row" spacing={1.5}>
                  <TextField label={t('manage.cardExpiry', 'Expiry')} value={form.cardExpiry} onChange={setCardExpiry} placeholder="MM/YY" dir="ltr" sx={{ flex: 1 }} />
                  <TextField label={t('manage.cardCvv', 'CVV')} value={form.cardCvv} onChange={setCardCvv} placeholder="•••" type="password" dir="ltr" sx={{ flex: 1 }} />
                </Stack>
              </>
            ) : form.method === 'ShamCash' ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box component="img" src="/logo/shamcash.jpg" alt="ShamCash" sx={{ width: 32, height: 32, borderRadius: 1, objectFit: 'cover' }} />
                  <Typography variant="body2" fontWeight={700} sx={{ color: '#1B8C5A' }}>ShamCash</Typography>
                </Box>
                <TextField label={t('manage.shamcashReceiver', 'Receiver Code')} value={form.shamcashReceiver} onChange={set('shamcashReceiver')}
                  placeholder={t('manage.shamcashReceiverPlaceholder', 'Enter receiver code')} />
                <TextField label={t('manage.shamcashPersonal', 'Personal Code')} value={form.shamcashPersonal} onChange={set('shamcashPersonal')}
                  placeholder={t('manage.shamcashPersonalPlaceholder', 'Enter personal code')} type="password" />
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{t('manage.shamcashPhoto', 'Payment Screenshot')}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button variant="outlined" component="label" sx={{ minWidth: 140 }}>
                      {t('manage.shamcashUpload', 'Upload Photo')}
                      <input type="file" accept="image/*" hidden onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setForm((prev) => ({ ...prev, shamcashPhoto: file }))
                      }} />
                    </Button>
                    {form.shamcashPhoto && (
                      <Typography variant="caption" color="text.secondary">{form.shamcashPhoto.name}</Typography>
                    )}
                  </Box>
                </Box>
              </>
            ) : (
              <Paper variant="outlined" sx={{
                p: 1.75, borderRadius: 1.5,
                bgcolor: form.method === 'PayPal' ? alpha('#003087', 0.05) : alpha('#111111', 0.04),
                borderColor: form.method === 'PayPal' ? alpha('#003087', 0.25) : alpha('#111111', 0.15),
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                {form.method === 'PayPal'
                  ? <Box sx={{ color: '#003087', fontWeight: 800, letterSpacing: 0.5 }}>PayPal</Box>
                  : <Apple sx={{ fontSize: 22 }} />}
                <Typography variant="body2" color="text.secondary">
                  {form.method === 'PayPal' ? t('manage.payPalNote', 'You will be redirected to PayPal to complete your payment.') : t('manage.applePayNote', 'Confirm this payment with Face ID or Touch ID.')}
                </Typography>
              </Paper>
            )}

            <TextField label={t('manage.note', 'Note')} value={form.note} onChange={set('note')} multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <LockOutlined sx={{ fontSize: 14 }} />
            <Typography variant="caption">{t('manage.secureNote', 'Payments are protected with SSL encryption.')}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setOpen(false)}>{t('projects.cancel', 'Cancel')}</Button>
            <Button variant="contained" color="success" onClick={handleAdd} disabled={saving || !selectedPayee} startIcon={<CheckCircleOutlineOutlined />}>
              {t('manage.payNow', 'Pay')} {formatCurrency(Number(form.amount) || 0, currency)}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Release confirmation dialog */}
      <Dialog open={!!releaseTarget} onClose={() => { if (!saving && !releasingId) setReleaseTarget(null) }} fullWidth maxWidth="xs">
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
                p: 2, borderRadius: 1.5, bgcolor: alpha(COLORS.success, 0.05), borderColor: alpha(COLORS.success, 0.25),
                textAlign: 'center',
              }}>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>{releaseTarget.note || t('manage.untitledPayment', 'Payment')}</Typography>
                <Typography variant="h6" fontWeight={800} color="success.main">{formatCurrency(releaseTarget.amount, currency)}</Typography>
              </Paper>
              <Box sx={{
                p: 1.75, borderRadius: 1.5, border: '1px dashed',
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
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setReleaseTarget(null)} disabled={saving || releasingId}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="success" onClick={() => handleRelease(releaseTarget)} disabled={saving || !releaseTarget} startIcon={<VerifiedOutlined />}>
            {t('manage.confirmRelease', 'Release')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbar((p) => ({ ...p, open: false }))} severity={snackbar.severity}
          variant="filled" sx={{ width: '100%', fontWeight: 600, borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
