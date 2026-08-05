import { useState } from 'react'
import {
  Box, Paper, Typography, Stack, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, useMediaQuery, alpha,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AddOutlined, PaymentsOutlined, DeleteOutlined, CheckCircleOutlineOutlined,
  AttachMoneyOutlined, CalendarMonthOutlined, ReceiptLongOutlined, AccountBalanceOutlined, SavingsOutlined,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { TextField, Select } from '@/ui'
import ProjectDatePicker from '@/features/projects/create/components/ProjectDatePicker'
import { createPayment, updatePayment, deletePayment } from '@/services/projectService'
import { SectionHeader, StatCard } from './ManageShared'
import { COLORS, formatDate, formatCurrency } from './manageConstants'
import { scaleIn, staggerContainer } from '@/utils/animations'

const PAYMENT_STATUS = {
  Pending: { color: COLORS.warning },
  Paid: { color: COLORS.success },
  Overdue: { color: COLORS.error },
}

const METHOD_LABELS = { bank_transfer: '💳', cash: '💵', other: '🛒' }

export default function PaymentsTab({ id, overview, onChanged }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const payments = overview.payments || []
  const summary = overview.paymentsSummary || { total: 0, paid: 0, pending: 0 }
  const currency = overview.budget?.currency || 'SAR'

  const [dialog, setDialog] = useState(null) // 'add' | payment (for mark paid)
  const [form, setForm] = useState({ title: '', amount: '', dueDate: '', method: 'bank_transfer', note: '', transactionRef: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAdd = () => {
    setDialog('add')
    setForm({ title: '', amount: '', dueDate: '', method: 'bank_transfer', note: '', transactionRef: '' })
    setError('')
  }

  const openMarkPaid = (p) => {
    setDialog(p)
    setForm({ title: p.title || '', amount: p.amount || '', dueDate: p.dueDate || '', method: p.method || 'bank_transfer', note: p.note || '', transactionRef: p.transactionRef || '' })
    setError('')
  }

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target?.value ?? e }))

  const handleAdd = async () => {
    if (!form.amount) {
      setError(t('manage.requireAmount', 'Amount is required'))
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        amount: Number(form.amount),
        dueDate: form.dueDate || undefined,
        method: form.method,
        note: form.note.trim(),
      }
      const res = await createPayment(id, payload)
      if (res?.success) {
        setDialog(null)
        onChanged()
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleMarkPaid = async (p) => {
    setSaving(true)
    setError('')
    try {
      const res = await updatePayment(id, p._id, { status: 'Paid', transactionRef: form.transactionRef.trim() || undefined })
      if (res?.success) {
        setDialog(null)
        onChanged()
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p) => {
    if (!window.confirm(t('manage.deletePaymentConfirm', 'Delete this payment?'))) return
    try {
      const res = await deletePayment(id, p._id)
      if (res?.success) onChanged()
    } catch { /* ignore */ }
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
        <StatCard icon={<SavingsOutlined sx={{ fontSize: 20 }} />} label={t('manage.totalAmount', 'Total')} value={summary.total ?? 0} color={COLORS.navy} index={0} />
        <StatCard icon={<CheckCircleOutlineOutlined sx={{ fontSize: 20 }} />} label={t('manage.paid', 'Paid')} value={summary.paid ?? 0} color={COLORS.success} index={1} />
        <StatCard icon={<CalendarMonthOutlined sx={{ fontSize: 20 }} />} label={t('manage.pendingPay', 'Pending')} value={summary.pending ?? 0} color={COLORS.warning} index={2} />
      </Stack>

      {payments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, borderStyle: 'dashed' }}>
          <ReceiptLongOutlined sx={{ fontSize: 44, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
          <Typography color="text.secondary">{t('manage.noPayments', 'No payments recorded yet')}</Typography>
        </Paper>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Stack spacing={1.5}>
            <AnimatePresence>
              {payments.map((p, i) => {
                const cfg = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.Pending
                const isPaid = p.status === 'Paid'
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
                      p: 2, borderRadius: 2.5,
                      borderColor: isPaid ? alpha(COLORS.success, 0.35) : p.status === 'Overdue' ? alpha(COLORS.error, 0.35) : 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': { boxShadow: '0 6px 20px rgba(31,10,59,0.08)', borderColor: alpha(theme.palette.primary.main, 0.3) },
                    }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                        <Box sx={{
                          width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: alpha(cfg.color, 0.1), color: cfg.color,
                        }}>
                          {isPaid ? <CheckCircleOutlineOutlined /> : <ReceiptLongOutlined />}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="body1" fontWeight={700}>{p.title || t('manage.untitledPayment', 'Payment')}</Typography>
                            <Chip label={t(`manage.payStatus.${p.status}`, p.status)} size="small"
                              sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, color: cfg.color, bgcolor: alpha(cfg.color, 0.1) }} />
                          </Stack>
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <AttachMoneyOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body1" fontWeight={700} color="primary.main">{formatCurrency(p.amount, currency)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <CalendarMonthOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                              <Typography variant="caption" color="text.secondary">{formatDate(p.dueDate, lang)}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <AccountBalanceOutlined sx={{ fontSize: 14, color: '#5C5580' }} />
                              <Typography variant="caption" color="text.secondary">{METHOD_LABELS[p.method] || ''} {t(`manage.method.${p.method}`, p.method)}</Typography>
                            </Stack>
                          </Stack>
                          {p.paidDate && (
                            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                              {t('manage.paidOn', 'Paid on')}: {formatDate(p.paidDate, lang)}
                              {p.transactionRef ? ` • ${p.transactionRef}` : ''}
                            </Typography>
                          )}
                          {p.note && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{p.note}</Typography>}
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          {!isPaid && (
                            <Tooltip title={t('manage.markPaid', 'Mark as Paid')}>
                              <IconButton size="small" color="success" onClick={() => openMarkPaid(p)}>
                                <CheckCircleOutlineOutlined sx={{ fontSize: 19 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={t('manage.delete', 'Delete')}>
                            <IconButton size="small" color="error" onClick={() => handleDelete(p)}>
                              <DeleteOutlined sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
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

      {/* Add payment dialog */}
      <Dialog open={dialog === 'add'} onClose={() => setDialog(null)} fullWidth fullScreen={isMobile}
        sx={{ '& .MuiDialog-paper': { borderRadius: isMobile ? 0 : 2, maxWidth: 500 } }}>
        <DialogTitle>{t('manage.addPayment', 'Add Payment')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label={t('manage.paymentTitle', 'Payment Title')} value={form.title} onChange={set('title')} placeholder={t('manage.paymentTitlePlaceholder', 'e.g. First installment (deposit)')} />
            <TextField label={t('manage.amount', 'Amount')} type="number" value={form.amount} onChange={set('amount')} />
            <ProjectDatePicker label={t('manage.dueDate', 'Due Date')} value={form.dueDate} onChange={set('dueDate')} t={t} />
            <Select label={t('manage.methodLabel', 'Method')} value={form.method} onChange={set('method')}
              options={['bank_transfer', 'cash', 'other'].map((s) => ({ value: s, label: t(`manage.method.${s}`, s) }))} />
            <TextField label={t('manage.note', 'Note')} value={form.note} onChange={set('note')} multiline rows={2} />
          </Stack>
          {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1.5 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDialog(null)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" onClick={handleAdd} disabled={saving}>
            {t('manage.add', 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark paid dialog */}
      <Dialog open={typeof dialog === 'object' && dialog !== null} onClose={() => setDialog(null)} fullWidth fullScreen={isMobile}
        sx={{ '& .MuiDialog-paper': { borderRadius: isMobile ? 0 : 2, maxWidth: 480 } }}>
        <DialogTitle>{t('manage.markPaid', 'Mark as Paid')}</DialogTitle>
        <DialogContent dividers>
          {typeof dialog === 'object' && dialog !== null && (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(COLORS.success, 0.05) }}>
                <Typography variant="body2" fontWeight={700}>{dialog.title || t('manage.untitledPayment', 'Payment')}</Typography>
                <Typography variant="h6" fontWeight={800} color="success.main">{formatCurrency(dialog.amount, currency)}</Typography>
              </Paper>
              <TextField label={t('manage.transactionRef', 'Transaction Reference')} value={form.transactionRef} onChange={set('transactionRef')}
                placeholder={t('manage.transactionRefPlaceholder', 'e.g. TXN-123456')} />
            </Stack>
          )}
          {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1.5 }}>{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDialog(null)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="success" onClick={() => handleMarkPaid(dialog)} disabled={saving}>
            {t('manage.confirmPaid', 'Confirm Payment')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
