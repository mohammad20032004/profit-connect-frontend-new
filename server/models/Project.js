const projects = []
const proposals = []
let projectIdCounter = 1
let proposalIdCounter = 1

export function createProject(data) {
  const project = { _id: String(projectIdCounter++), ...data, status: 'Open', createdAt: new Date().toISOString() }
  projects.push(project)
  return project
}

export function getProjectById(id) {
  return projects.find(p => p._id === id) || null
}

export function updateProject(id, data) {
  const idx = projects.findIndex(p => p._id === id)
  if (idx === -1) return null
  projects[idx] = { ...projects[idx], ...data }
  return projects[idx]
}

export function deleteProject(id) {
  const idx = projects.findIndex(p => p._id === id)
  if (idx === -1) return false
  projects.splice(idx, 1)
  return true
}

export function getProposalsByProject(projectId) {
  return proposals.filter(p => p.projectId === projectId)
}

export function createProposal(projectId, data) {
  const proposal = { _id: String(proposalIdCounter++), projectId, ...data, status: 'Pending', createdAt: new Date().toISOString() }
  proposals.push(proposal)
  return proposal
}

export function acceptProposal(projectId, proposalId) {
  const project = projects.find(p => p._id === projectId)
  if (!project) return { success: false, message: 'Project not found' }

  project.status = 'InProgress'

  let accepted = null
  proposals.forEach(p => {
    if (p.projectId === projectId) {
      if (p._id === proposalId) {
        p.status = 'Accepted'
        accepted = p
      } else if (p.status === 'Pending') {
        p.status = 'Rejected'
      }
    }
  })

  if (!accepted) return { success: false, message: 'Proposal not found' }
  return { success: true, data: accepted }
}

export function rejectProposal(projectId, proposalId) {
  const proposal = proposals.find(p => p._id === proposalId && p.projectId === projectId)
  if (!proposal) return { success: false, message: 'Proposal not found' }
  if (proposal.status !== 'Pending') return { success: false, message: 'Proposal is not pending' }

  proposal.status = 'Rejected'
  return { success: true, data: proposal }
}
