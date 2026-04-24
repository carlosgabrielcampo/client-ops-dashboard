import { Routes, Route, NavLink } from "react-router-dom"
import { InvoicesPage } from "./pages/invoices/invoices"
import { DashboardPage } from "./pages/dashboard/dashboard"
import { ClientsPage } from "./pages/client/clients"
import { ProjectsPage } from "./pages/projects/projects"
import { TasksPage } from "./pages/tasks/tasks"
import { ClientSinglePage } from "./pages/client/[id]/clientSingle"
import { ProjectSinglePage } from "./pages/projects/[id]/projectSingle"
import { TestPage } from "./pages/tests"
import { OperationsPage } from "./pages/operations/operationsPage"


export default function App() {
  function navClass(isActive: boolean) {
    return isActive
      ? "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground"
      : "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
  }

  return (
    <>
      <nav className="flex items-center gap-2">
        <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>Dashboard</NavLink>
        <NavLink to="/clients" className={({ isActive }) => navClass(isActive)}>Clients</NavLink>
        <NavLink to="/projects" className={({ isActive }) => navClass(isActive)}>Projects</NavLink>
        <NavLink to="/invoices" className={({ isActive }) => navClass(isActive)}>Invoices</NavLink>
        <NavLink to="/tasks" className={({ isActive }) => navClass(isActive)}>Tasks</NavLink>
        <NavLink to="/operations" className={({ isActive }) => navClass(isActive)}>Operations</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients/:id" element={<ClientSinglePage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/projects/:id" element={<ProjectSinglePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </>
  )
}
