import { useMemo, useState } from "react";
import type { Client, Project } from "@/types/types"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClients, getProjects, createProjects, updateProjects } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { projectSchema } from "@/lib/schemas";
import { useNavigate } from "react-router-dom";
import { GenerateForm, type FormFieldApi, type FormStructureItem, type ValidationErrorsRender } from "../_components/formCreator";
import { GenerateTable } from "../_components/tableCreator";

type MutationLike<TVariables> = {
  mutateAsync: (variables: TVariables) => Promise<unknown>
  isPending: boolean
}

type ProjectFormProps = {
  setIsOpen: (open: boolean) => void
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
  isOpen: boolean
  clients?: Client[]
  updateProjectMutation: MutationLike<{ id: number; data: Omit<Project, "id"> }>
  createProjectMutation: MutationLike<Omit<Project, "id">>
}

const ProjectForm = ({
  setIsOpen,
  selectedProject,
  setSelectedProject,
  isOpen,
  clients,
  updateProjectMutation,
  createProjectMutation
}: ProjectFormProps) => {

  const form = useForm({
    defaultValues: selectedProject
      ? {
        clientId: selectedProject.clientId,
        name: selectedProject.name,
        status: selectedProject.status,
        budget: selectedProject.budget,
        dueDate: selectedProject.dueDate,
      }
      : {
        clientId: 0,
        name: "",
        status: "active",
        budget: 0,
        dueDate: "",
      },
    validators: {
      onChange: projectSchema
    },
    onSubmit: async ({ value }) => {
      if (selectedProject) {
        await updateProjectMutation.mutateAsync({
          id: selectedProject.id,
          data: value,
        })
      } else {
        await createProjectMutation.mutateAsync(value)
      }
      form.reset()
      setIsOpen(false)
      setSelectedProject(null)
    }
  })

  const formStructure: FormStructureItem[] = [{
    name: "clientId",
    type: "field",
    children: (field: FormFieldApi, children: ValidationErrorsRender) => (
      <div>
        <Label htmlFor="clientId">Client</Label>
        <Select
          value={String(field.state.value)}
          onValueChange={(value) => field.handleChange(Number(value))}
        >
          <SelectTrigger id="clientId">
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {(clients ?? []).map((e: Client) =>
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
    name: "name",
    type: "field",
    children: (field: FormFieldApi, children: ValidationErrorsRender) => (
      <div>
        <Label htmlFor={field.name}>Name</Label>
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
        <Label htmlFor="project-form-status">Status</Label>
        <Select
          value={String(field.state.value)}
          onValueChange={field.handleChange}
        >
          <SelectTrigger id="project-form-status">
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {children(field)}
      </div>
    )
  }, {
    name: "budget",
    type: "field",
    children: (field: FormFieldApi, children: ValidationErrorsRender) => (
      <div>
        <Label htmlFor={field.name}>Budget</Label>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(Number(e.target.value))}
        />
        {children(field)}
      </div>
    )
  }, {
    name: "dueDate",
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
  }]

  const footer = <div>
    <Button type="submit" disabled={createProjectMutation.isPending}>
      {createProjectMutation.isPending ? "Saving..." : "Save Project"}
    </Button>
    <Button type="button" onClick={() => { setIsOpen(false); setSelectedProject(null) }}>Cancel</Button>
  </div>

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false);
        setSelectedProject(null)
      }}
    >
      <DialogContent>
        <DialogTitle>{selectedProject ? 'Edit project' : 'Create project'}</DialogTitle>
        <DialogDescription>
          Make changes to the project details.
        </DialogDescription>
        {GenerateForm({ form, formStructure, footer })}
      </DialogContent>
    </Dialog>

  )
}

export function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [statusFilter] = useState("")
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Project, "id"> }) =>
      updateProjects(id, data),
    onSuccess: () => {
      toast.success("Project Updated")
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: () => {
      toast.error("Error when updating project")
    }
  })
  const createProjectMutation = useMutation({
    mutationFn: createProjects,
    onSuccess: () => {
      toast.success("Project Created")
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: () => {
      toast.error("Error when creating project")
    }
  })
  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  })
  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  })

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
  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }) => {
        const client = clients?.find((client) => client.id == row.original.clientId)
        return client ? `${client.name} - ${client.company}` : "Unknown client"
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge className={getProjectStatusVariant(row.original.status)}>{row.original.status}</Badge>,
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => formatCurrency(row.original.budget)
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.dueDate)
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div>
            <Button onClick={() => { setSelectedProject(row.original); setIsOpen(true) }}>Edit</Button>
            <Button onClick={() => navigate(`/projects/${row.original.id}`)}>
              View
            </Button>
          </div>
        )
      },
    },
  ]

  const filteredProjects = useMemo(() => {
    const query = statusFilter.trim().toLowerCase()
    if (!query) return projects ?? []
    return (projects ?? []).filter((project) => {
      return (
        project.status.toLowerCase().includes(query)
      )
    })
  }, [projects, statusFilter])

  if (isError) {
    return <p>{error.message}</p>
  }


  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle><h1>Projects</h1></CardTitle>
          <Button onClick={() => { setIsOpen(true); setSelectedProject(null) }}>Add Project</Button>
        </CardHeader>
        <CardContent>
          {
            isLoading
              ? <p>Loading projects...</p>
              : filteredProjects?.length
                ? <GenerateTable columns={columns} data={filteredProjects} />
                : statusFilter
                  ? <CardDescription><h3>No projects found with the current status.</h3></CardDescription>
                  : <CardDescription><h3>No projects found. Create a project to track active work.</h3></CardDescription>
          }
        </CardContent>
      </Card>
      {
        isOpen
          ? <ProjectForm
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setSelectedProject={setSelectedProject}
            selectedProject={selectedProject}
            clients={clients}
            updateProjectMutation={updateProjectMutation}
            createProjectMutation={createProjectMutation}
          />
          : null
      }
    </section>
  )
}
