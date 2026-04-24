import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClient, getInvoicesByProjectId, getProject, getTasksByProjectId } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

export function ProjectSinglePage() {
    const { id } = useParams()
    const projectId = Number(id)

    const { data: project } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId),
        enabled: !!projectId,
    })
    const { data: client } = useQuery({
        queryKey: ["client", project?.clientId],
        queryFn: () => getClient(project?.clientId!),
        enabled: !!project?.clientId,
    })

    const { data: tasks } = useQuery({
        queryKey: ["tasks", "project", projectId],
        queryFn: () => getTasksByProjectId(projectId),
        enabled: !!projectId,
    })
        
    const { data: invoices } = useQuery({
        queryKey: ["invoices", "project", projectId],
        queryFn: () => getInvoicesByProjectId(projectId),
        enabled: !!projectId,
    })


    const relatedTasks = (tasks ?? []).filter(
        (task) => task.projectId === projectId
    )

    const relatedInvoices = (invoices ?? []).filter(
        (invoice) => invoice.projectId == projectId
    )

    const totalTasks = relatedTasks.length
    const openTasks = relatedTasks.filter((task) => task.status !== "done").length
    const totalInvoices = relatedInvoices?.length

    const outstandingAmount = relatedInvoices
        ?.filter((invoice) => invoice.status === "unpaid" || invoice.status === "overdue")
        ?.reduce((sum, invoice) => sum + invoice.amount, 0)

    function getProjectStatusVariant(status: string) {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 border-green-200"
            case "active":
                return "bg-amber-100 text-amber-800 border-amber-200"
            case "planning":
                return "bg-blue-100 text-blue-800 border-blue-200"
            default:
                return ""
        }
    }

    return (<main className="space-y-6">
        <section>
            <Link to="/projects" className="text-blue-600 hover:underline">&larr; Back to Projects</Link>
            <h1>Project Details</h1>
            <p>View project progress, related tasks, and invoice activity.</p>
        </section>

        <Card>
            <CardHeader>
                <CardTitle>{project?.name}</CardTitle>
                <CardDescription>{client?.name ?? "Unknown client"}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Budget: {formatCurrency(project?.budget || 0)}</p>
                <p>Due date: {formatDate(project?.dueDate || "")}</p>
                <Badge className={getProjectStatusVariant(project?.status || "")}>{project?.status}</Badge>
            </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardDescription>Total Tasks</CardDescription>
                    <CardTitle>{totalTasks}</CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Open Tasks</CardDescription>
                    <CardTitle>{openTasks}</CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Total Invoices</CardDescription>
                    <CardTitle>{totalInvoices}</CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription>Outstanding Amount</CardDescription>
                    <CardTitle>{formatCurrency(outstandingAmount)}</CardTitle>
                </CardHeader>
            </Card>
        </section>

        <Card>
            <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Tasks related to this project.</CardDescription>
            </CardHeader>
            <CardContent>
                {relatedTasks.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relatedTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell><Badge>{task.status}</Badge></TableCell>
                                    <TableCell><Badge>{task.priority}</Badge></TableCell>
                                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p>No tasks found for this project.</p>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Invoices related to this project.</CardDescription>
            </CardHeader>
            <CardContent>
                {relatedInvoices.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Issue Date</TableHead>
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relatedInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.id}</TableCell>
                                    <TableCell><Badge>{invoice.status}</Badge></TableCell>
                                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p>No invoices found for this project.</p>
                )}
            </CardContent>
        </Card>
    </main>
    )
}
