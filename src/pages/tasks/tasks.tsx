import { useMemo, useState } from "react";
import type { Project, Task } from "@/types/types"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTasks, updateTasks, getTasks, getProjects } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { taskSchema } from "@/lib/schemas";
import { GenerateForm, type FormFieldApi, type FormStructureItem, type ValidationErrorsRender } from "../_components/formCreator";
import { PrioritySelector, TaskStatusSelector } from "../_constants/selectors";
import { getTaskPriorityVariant, getTaskStatusVariant } from "../_constants/badgeVariants";
import { GenerateTable } from "../_components/tableCreator";

type MutationLike<TVariables> = {
    mutateAsync: (variables: TVariables) => Promise<unknown>
    isPending: boolean
}

type TaskFormProps = {
    setIsOpen: (open: boolean) => void
    selectedTask: Task | null
    setSelectedTask: (task: Task | null) => void
    isOpen: boolean
    projects?: Project[]
    updatetaskMutation: MutationLike<{ id: number; data: Omit<Task, "id"> }>
    createtaskMutation: MutationLike<Omit<Task, "id">>
}

const TaskForm = ({
    setIsOpen,
    selectedTask,
    setSelectedTask,
    isOpen,
    projects,
    updatetaskMutation,
    createtaskMutation
}: TaskFormProps) => {
    const form = useForm({
        defaultValues: selectedTask
            ? {
                projectId: selectedTask.projectId,
                title: selectedTask.title,
                status: selectedTask.status,
                priority: selectedTask.priority,
                dueDate: selectedTask.dueDate,
            }
            : {
                projectId: 0,
                title: "",
                status: "todo",
                priority: "low",
                dueDate: "",
            },
        validators: {
            onChange: taskSchema
        },
        onSubmit: async ({ value }) => {
            if (selectedTask) {
                await updatetaskMutation.mutateAsync({
                    id: selectedTask.id,
                    data: value,
                })
            } else {
                await createtaskMutation.mutateAsync(value)
            }
            form.reset()
            setIsOpen(false)
            setSelectedTask(null)
        }

    })
    const formStructure: FormStructureItem[] = [{
        name: "projectId",
        type: "field",
        children: (field: FormFieldApi, children: ValidationErrorsRender) => (
            <div>
                <Label htmlFor="task-project">Project</Label>
                <Select
                    value={String(field.state.value)}
                    onValueChange={(value) => field.handleChange(Number(value))}
                >
                    <SelectTrigger id="task-project">
                        <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                        {(projects ?? []).map((e: Project) =>
                            <SelectItem key={e.id} value={String(e.id)}>
                                {e.name}
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
                {children(field)}
            </div>
        )
    }, {
        name: "title",
        type: "field",
        children: (field: FormFieldApi, children: ValidationErrorsRender) => (
            <div>
                <Label htmlFor={field.name}>Title</Label>
                <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                />
                {children(field)}
            </div>
        )
    }, {
        name: "status",
        type: "field",
        children: (field: FormFieldApi, children: ValidationErrorsRender) => (
            <div>
                <Label htmlFor="task-status">Status</Label>
                <TaskStatusSelector value={String(field.state.value)} onValueChange={field.handleChange} />
                {children(field)}
            </div>
        )
    }, {
        name: "priority",
        type: "field",
        children: (field: FormFieldApi, children: ValidationErrorsRender) => (
            <div>
                <Label htmlFor="task-priority">Priority</Label>
                <PrioritySelector value={String(field.state.value)} onValueChange={field.handleChange} />
                {children(field)}
            </div>
        )
    }, {
        name: "priority",
        type: "field",
        children: (field: FormFieldApi, children: ValidationErrorsRender) => (
            <div>
                <Label htmlFor={field.name}>Due Date</Label>
                <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                />
                {children(field)}
            </div>
        )
    }
    ]
    const footer = <div>
        <Button type="submit" disabled={createtaskMutation.isPending}>
            {createtaskMutation.isPending ? "Saving..." : "Save task"}
        </Button>
        <Button type="button" onClick={() => { setIsOpen(false); setSelectedTask(null) }}>Cancel</Button>
    </div>
    return (
        <Dialog
            open={isOpen}
            onOpenChange={() => {
                setIsOpen(false);
                setSelectedTask(null)
            }}
        >
            <DialogContent>
                <DialogTitle>{selectedTask ? 'Edit task' : 'Create task'}</DialogTitle>
                <DialogDescription>
                    Make changes to the task details.
                </DialogDescription>
                {GenerateForm({ form, footer, formStructure })}
            </DialogContent>
        </Dialog>

    )
}

export function TasksPage() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [statusFilter] = useState("")
    const [priorityFilter] = useState("")
    const queryClient = useQueryClient()
    const updatetaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Omit<Task, "id"> }) =>
            updateTasks(id, data),
        onSuccess: () => {
            toast.success("Task Updated")
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
        onError: () => {
            toast.error("Error when updating task")
        }
    })
    const createtaskMutation = useMutation({
        mutationFn: createTasks,
        onSuccess: () => {
            toast.success("Task Created")
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
        onError: () => {
            toast.error("Error when creating task")
        }
    })
    const { data: projects } = useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
    })
    const {
        data: tasks,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["tasks"],
        queryFn: getTasks,
    })

    const columns: ColumnDef<Task>[] = [
        {
            accessorKey: "projectId",
            header: "Project",
            cell: ({ row }) => {
                const project = projects?.find((project) => project.id == row.original.projectId)
                return project ? `${project.name}` : "Unknown project"
            }
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <Badge className={getTaskStatusVariant(row.original.status)}>{row.original.status}</Badge>,
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => <Badge className={getTaskPriorityVariant(row.original.priority)}>{row.original.priority}</Badge>,
        },
        {
            accessorKey: "dueDate",
            header: "Due Date",
            cell: ({ row }) => formatDate(row.original.dueDate)
        },
        {
            header: "Edit",
            cell: ({ row }) => <Button onClick={() => { setSelectedTask(row.original); setIsOpen(true) }}>Edit</Button>
        }
    ]

    const filteredTasks = useMemo(() => {
        const statusQuery = statusFilter.trim().toLowerCase()
        const priorityQuery = priorityFilter.trim().toLowerCase()
        if (!statusQuery && !priorityQuery) return tasks ?? []
        return (tasks ?? []).filter((task) => {
            return [
                statusQuery ? task.status.trim().toLowerCase().includes(statusQuery) : true,
                priorityQuery ? task.priority.trim().toLowerCase().includes(priorityQuery) : true
            ].every((e) => e)
        })
    }, [tasks, statusFilter, priorityFilter])

    if (isError) {
        return <p>{error.message}</p>
    }

    return (
        <section>
            <Card>
                <CardHeader>
                    <CardTitle><h1>Tasks</h1></CardTitle>
                    <Button onClick={() => { setIsOpen(true); setSelectedTask(null) }} >
                        Add task
                    </Button>
                </CardHeader>
                <CardContent>
                    {
                        isLoading
                            ? <p>Loading tasks...</p>
                            : filteredTasks?.length
                                ? <GenerateTable columns={columns} data={filteredTasks} filteredTable={true} paginatedTable={true} sortedTable={true} />
                                : (statusFilter || priorityFilter)
                                    ? <CardDescription><h3>No tasks found with the current filters.</h3></CardDescription>
                                    : <CardDescription><h3>No tasks yet. Add a task to start organizing project work.</h3></CardDescription>
                    }
                </CardContent>
            </Card>
            {
                isOpen
                    ? <TaskForm
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        setSelectedTask={setSelectedTask}
                        selectedTask={selectedTask}
                        projects={projects}
                        updatetaskMutation={updatetaskMutation}
                        createtaskMutation={createtaskMutation}
                    />
                    : null
            }
        </section>
    )
}
