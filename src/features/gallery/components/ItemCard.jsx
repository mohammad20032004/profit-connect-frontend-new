﻿import { RADIUS } from '@/theme/tokens'
import { useState } from 'react'
import { Box, Typography, Stack, Chip, IconButton, Menu, MenuItem, ListItemIcon, alpha, Tooltip } from '@mui/material'
import {
  FavoriteOutlined,
  VisibilityOutlined,
  MoreVertOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  StarRounded,
  PlayCircleRounded,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { resolveMediaPath } from '@/services/profile'
import { getItemCover, getItemMedia } from '../media'

function Cover({ item }) {
  const cover = getItemCover(item)
  if (!cover) {
    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08) }}>
        <PlayCircleRounded sx={{ fontSize: 44, opacity: 0.5, color: 'text.secondary' }} />
      </Box>
    )
  }
  return (
    <Box component="img" src={resolveMediaPath(cover)} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }} />
  )
}

export default function ItemCard({ item, isOwner = false, onEdit, onDelete }) {
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState(null)
  const media = getItemMedia(item)
  const isVideo = media.some((m) => m.type === 'video')
  const likesCount = Array.isArray(item?.likes) ? item.likes.length : 0

  return (
    <Box sx={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: RADIUS, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box
        component={Link}
        to={`/portfolio/item/${item._id}`}
        sx={{ position: 'absolute', inset: 0, display: 'block', '&:hover .coverImg': { transform: 'scale(1.06)' } }}
      >
        <Box className="coverImg" sx={{ width: '100%', height: '100%' }}>
          <Cover item={item} />
        </Box>
      </Box>

      {isVideo && (
        <PlayCircleRounded sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.9)', fontSize: 42, pointerEvents: 'none' }} />
      )}

      {item.category && (
        <Chip
          label={item.category}
          size="small"
          sx={{ position: 'absolute', top: 8, insetInlineStart: 8, height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.92)', color: 'text.primary' }}
        />
      )}
      {item.isFeatured && (
        <Tooltip title={t('portfolio.item.featured', 'Featured')}>
          <StarRounded sx={{ position: 'absolute', bottom: 40, insetInlineEnd: 8, color: '#FBBF24', fontSize: 20, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
        </Tooltip>
      )}
      {item.visibility === 'private' && (
        <LockOutlined sx={{ position: 'absolute', top: 8, insetInlineEnd: 8, color: '#fff', fontSize: 16, bgcolor: 'rgba(0,0,0,0.45)', borderRadius: '50%', p: 0.4, boxSizing: 'content-box' }} />
      )}

      {isOwner && (
        <>
          <IconButton
            size="small"
            sx={{ position: 'absolute', bottom: 6, insetInlineEnd: 6, bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' }, zIndex: 2 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setAnchor(e.currentTarget)
            }}
          >
            <MoreVertOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
            <MenuItem onClick={() => { setAnchor(null); onEdit(item) }}>
              <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
              {t('portfolio.item.edit', 'Edit')}
            </MenuItem>
            <MenuItem onClick={() => { setAnchor(null); onDelete(item) }} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}><DeleteOutlined fontSize="small" /></ListItemIcon>
              {t('portfolio.item.delete', 'Delete')}
            </MenuItem>
          </Menu>
        </>
      )}

      <Box sx={{ position: 'absolute', bottom: 0, insetInlineStart: 0, insetInlineEnd: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)', px: 1.5, pb: 1.5, pt: 4, color: '#fff' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {item.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
              <VisibilityOutlined sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={600}>{item.views ?? 0}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
              <FavoriteOutlined sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={600}>{likesCount}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
