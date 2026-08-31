import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, IconButton, Typography, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  CloseOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@mui/icons-material'

export default function Lightbox({ images = [], initialIndex = 0, open, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setScale(1)
      setLoaded(false)
    }
  }, [open, initialIndex])

  useEffect(() => {
    if (!open) return
    setLoaded(false)
    setScale(1)
    const timer = setTimeout(() => {
      if (imgRef.current?.complete) setLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [currentIndex, open])

  const goNext = useCallback(() => {
    setLoaded(false)
    setCurrentIndex((p) => (p < images.length - 1 ? p + 1 : 0))
  }, [images.length])

  const goPrev = useCallback(() => {
    setLoaded(false)
    setCurrentIndex((p) => (p > 0 ? p - 1 : images.length - 1))
  }, [images.length])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.5, 5))
      if (e.key === '-') setScale((s) => Math.max(s - 0.5, 0.5))
    }
    const onWheel = (e) => {
      e.preventDefault()
      if (e.deltaY < 0) setScale((s) => Math.min(s + 0.15, 5))
      else setScale((s) => Math.max(s - 0.15, 0.3))
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('wheel', onWheel, { passive: false })
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('wheel', onWheel)
      document.body.style.overflow = ''
    }
  }, [open, goNext, goPrev, onClose])

  const handleDownload = () => {
    const url = images[currentIndex]
    const ext = url.split('.').pop().split('?')[0].toLowerCase()
    const isWebP = ext === 'webp'
    const filename = `image-${currentIndex + 1}${isWebP ? '.jpg' : '.' + ext}`

    if (isWebP) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          const blobUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        }, 'image/jpeg', 0.95)
      }
      img.onerror = () => {
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.target = '_blank'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
      img.src = url
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  if (!open) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        animation: 'lbFadeIn 0.15s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Top Bar */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
          {currentIndex + 1} / {images.length}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton onClick={() => setScale((s) => Math.min(s + 0.5, 5))} sx={{ color: '#fff' }}>
            <ZoomInOutlined />
          </IconButton>
          <IconButton onClick={() => setScale((s) => Math.max(s - 0.5, 0.5))} sx={{ color: '#fff' }}>
            <ZoomOutOutlined />
          </IconButton>
          <IconButton onClick={handleDownload} sx={{ color: '#fff' }}>
            <DownloadOutlined />
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <CloseOutlined />
          </IconButton>
        </Stack>
      </Box>

      {/* Nav Arrows */}
      {images.length > 1 && (
        <>
          <IconButton onClick={goPrev} sx={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            bgcolor: alpha('#fff', 0.12), color: '#fff', width: 48, height: 48,
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: alpha('#fff', 0.25) },
          }}>
            <ChevronLeftOutlined sx={{ fontSize: 32 }} />
          </IconButton>
          <IconButton onClick={goNext} sx={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10,
            bgcolor: alpha('#fff', 0.12), color: '#fff', width: 48, height: 48,
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: alpha('#fff', 0.25) },
          }}>
            <ChevronRightOutlined sx={{ fontSize: 32 }} />
          </IconButton>
        </>
      )}

      {/* Image */}
      <Box sx={{
        position: 'relative', maxWidth: '90vw', maxHeight: '85vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.3s ease', transform: `scale(${scale})`,
      }}>
        {!loaded && (
          <Box sx={{
            position: 'absolute', width: 36, height: 36,
            border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#fff',
            borderRadius: '50%', animation: 'lbSpin 0.8s linear infinite',
          }} />
        )}
        <Box
          ref={imgRef}
          component="img"
          src={images[currentIndex]}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          sx={{
            maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain',
            borderRadius: 1, opacity: loaded ? 1 : 0,
            transition: 'opacity 0.15s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </Box>

      {/* Thumbnails */}
      {images.length > 1 && images.length <= 10 && (
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 72,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, px: 2,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)', zIndex: 10,
        }}>
          {images.map((img, idx) => (
            <Box key={idx} onClick={() => { setCurrentIndex(idx); setScale(1); setLoaded(false) }} sx={{
              width: 48, height: 48, borderRadius: 1, overflow: 'hidden', cursor: 'pointer',
              border: idx === currentIndex ? '2px solid #fff' : '2px solid transparent',
              opacity: idx === currentIndex ? 1 : 0.5, transition: 'all 0.2s', flexShrink: 0,
              '&:hover': { opacity: 0.8 },
            }}>
              <Box component="img" src={img} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}
        </Box>
      )}

      <style>{`
        @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  )
}
