import type { Client, Project, Invoice, Task } from "@/types/types"

const API_URL = "http://localhost:3001"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

export async function getClients(): Promise<Client[]> {
  return request("/clients")
}
export async function getClient(id: number): Promise<Client> {
  return request(`/clients/${id}`)
}
export async function createClient(client: Omit<Client, "id">) {
  const response = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to create client")
  }

  return response.json()
}
export async function updateClient(id: number, client: Omit<Client, "id">) {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to update client")
  }

  return response.json()
}


export async function getProjects(): Promise<Project[]> {
  return request("/projects")
}
export async function getProject(id: number): Promise<Project> {
  return request(`/projects/${id}`)
}
export async function getProjectsByClientId(clientId: number): Promise<Project[]> {
  return request(`/projects?clientId=${clientId}`)
}
export async function createProjects(client: Omit<Project, "id">) {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to create projects")
  }

  return response.json()
}
export async function updateProjects(id: number, client: Omit<Project, "id">) {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to update projects")
  }

  return response.json()
}


export async function getInvoices(): Promise<Invoice[]> {
  return request("/invoices")
}
export async function getInvoicesByProjectId(projectId: number): Promise<Invoice[]> {
  return request(`/invoices?projectId=${projectId}`)
}
export async function getInvoicesByClientId(clientId: number): Promise<Invoice[]> {
  return request(`/invoices?clientId=${clientId}`)
}
export async function createInvoices(client: Omit<Invoice, "id">) {
  const response = await fetch(`${API_URL}/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to create invoices")
  }

  return response.json()
}
export async function updateInvoices(id: number, client: Omit<Invoice, "id">) {
  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to update invoices")
  }

  return response.json()
}


export async function getTasks(): Promise<Task[]> {
  return request("/tasks")
}
export async function getTasksByProjectId(projectId: number): Promise<Task[]> {
  return request(`/tasks?projectId=${projectId}`)
}
export async function createTasks(client: Omit<Task, "id">) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to create task")
  }

  return response.json()
}
export async function updateTasks(id: number, client: Omit<Task, "id">) {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(client),
  })

  if (!response.ok) {
    throw new Error("Failed to update task")
  }

  return response.json()
}