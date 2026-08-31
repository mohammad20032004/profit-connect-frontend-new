import { BRAND, RADIUS } from '@/theme/tokens'
import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Stack, Chip, Typography, FormControl, InputLabel, Select, MenuItem, IconButton, alpha } from '@mui/material'
import Button from '@/ui/Button'
import { TextField } from '@/ui'
import { useTranslation } from 'react-i18next'
import {
  CloseRounded,
  CloudUploadOutlined,
  StarRounded,
  StarBorderRounded,
} from '@mui/icons-material'
import { createPortfolioItem, updatePortfolioItem, createCollectionItem } from '@/services/portfolioService'
import { resolveMediaPath } from '@/services/profile'
import { getItemMedia } from '../media'
import SkillsModal from '@/ui/SkillsModal'

const MAX_MEDIA = 12
const MAX_FILE_MB = 50

const CATEGORY_KEYS = ['development', 'design', 'writing', 'marketing', 'photography', 'video', 'other']

export default function ItemFormDialog({ open, onClose, item, onSaved, collectionId }) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    durationNumber: '',
    durationUnit: 'day',
    role: '',
    projectUrl: '',
    visibility: 'public',
  })
  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillsModalOpen, setSkillsModalOpen] = useState(false)
  const [newFiles, setNewFiles] = useState([])
  const [removeMedia, setRemoveMedia] = useState([])
  const [coverImage, setCoverImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const media = getItemMedia(item)

    const duration = item?.duration || ''
    let durationNumber = ''
    let durationUnit = 'day'
    if (duration) {
      const match = duration.match(/(\d+)\s*(يوم|شهر|day|month)/i)
      if (match) {
        durationNumber = match[1]
        const unit = match[2].toLowerCase()
        if (unit === 'شهر' || unit === 'month') durationUnit = 'month'
      } else {
        durationNumber = duration
      }
    }

    setForm({
      title: item?.title || '',
      category: item?.category || '',
      description: item?.description || '',
      durationNumber,
      durationUnit,
      role: item?.role || '',
      projectUrl: item?.projectUrl || '',
      visibility: item?.visibility || 'public',
    })
    setSelectedSkills(item?.skills || [])
    setNewFiles([])
    setRemoveMedia([])
    setCoverImage(item?.coverImage || media.find((m) => m.type === 'image' || !m.type)?.url || '')
    setError('')
  }, [open, item])

  useEffect(() => {
    const urls = newFiles.map(({ url }) => url)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [newFiles])

  const categories = CATEGORY_KEYS.map((key) => ({ value: t(`portfolio.categories.${key}`), label: t(`portfolio.categories.${key}`) }))

  const existingMedia = (item?.media || []).filter((m) => !removeMedia.includes(m.url))
  const totalCount = existingMedia.length + newFiles.length

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_MEDIA - existingMedia.length
    if (files.length > remaining) {
      setError(t('portfolio.form.tooMany'))
      e.target.value = ''
      return
    }
    const oversized = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024)
    if (oversized) {
      setError(t('portfolio.form.tooLarge', { name: oversized.name }))
      e.target.value = ''
      return
    }
    setNewFiles((prev) => [...prev, ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) }))])
    setError('')
    e.target.value = ''
  }

  const handleRemoveExisting = (url) => {
    setRemoveMedia((prev) => [...prev, url])
    if (coverImage === url) setCoverImage('')
  }

  const handleRemoveNew = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleToggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleSubmit = async () => {
    const title = form.title.trim()
    const category = form.category
    if (!title) {
      setError(t('portfolio.form.titleRequired'))
      return
    }
    if (!category) {
      setError(t('portfolio.form.categoryRequired'))
      return
    }
    if (totalCount < 1) {
      setError(t('portfolio.form.mediaRequired'))
      return
    }
    setLoading(true)
    setError('')

    const durationNum = form.durationNumber.trim()
    const durationLabel = form.durationUnit === 'day'
      ? (isRtl ? 'يوم' : 'day')
      : (isRtl ? 'شهر' : 'month')
    const duration = durationNum ? `${durationNum} ${durationLabel}` : ''

    try {
      const fields = {
        title,
        category,
        description: form.description.trim(),
        skills: selectedSkills,
        duration,
        role: form.role.trim(),
        projectUrl: form.projectUrl.trim(),
        visibility: form.visibility,
      }
      let res
      if (item && newFiles.length === 0 && removeMedia.length === 0 && coverImage === (item.coverImage || '')) {
        res = await updatePortfolioItem(item._id, fields)
      } else {
        const fd = new FormData()
        fd.append('title', title)
        fd.append('category', category)
        fd.append('description', fields.description)
        fd.append('skills', JSON.stringify(fields.skills))
        fd.append('duration', fields.duration)
        fd.append('role', fields.role)
        fd.append('projectUrl', fields.projectUrl)
        fd.append('visibility', fields.visibility)
        if (item) {
          if (removeMedia.length) fd.append('removeMedia', JSON.stringify(removeMedia))
          if (coverImage) fd.append('coverImage', coverImage)
        }
        newFiles.forEach(({ file }) => fd.append('media', file))
        if (collectionId) {
          res = await createCollectionItem(collectionId, fd)
        } else {
          res = item ? await updatePortfolioItem(item._id, fd) : await createPortfolioItem(fd)
        }
      }
      if (!res?.success) {
        setError(res?.message || t('common.error'))
        return
      }
      onSaved?.(res.data)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const renderMediaPreview = (url, { isVideo, onRemove, onCover, isCover }) => (
    <Box key={url} sx={{ position: 'relative', width: 96, height: 96, borderRadius: RADIUS, overflow: 'hidden', border: '1px solid', borderColor: isCover ? 'primary.main' : 'divider', flexShrink: 0 }}>
      {isVideo ? (
        <video src={url} preload="metadata" muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <Box component="img" src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      <IconButton
        size="small"
        sx={{ position: 'absolute', top: 2, insetInlineEnd: 2, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' }, p: 0.75, minWidth: 44, minHeight: 44 }}
        onClick={onRemove}
      >
        <CloseRounded sx={{ fontSize: 14 }} />
      </IconButton>
      {onCover && (
        <IconButton
          size="small"
          sx={{ position: 'absolute', bottom: 2, insetInlineEnd: 2, bgcolor: isCover ? 'primary.main' : 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, p: 0.75, minWidth: 44, minHeight: 44 }}
          onClick={onCover}
        >
          {isCover ? <StarRounded sx={{ fontSize: 14 }} /> : <StarBorderRounded sx={{ fontSize: 14 }} />}
        </IconButton>
      )}
    </Box>
  )

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle sx={{ pb: 1 }}>
          {item ? t('portfolio.form.editTitle') : t('portfolio.form.createTitle')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label={t('portfolio.form.title')} value={form.title} onChange={handleChange('title')} fullWidth />
            <FormControl fullWidth>
              <InputLabel>{t('portfolio.form.category')}</InputLabel>
              <Select label={t('portfolio.form.category')} value={form.category} onChange={handleChange('category')}>
                {categories.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label={t('portfolio.form.description')} value={form.description} onChange={handleChange('description')} fullWidth multiline rows={3} />

            {/* Duration */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                label={t('portfolio.form.duration')}
                type="number"
                value={form.durationNumber}
                onChange={handleChange('durationNumber')}
                inputProps={{ min: 1 }}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: 100 }}>
                <InputLabel>{isRtl ? 'الوحدة' : 'Unit'}</InputLabel>
                <Select
                  value={form.durationUnit}
                  onChange={handleChange('durationUnit')}
                  label={isRtl ? 'الوحدة' : 'Unit'}
                >
                  <MenuItem value="day">{isRtl ? 'يوم' : 'Day'}</MenuItem>
                  <MenuItem value="month">{isRtl ? 'شهر' : 'Month'}</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('portfolio.form.role')} value={form.role} onChange={handleChange('role')} fullWidth />
              <TextField label={t('portfolio.form.projectUrl')} value={form.projectUrl} onChange={handleChange('projectUrl')} fullWidth />
            </Stack>

            {/* Skills */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{t('portfolio.form.skills')}</Typography>
              <Box
                onClick={() => setSkillsModalOpen(true)}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  p: 1.5,
                  borderRadius: RADIUS,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  minHeight: 56,
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'primary.light', bgcolor: 'action.selected' },
                }}
              >
                {selectedSkills.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
                    {t('portfolio.form.skillsPlaceholder', 'انقر لاختيار المهارات...')}
                  </Typography>
                ) : (
                  selectedSkills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      onDelete={() => handleToggleSkill(skill)}
                      sx={{
                        bgcolor: alpha(BRAND, 0.08),
                        color: 'primary.main',
                        fontWeight: 600,
                        '& .MuiChip-deleteIcon': { fontSize: 16, color: 'primary.main', '&:hover': { color: 'primary.dark' } },
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>{t('portfolio.form.visibility')}</InputLabel>
              <Select label={t('portfolio.form.visibility')} value={form.visibility} onChange={handleChange('visibility')}>
                <MenuItem value="public">{t('portfolio.form.public')}</MenuItem>
                <MenuItem value="private">{t('portfolio.form.private')}</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{t('portfolio.form.media')}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{t('portfolio.form.mediaHint')}</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {existingMedia.map((m) => renderMediaPreview(
                  resolveMediaPath(m.url),
                  {
                    isVideo: m.type === 'video',
                    onRemove: () => handleRemoveExisting(m.url),
                    onCover: m.type === 'video' ? undefined : () => setCoverImage(coverImage === m.url ? '' : m.url),
                    isCover: coverImage === m.url,
                  }
                ))}
                {newFiles.map(({ url, file }, i) => renderMediaPreview(
                  url,
                  {
                    isVideo: file.type.startsWith('video/'),
                    onRemove: () => handleRemoveNew(i),
                    onCover: file.type.startsWith('video/') ? undefined : () => setCoverImage(coverImage === url ? '' : url),
                    isCover: coverImage === url,
                  }
                ))}
              </Stack>
              {totalCount < MAX_MEDIA && (
                <Box sx={{ mt: 1.5 }}>
                  <input
                    id="portfolio-media-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/gif,video/mp4,video/webm,video/mov,video/avi"
                    multiple
                    hidden
                    onChange={handleFiles}
                  />
                  <label htmlFor="portfolio-media-input" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    <Chip
                      component="span"
                      icon={<CloudUploadOutlined sx={{ fontSize: 16 }} />}
                      label={t('portfolio.form.addMedia')}
                      color="primary"
                      variant="outlined"
                      sx={{ height: 34, fontSize: '0.8rem', borderRadius: RADIUS, cursor: 'pointer', '&:hover': { bgcolor: alpha(BRAND, 0.08) } }}
                    />
                  </label>
                </Box>
              )}
              {coverImage && (
                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                  {t('portfolio.form.cover')}
                </Typography>
              )}
            </Box>

            {error && <Typography color="error" variant="body2">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" onClick={onClose}>{t('portfolio.form.cancel')}</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {item ? t('portfolio.form.save') : t('portfolio.form.create')}
          </Button>
        </DialogActions>
      </Dialog>

      <SkillsModal
        open={skillsModalOpen}
        onClose={() => setSkillsModalOpen(false)}
        selected={selectedSkills}
        onToggle={handleToggleSkill}
      />
    </>
  )
}
