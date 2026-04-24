import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getClients, getProjects, getTasks, getInvoices } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export function DashboardPage() {
  const {
    data: clients,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  })
  const {
    data: projects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  })
  const {
    data: tasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  })
  const {
    data: invoices,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  })

  const totalClients = clients?.length ?? 0

  const activeClients =
    clients?.filter((client) => client.status === "active").length ?? 0

  const leads =
    clients?.filter((client) => client.status === "lead").length ?? 0

  const activeProjects =
    projects?.filter((project) => project.status === "active").length ?? 0

  const planningProjects =
    projects?.filter((project) => project.status === "planning").length ?? 0

  const completedProjects =
    projects?.filter((project) => project.status === "completed").length ?? 0

  const openTasks =
    tasks?.filter((task) => task.status !== "done").length ?? 0

  const inProgressTasks =
    tasks?.filter((task) => task.status === "in-progress").length ?? 0

  const todoTasks =
    tasks?.filter((task) => task.status === "todo").length ?? 0

  const outstandingInvoices =
    invoices?.filter(
      (invoice) => invoice.status === "unpaid" || invoice.status === "overdue"
    ) ?? []

  const outstandingCount = outstandingInvoices.length

  const outstandingRevenue = outstandingInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  )

  const overdueInvoices =
    invoices?.filter((invoice) => invoice.status === "overdue").length ?? 0

  return <main>
    <h1>Dashboard</h1>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Clients</CardDescription>
          <CardTitle className="text-3xl">{totalClients}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {activeClients} active and {leads} leads in the pipeline
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Active Projects</CardDescription>
          <CardTitle className="text-3xl">{activeProjects}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {planningProjects} planning and {completedProjects} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Open Tasks</CardDescription>
          <CardTitle className="text-3xl">{openTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {inProgressTasks} in progress and {todoTasks} to do
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Outstanding Invoices</CardDescription>
          <CardTitle className="text-3xl">
            ${outstandingRevenue.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {outstandingCount} open invoices, including {overdueInvoices} overdue
          </p>
        </CardContent>
      </Card>
    </div>
  </main>
}