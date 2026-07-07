import express from 'express'
import cors from 'cors'
import projectsRouter from './routes/projects.js'
import notificationsRouter from './routes/notifications.js'

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

app.use('/api/projects/notifications', notificationsRouter)
app.use('/api/projects', projectsRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
