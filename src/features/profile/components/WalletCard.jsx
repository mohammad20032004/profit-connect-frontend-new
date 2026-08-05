import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  alpha, Divider, CircularProgress,
} from '@mui/material'
import {
  AccountBalanceWalletOutlined, HourglassTopOutlined, TrendingUpOutlined, SwapHorizOutlined,
  ArrowUpward, ArrowDownward, LockOutlined, ReceiptLongOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import { TextField } from '@/ui'
import { getWallet, requestWithdrawal } from '@/services/walletService'
import { getMyPayments } from '@/services/projectService'

const PAY_STATUS = {
  held: { color: '#D97706', labelKey: 'profile.payHeld' },
  released: { color: '#16A34A', labelKey: 'profile.payReleased' },
  refunded: { color: '#DC2626', labelKey: 'profile.payRefunded' },
  cancelled: { color: '#5C5580', labelKey: 'profile.payCancelled' },
}

const TXN_COLORS = {
  release: '#16A34A',
  fee: '#DC2626',
  refund: '#16A34A',
  withdraw: '#D97706',
  withdraw_refund: '#16A34A',
  withdraw_processed: '#576FA2',
  manual: '#7D5DAB',
}

const TXN_ICONS = {
  release: <ArrowUpward fontSize="small" />,
  fee: <ArrowDownward fontSize="small" />,
  refund: <ArrowUpward fontSize="small" />,
  withdraw: <ArrowDownward fontSize="small" />,
  withdraw_refund: <ArrowUpward fontSize="small" />,
  withdraw_processed: <SwapHorizOutlined fontSize="small" />,
  manual: <SwapHorizOutlined fontSize="small" />,
}

const fmt = (n) => Number(n || 0).toLocaleString()

const fullName = (user) => {
  if (!user) return ''
  if (typeof user === 'string') return user
  const prof = user.profile || {}
  return [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.name || user.email || ''
}

export default function WalletCard() {
  const { t } = useTranslation()
  const [wallet, setWallet] = useState(null)
  const [txns, setTxns] = useState([])
  const [received, setReceived] = useState([])
  const [loading, setLoading] = useState(true)
  const [receivedLoading, setReceivedLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [iban, setIban] = useState('')
  const [holderName, setHolderName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    getWallet()
      .then((res) => {
        if (!active || !res?.success) return
        setWallet(res.data.wallet)
        setTxns(res.data.transactions || [])
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    getMyPayments({ direction: 'received' })
      .then((res) => {
        if (!active || !res?.success) return
        setReceived(res.data || [])
      })
      .catch(() => {})
      .finally(() => { if (active) setReceivedLoading(false) })
    return () => { active = false }
  }, [])

  const balance = wallet?.balance ?? 0
  const holding = wallet?.holding ?? 0
  const inEscrow = wallet?.inEscrow ?? 0
  const inEscrowCount = wallet?.inEscrowCount ?? 0
  const totalEarned = wallet?.totalEarned ?? 0
  const totalWithdrawn = wallet?.totalWithdrawn ?? 0

  const openWithdraw = () => {
    setAmount('')
    setBankName('')
    setIban('')
    setHolderName('')
    setError('')
    setOpen(true)
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
        setOpen(false)
        setSuccess(t('profile.withdrawSuccess', 'Withdrawal request submitted'))
        const walletRes = await getWallet()
        if (walletRes?.success) {
          setWallet(walletRes.data.wallet)
          setTxns(walletRes.data.transactions || [])
        }
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
    <Box sx={{ flex: 1, minWidth: 110, textAlign: 'center', p: 1.25, borderRadius: 2, bgcolor: alpha(color, 0.06), border: '1px solid', borderColor: alpha(color, 0.18) }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={800} fontSize="1.05rem" sx={{ color, lineHeight: 1.15 }}>{fmt(value)}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', fontWeight: 600 }}>{label}</Typography>
    </Box>
  )

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: alpha('#3D1C6E', 0.18), bgcolor: 'background.paper' }}>
      <Box sx={{
        height: 4, borderRadius: 4, mb: 1.5,
        background: 'linear-gradient(90deg, #3D1C6E 0%, #1F3670 60%, #16A34A 100%)',
      }} />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha('#3D1C6E', 0.08), color: 'primary.main',
          }}>
            <AccountBalanceWalletOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">{t('profile.wallet', 'Wallet & Earnings')}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', maxWidth: 340, display: 'block' }}>
              {t('profile.walletHint', 'Payments you earn are held in escrow until the project is completed, then released to your available balance.')}
            </Typography>
          </Box>
        </Stack>
        <Button variant="contained" color="success" size="small" onClick={openWithdraw} disabled={loading || balance <= 0} startIcon={<SwapHorizOutlined />}>
          {t('profile.withdraw', 'Withdraw')}
        </Button>
      </Stack>

      {success && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1.25, p: 1, borderRadius: 1.5, bgcolor: alpha('#16A34A', 0.08), textAlign: 'center', fontWeight: 600 }}>
          {success}
        </Typography>
      )}

      <Box sx={{ mt: 1.5 }}>
        {loading ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={22} />
            <Typography variant="caption" color="text.secondary">...</Typography>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
            {statItem(t('profile.availableBalance', 'Available balance'), balance, '#16A34A', <LockOutlined sx={{ fontSize: 18 }} />)}
            {statItem(`${t('profile.inEscrow', 'In escrow')}${inEscrowCount ? ` (${inEscrowCount})` : ''}`, inEscrow, '#3D1C6E', <ReceiptLongOutlined sx={{ fontSize: 18 }} />)}
            {statItem(t('profile.holding', 'Held for review'), holding, '#D97706', <HourglassTopOutlined sx={{ fontSize: 18 }} />)}
            {statItem(t('profile.totalEarned', 'Total earned'), totalEarned, '#7D5DAB', <TrendingUpOutlined sx={{ fontSize: 18 }} />)}
            {statItem(t('profile.totalWithdrawn', 'Total withdrawn'), totalWithdrawn, '#576FA2', <SwapHorizOutlined sx={{ fontSize: 18 }} />)}
          </Stack>
        )}
      </Box>

      <Divider sx={{ my: 1.75 }} />

      <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.62rem', color: 'text.secondary' }}>
        {t('profile.transactions', 'Recent transactions')}
      </Typography>
      <Box sx={{ mt: 1 }}>
        {txns.length === 0 ? (
          <Typography variant="caption" color="text.secondary">{t('profile.noTransactions', 'No transactions yet')}</Typography>
        ) : (
          <Stack spacing={0.75}>
            {txns.slice(0, 5).map((tx, i) => {
              const color = TXN_COLORS[tx.type] || '#576FA2'
              const positive = tx.type === 'release' || tx.type === 'refund' || tx.type === 'withdraw_refund'
              return (
                <Stack key={i} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: 1, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(color, 0.1), color,
                  }}>
                    {TXN_ICONS[tx.type] || <SwapHorizOutlined fontSize="small" />}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }} noWrap>
                      {tx.description || t(`profile.tx${tx.type.charAt(0).toUpperCase()}${tx.type.slice(1)}`, tx.type)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ''}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={800} sx={{ color: positive ? 'success.main' : '#5C5580', fontSize: '0.8rem' }}>
                    {positive ? '+' : ''}{fmt(tx.amount)}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        )}
      </Box>

      <Divider sx={{ my: 1.75 }} />

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.62rem', color: 'text.secondary' }}>
          {t('profile.receivedPayments', 'Payments to you')}
        </Typography>
        <Button component="a" href="/payments" size="small" variant="text" sx={{ fontSize: '0.7rem', fontWeight: 700, minWidth: 0, p: 0 }}>
          {t('profile.viewAllPayments', 'View all')}
        </Button>
      </Stack>
      <Box sx={{ mt: 1 }}>
        {receivedLoading ? (
          <Typography variant="caption" color="text.secondary">{t('common.loading', 'Loading...')}</Typography>
        ) : received.length === 0 ? (
          <Typography variant="caption" color="text.secondary">{t('profile.noReceivedPayments', 'No payments received yet')}</Typography>
        ) : (
          <Stack spacing={0.75}>
            {received.slice(0, 5).map((p, i) => {
              const st = PAY_STATUS[p.status] || { color: '#5C5580', labelKey: p.status }
              return (
                <Stack key={i} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: 1, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(st.color, 0.1), color: st.color,
                  }}>
                    <ReceiptLongOutlined sx={{ fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }} noWrap>
                      {p.note || `${fullName(p.payer) || p.project?.title || ''} → ${fullName(p.payee) || t('profile.you', 'You')}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                      {t(st.labelKey, st.labelKey)} • {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={800} sx={{ color: st.color, fontSize: '0.8rem' }}>
                    {fmt(p.amount)}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: '1rem', fontWeight: 800 }}>{t('profile.withdrawTitle', 'Withdraw Funds')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#16A34A', 0.06), border: '1px solid', borderColor: alpha('#16A34A', 0.2), textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">{t('profile.availableBalance', 'Available balance')}</Typography>
              <Typography variant="h6" fontWeight={800} color="success.main">{fmt(balance)}</Typography>
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
          <Button variant="outlined" onClick={() => setOpen(false)}>{t('projects.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="success" onClick={handleWithdraw} disabled={saving} startIcon={<SwapHorizOutlined />}>
            {t('profile.confirmWithdraw', 'Submit Request')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}
