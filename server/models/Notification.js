const notifications = [
  { _id: '1', type: 'proposal_accepted', proposalStatus: 'accepted', projectName: 'تطبيق ويب', clientName: 'أحمد محمد', projectId: '1', read: false, createdAt: new Date(Date.now() - 60000 * 5).toISOString() },
  { _id: '2', type: 'proposal_new', proposalStatus: 'pending', projectName: 'متجر إلكتروني', clientName: 'سارة خالد', projectId: '2', read: false, createdAt: new Date(Date.now() - 60000 * 30).toISOString() },
  { _id: '3', type: 'project_completed', proposalStatus: 'completed', projectName: 'تصميم UI/UX', clientName: 'محمد علي', projectId: '3', read: true, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { _id: '4', type: 'rating_received', proposalStatus: 'accepted', projectName: 'تطبيق موبايل', clientName: 'نورة عبدالله', projectId: '4', read: true, createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { _id: '5', type: 'proposal_rejected', proposalStatus: 'rejected', projectName: 'نظام محاسبة', clientName: 'خالد عمر', projectId: '5', read: false, createdAt: new Date(Date.now() - 60000 * 2).toISOString() },
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
    type: data.type || 'info',
    proposalStatus: data.proposalStatus || '',
    projectName: data.projectName || '',
    clientName: data.clientName || '',
    projectId: data.projectId || '',
    read: false,
    createdAt: new Date().toISOString(),
  }
  recentNotifications.push(n)
  return n
}
