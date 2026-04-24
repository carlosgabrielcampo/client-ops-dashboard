export type Client = {
  id: number
  name: string
  company: string
  email: string
  phone: string
  status: string
}

export type Project = {
  id: number
  clientId: number
  name: string
  status: string
  budget: number
  dueDate: string
}

export type Invoice = {
  id: number
  clientId: number
  projectId: number
  status: string
  amount: number
  dueDate: string
  issueDate: string
}

export type Task = {
  id: number,
  projectId: number,
  title: string,
  status: string,
  priority: string,
  dueDate: string
}