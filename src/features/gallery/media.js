export function getItemUserId(item) {
  const u = item?.user
  return typeof u === 'string' ? u : u?._id || u?.id
}

export function getItemMedia(item) {
  const media = item?.media || []
  return [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function getItemCover(item) {
  if (!item) return null
  if (item.coverImage) return item.coverImage
  const media = getItemMedia(item)
  const image = media.find((m) => m.type === 'image' || !m.type)
  return image?.url || media[0]?.url || null
}

export function getItemOwnerInfo(item) {
  const u = item?.user
  if (!u || typeof u === 'string') return null
  const p = u.profile || {}
  const name = p.fullname || `${p.firstName || ''} ${p.lastName || ''}`.trim() || u.username || u.email || ''
  return { id: u._id || u.id, name, avatar: p.avatar, headline: p.headline }
}
