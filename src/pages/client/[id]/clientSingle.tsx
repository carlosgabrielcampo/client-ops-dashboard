import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getClient, getInvoicesByClientId, getProjectsByClientId } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

export function ClientSinglePage() {
    const { id } = useParams()
    const clientId = Number(id)

    const { data: client } = useQuery({
        queryKey: ["client", clientId],
        queryFn: () => getClient(clientId),
        enabled: !!clientId,
    })

    const { data: projects } = useQuery({
        queryKey: ["projects", "client", clientId],
        queryFn: () => getProjectsByClientId(clientId),
        enabled: !!clientId,
    })

    const { data: invoices } = useQuery({
        queryKey: ["invoices", "client", clientId],
        queryFn: () => getInvoicesByClientId(clientId),
        enabled: !!clientId,
    })

    const relatedProjects = (projects ?? []).filter(
        (project) => project.clientId === clientId
    )

    const relatedInvoices = (invoices ?? []).filter(
        (invoice) => invoice.clientId === clientId
    )

    const totalProjects = relatedProjects.length
    const activeProjects = relatedProjects.filter(
        (project) => project.status === "active"
    ).length

    const totalInvoices = relatedInvoices.length
    const outstandingRevenue = relatedInvoices
        .filter((invoice) => invoice.status === "unpaid" || invoice.status === "overdue")
        .reduce((sum, invoice) => sum + invoice.amount, 0)

    function getClientStatusVariant(status: string) {
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
    return (
        <main className="space-y-6">
            <section>
                <Link to="/clients" className="text-blue-600 hover:underline">&larr; Back to Clients</Link>
                <h1>Client Details</h1>
                <p>View client information, related projects, and invoice activity.</p>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>{client?.name}</CardTitle>
                    <CardDescription>{client?.company}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{client?.email}</p>
                    <p>{client?.phone}</p>
                    <Badge className={getClientStatusVariant(client?.status || "")}>{client?.status}</Badge>
                </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Total Projects</CardDescription>
                        <CardTitle>{totalProjects}</CardTitle>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardDescription>Active Projects</CardDescription>
                        <CardTitle>{activeProjects}</CardTitle>
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
                        <CardDescription>Outstanding Revenue</CardDescription>
                        <CardTitle>{formatCurrency(outstandingRevenue)}</CardTitle>
                    </CardHeader>
                </Card>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Projects related to this client.</CardDescription>
                </CardHeader>
                <CardContent>
                    {relatedProjects.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Budget</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {relatedProjects.map((project) => (
                                    <TableRow key={project.id}>
                                        <TableCell>{project.name}</TableCell>
                                        <TableCell><Badge className={getProjectStatusVariant(project.status)}>{project.status}</Badge></TableCell>
                                        <TableCell>{formatCurrency(project.budget)}</TableCell>
                                        <TableCell>{formatDate(project.dueDate)}</TableCell>
                                        <TableCell>
                                            <Link to={`/projects/${project.id}`}>
                                                <button className="text-blue-600 hover:underline">View</button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>No projects found for this client.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Invoices related to this client.</CardDescription>
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
                        <p>No invoices found for this client.</p>
                    )}
                </CardContent>
            </Card>
        </main>

    )
}
