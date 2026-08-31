import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import Hls from 'hls.js'

export default function HlsVideoPlayer({ src, poster, sx, ...props }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl || !src) return

    if (src.endsWith('.m3u8') || src.includes('.m3u8?')) {
      if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = src
      } else if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 30 })
        hls.loadSource(src)
        hls.attachMedia(videoEl)
        hlsRef.current = hls
      } else {
        videoEl.src = src
      }
    } else {
      videoEl.src = src
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src])

  return (
    <Box
      ref={videoRef}
      component="video"
      poster={poster}
      controls
      playsInline
      preload="metadata"
      sx={{
        width: '100%',
        maxHeight: 400,
        borderRadius: 1,
        bgcolor: '#000',
        ...sx,
      }}
      {...props}
    />
  )
}
