import { toast } from "sonner"
import { useState } from "react"
import type { Client } from "@/types/types"
import { clientSchema } from "@/lib/schemas"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { revalidateLogic, useForm } from "@tanstack/react-form"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { createClient, getClients, updateClient } from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Card, CardTitle, CardHeader, CardContent, CardDescription } from "@/components/ui/card"
import { type ColumnDef } from "@tanstack/react-table"
import { GenerateForm, type FormFieldApi, type FormStructureItem, type ValidationErrorsRender } from "../_components/formCreator"
import { ClientStatusSelector } from "../_constants/selectors"
import { GenerateTable } from "../_components/tableCreator"
import { getClientStatusVariant } from "../_constants/badgeVariants"

type MutationLike<TVariables> = {
  mutateAsync: (variables: TVariables) => Promise<unknown>
}

type ClientFormProps = {
  setIsOpen: (open: boolean) => void
  selectedClient: Client | null
  setSelectedClient: (client: Client | null) => void
  isOpen: boolean
  updateClientMutation: MutationLike<{ id: number; data: Omit<Client, "id"> }>
  createClientMutation: MutationLike<Omit<Client, "id">>
}

const ClientForm = ({ setIsOpen, selectedClient, setSelectedClient, isOpen, updateClientMutation, createClientMutation }: ClientFormProps) => {

  const form = useForm({
    defaultValues: selectedClient
      ? {
        name: selectedClient?.name,
        company: selectedClient?.company,
        email: selectedClient?.email,
        phone: selectedClient?.phone,
        status: selectedClient?.status,
      } : {
        name: "",
        company: "",
        email: "",
        phone: "",
        status: "active",
      },
    validators: {
      onDynamic: clientSchema
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      if (selectedClient) {
        await updateClientMutation.mutateAsync({
          id: selectedClient.id,
          data: value,
        })
      } else {
        await createClientMutation.mutateAsync(value)
      }
      form.reset()
      setIsOpen(false)
      setSelectedClient(null)
    }
  })
  const formStructure: FormStructureItem[] = [
    {
      type: "field",
      name: "name",
      validators: {
        onChange: ({ value }: { value: string }) => value.includes('a') ? "Name cannot includes 'a'" : null
      },
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
      ),
    },
    {
      type: "field",
      name: "company",
      children: (field: FormFieldApi, children: ValidationErrorsRender) => (
        <div>
          <Label htmlFor={field.name}>Company</Label>
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
    },
    {
      type: "field",
      name: "email",
      children: (field: FormFieldApi, children: ValidationErrorsRender) => (
        <div>
          <Label htmlFor={field.name}>Email</Label>
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
    },
    {
      type: "field",
      name: "phone",
      children: (field: FormFieldApi, children: ValidationErrorsRender) => (
        <div>
          <Label htmlFor={field.name}>Phone</Label>
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
    },
    {
      type: "field",
      name: "status",
      children: (field: FormFieldApi, children: ValidationErrorsRender) => (
        <div>
          <Label htmlFor="client-status">Status</Label>
          <ClientStatusSelector value={String(field.state.value)} onValueChange={field.handleChange} />
          {children(field)}
        </div>
      )
    },
    {
      type: "subscribe",
      selector: (state) => state,
      children: (state) => (
        <div>
          { }
          <Button type="submit" disabled={!state.canSubmit}>
            {status ? "Saving..." : "Save Client"}
          </Button>
          <Button type="button" onClick={() => { setIsOpen(false); setSelectedClient(null) }}>Cancel</Button>
        </div>
      )
    }
  ]

  return <Dialog open={isOpen} onOpenChange={() => { setIsOpen(false); setSelectedClient(null) }}>
    <DialogContent>
      <DialogTitle>{selectedClient ? 'Edit client' : 'Create client'}</DialogTitle>
      <DialogDescription>
        Make changes to client profile.
      </DialogDescription>
      {GenerateForm({ form, formStructure })}
    </DialogContent>
  </Dialog>
}

export function ClientsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Client, "id"> }) =>
      updateClient(id, data),
    onSuccess: () => {
      toast.success("Client Updated")
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
    onError: () => {
      toast.error("Error when updating client")
    }
  })
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Client Created")
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
    onError: () => {
      toast.error("Error when creating client")
    }
  })


  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Name",
      filterFn: 'includesString',
      enableSorting: true,
    },
    {
      accessorKey: "company",
      header: "Company",
      filterFn: 'includesString',
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      filterFn: 'includesString',
      enableSorting: true,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      filterFn: 'includesString',
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge className={getClientStatusVariant(row.original.status)}>{row.original.status}</Badge>,
      filterFn: 'includesString',
      enableSorting: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div>
          <Button onClick={() => { setSelectedClient(row.original); setIsOpen(true) }}>Edit</Button>
          <Button onClick={() => navigate(`/clients/${row.original.id}`)}>View</Button>
        </div>
      ),
    },
  ]

  const { data: clients, isLoading, isError, error } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  })

  if (isError) { return <p>{error.message}</p> }

  return (
    <section>
      <Card>
        <CardHeader className="w-full">
          <CardTitle><h1>Clients</h1></CardTitle>
          <div className="flex gap-2">
            <Button className="flex grow-12" onClick={() => { setIsOpen(true); setSelectedClient(null) }} >
              Add Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {
            isLoading
              ? <p>Loading clients...</p>
              : clients?.length
                ? <GenerateTable columns={columns} data={clients} filteredTable={true} paginatedTable={true} sortedTable={true} />
                : <CardDescription><h3>No clients yet. Add your first client to get started.</h3></CardDescription>
          }
        </CardContent>
      </Card>
      {
        isOpen
          ? <ClientForm
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setSelectedClient={setSelectedClient}
            selectedClient={selectedClient}
            updateClientMutation={updateClientMutation}
            createClientMutation={createClientMutation}
          />
          : null
      }
    </section>
  )
}
