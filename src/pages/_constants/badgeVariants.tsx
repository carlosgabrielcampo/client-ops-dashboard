export function getClientStatusVariant(status: string) {
    switch (status) {
        case "active":
            return "bg-green-100 text-green-800 border-green-200"
        case "lead":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "inactive":
            return "bg-slate-100 text-slate-800 border-slate-200"
        default:
            return ""
    }
}

export function getInvoiceStatusClass(status: string) {
    switch (status) {
        case "paid":
            return "bg-green-100 text-green-800 border-green-200"
        case "unpaid":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "overdue":
            return "bg-red-100 text-red-800 border-red-200"
        case "draft":
            return "bg-slate-100 text-slate-700 border-slate-200"
        default:
            return ""
    }
}


export function getTaskPriorityVariant(status: string) {
    switch (status) {
        case "low":
            return "bg-green-100 text-green-800 border-green-200"
        case "medium":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "high":
            return "bg-red-100 text-red-800 border-red-200"
        default:
            return ""
    }
}
export function getTaskStatusVariant(status: string) {
    switch (status) {
        case "done":
            return "bg-green-100 text-green-800 border-green-200"
        case "in-progress":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "todo":
            return "bg-blue-100 text-blue-800 border-blue-200"
        default:
            return ""
    }
}