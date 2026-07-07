import { Router } from 'express'
import {
  getProjectById, updateProject, deleteProject,
  getProposalsByProject, createProposal,
  acceptProposal, rejectProposal,
} from '../models/Project.js'

const router = Router()

// Get project by ID
router.get('/:id', (req, res) => {
  const project = getProjectById(req.params.id)
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
  res.json({ success: true, data: project })
})

// Update project
router.put('/:id', (req, res) => {
  const project = updateProject(req.params.id, req.body)
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
  res.json({ success: true, data: project })
})

// Delete project
router.delete('/:id', (req, res) => {
  const deleted = deleteProject(req.params.id)
  if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' })
  res.json({ success: true })
})

// Get proposals for a project
router.get('/:id/proposals', (req, res) => {
  const project = getProjectById(req.params.id)
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
  const projectProposals = getProposalsByProject(req.params.id)
  res.json({ success: true, data: projectProposals })
})

// Submit proposal
router.post('/:id/proposals', (req, res) => {
  const project = getProjectById(req.params.id)
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
  if (project.status !== 'Open') return res.status(400).json({ success: false, message: 'Project is not open for proposals' })

  const proposal = createProposal(req.params.id, req.body)
  res.status(201).json({ success: true, data: proposal })
})

// Accept proposal (auto-rejects other pending proposals)
router.post('/:id/proposals/:proposalId/accept', (req, res) => {
  const result = acceptProposal(req.params.id, req.params.proposalId)
  if (!result.success) return res.status(400).json(result)
  res.json(result)
})

// Reject proposal
router.post('/:id/proposals/:proposalId/reject', (req, res) => {
  const result = rejectProposal(req.params.id, req.params.proposalId)
  if (!result.success) return res.status(400).json(result)
  res.json(result)
})

export default router
