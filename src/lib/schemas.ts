import { z } from "zod"

export const clientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    company: z.string().min(1, "Company is required"),
    email: z.email("Enter a valid email"),
    phone: z.string().min(1, "Phone is required"),
    status: z.enum(["active", "lead", "inactive"]),
})

export const projectSchema = z.object({
    clientId: z.number().min(1, "Select a client"),
    name: z.string().min(1, "Project name is required"),
    status: z.enum(["active", "planning", "completed"]),
    budget: z.number().min(1, "Budget must be greater than 0"),
    dueDate: z.string().min(1, "Due date is required"),
})

export const invoiceSchema = z.object({
    clientId: z.number().min(1, "Select a client"),
    projectId: z.number().min(1, "Select a project"),
    amount: z.number().min(1, "Amount must be greater than 0"),
    status: z.enum(["paid", "unpaid", "overdue", "draft"]),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().min(1, "Due date is required"),
})

export const taskSchema = z.object({
    projectId: z.number().min(1, "Select a project"),
    title: z.string().min(1, "Title is required"),
    status: z.enum(["todo", "in-progress", "done"]),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.string().min(1, "Due date is required"),
})

export type ClientFormValues = z.infer<typeof clientSchema>
export type ProjectFormValues = z.infer<typeof projectSchema>
export type InvoiceFormValues = z.infer<typeof invoiceSchema>
export type TaskFormValues = z.infer<typeof taskSchema>