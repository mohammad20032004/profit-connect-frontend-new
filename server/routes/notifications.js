import { Router } from 'express'
import { getNotifications, getRecentNotifications, markAsRead } from '../models/Notification.js'

const router = Router()

router.get('/', (req, res) => {
  const data = getNotifications()
  res.json({ success: true, data })
})

router.get('/recent', (req, res) => {
  const data = getRecentNotifications()
  res.json({ success: true, data })
})

router.put('/:id/read', (req, res) => {
  const result = markAsRead(req.params.id)
  if (!result.success) return res.status(404).json(result)
  res.json(result)
})

export default router
