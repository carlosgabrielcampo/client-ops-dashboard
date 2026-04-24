import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SelectorProps = {
    value: string
    onValueChange: (value: string) => void
}

type TableSizeSelectorProps = SelectorProps & {
    defaultSize?: number
    amountOfOptions?: number
}

export const TaskStatusSelector = ({ value, onValueChange }: SelectorProps) => {
    return <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="task-status-filter" className="w-full">
            <SelectValue placeholder="Select a status" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="done">Done</SelectItem>
        </SelectContent>
    </Select>
}

export const PrioritySelector = ({ value, onValueChange }: SelectorProps) => {
    return <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="task-priority-filter" className="w-full">
            <SelectValue placeholder="Select a priority" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
        </SelectContent>
    </Select>
}
export const ProjectStatusSelector = ({ value, onValueChange }: SelectorProps) => {
    return <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="project-status-filter" className="w-full">
            <SelectValue placeholder="Select a status" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
    </Select>
}

export const ClientTableSizeSelector = ({ value, onValueChange, defaultSize = 5, amountOfOptions = 4 }: TableSizeSelectorProps) => {
    const array = Array.from({ length: amountOfOptions }, (_, i) => ((i + 1) * defaultSize));
    return <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="set-pagination">
            <SelectValue placeholder="Table Size" />
        </SelectTrigger>
        <SelectContent>
            {array.map((e) => <SelectItem key={e} value={String(e)}>{e}</SelectItem>)}
        </SelectContent>
    </Select>
}

export const InvoiceSelector = ({ value, onValueChange }: SelectorProps) => {
    return <Select value={value} onValueChange={onValueChange} >
        <SelectTrigger id="invoice-status-filter" className="w-full">
            <SelectValue placeholder="Select a status" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
    </Select>
}

export const ClientStatusSelector = ({ value, onValueChange }: SelectorProps) => {
    return <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="client-status">
            <SelectValue placeholder="Select a status" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
    </Select>
}
