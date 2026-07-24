export function extractCoordinates(location) {
  if (!location) return null
  const coords = location.coordinates
  if (!coords) return null

  if (Array.isArray(coords)) {
    const [lng, lat] = coords
    if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
      return [lng, lat]
    }
  }

  if (coords.type === 'Point' && Array.isArray(coords.coordinates)) {
    const [lng, lat] = coords.coordinates
    if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
      return [lng, lat]
    }
  }

  if (coords.x != null && coords.y != null) {
    const lng = Number(coords.x)
    const lat = Number(coords.y)
    if (!isNaN(lng) && !isNaN(lat)) return [lng, lat]
  }

  if (coords.lng != null && coords.lat != null) {
    const lng = Number(coords.lng)
    const lat = Number(coords.lat)
    if (!isNaN(lng) && !isNaN(lat)) return [lng, lat]
  }

  if (coords.longitude != null && coords.latitude != null) {
    const lng = Number(coords.longitude)
    const lat = Number(coords.latitude)
    if (!isNaN(lng) && !isNaN(lat)) return [lng, lat]
  }

  return null
}
