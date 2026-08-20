import { useState } from 'react'
import { Avatar } from '@mui/material'
import { resolveMediaPath, getDefaultAvatar } from '@/services/profile'

export default function UserAvatar({ src, name, role, gender, sx, children, ...props }) {
  const [imgFailed, setImgFailed] = useState(false)
  const resolved = resolveMediaPath(src)
  const defaultImg = getDefaultAvatar(role, gender)
  const showDefault = !resolved || imgFailed

  return (
    <Avatar
      src={showDefault ? defaultImg : resolved}
      onError={() => { if (!showDefault) setImgFailed(true) }}
      sx={sx}
      {...props}
    >
      {children || name?.charAt(0)?.toUpperCase()}
    </Avatar>
  )
}
