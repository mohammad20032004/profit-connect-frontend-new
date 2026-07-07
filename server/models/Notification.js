const notifications = [
  { _id: '1', userId: '1', title: 'تم قبول عرضك', message: 'تم قبول عرضك في مشروع تطبيق ويب', type: 'proposal', read: false, createdAt: new Date(Date.now() - 60000 * 5).toISOString() },
  { _id: '2', userId: '1', title: 'عرض جديد', message: 'هناك عرض جديد على مشروعك', type: 'proposal', read: false, createdAt: new Date(Date.now() - 60000 * 30).toISOString() },
  { _id: '3', userId: '1', title: 'اكتمال المشروع', message: 'تم اكتمال مشروع تصميم UI/UX', type: 'project', read: true, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { _id: '4', userId: '1', title: 'تقييم جديد', message: 'قام عميل بتقييمك 5 نجوم', type: 'rating', read: true, createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { _id: '5', userId: '1', title: 'مشروع جديد', message: 'تم نشر مشروع جديد في تطوير ويب', type: 'project', read: false, createdAt: new Date(Date.now() - 60000 * 2).toISOString() },
]

let counter = 5
const recentNotifications = []

export function getNotifications() {
  return [...notifications, ...recentNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getRecentNotifications() {
  const now = Date.now()
  const cutoff = now - 60000 * 20
  return [...recentNotifications, ...notifications].filter(n => new Date(n.createdAt).getTime() > cutoff && !n.read).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function markAsRead(notificationId) {
  const all = [...notifications, ...recentNotifications]
  const n = all.find(n => n._id === notificationId)
  if (!n) return { success: false, message: 'Notification not found' }
  n.read = true
  return { success: true, data: n }
}

export function addNotification(data) {
  counter++
  const n = {
    _id: String(counter),
    userId: data.userId || '1',
    title: data.title || 'إشعار جديد',
    message: data.message || '',
    type: data.type || 'info',
    read: false,
    createdAt: new Date().toISOString(),
  }
  recentNotifications.push(n)
  return n
}
