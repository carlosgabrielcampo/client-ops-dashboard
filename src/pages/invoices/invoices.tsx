import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvoices, updateInvoices, createInvoices, getClients, getProjects } from "@/lib/api";
import { invoiceSchema } from "@/lib/schemas";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Client, Invoice, Project } from "@/types/types";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { GenerateForm, type FormFieldApi, type FormStructureItem, type ValidationErrorsRender } from "../_components/formCreator";
import { InvoiceSelector } from "../_constants/selectors";
import { getInvoiceStatusClass } from "../_constants/badgeVariants";
import { GenerateTable } from "../_components/tableCreator";

type MutationLike<TVariables> = {
  mutateAsync: (variables: TVariables) => Promise<unknown>
  isPending: boolean
}

type InvoiceFormProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedInvoice: Invoice | null
  setSelectedInvoice: (invoice: Invoice | null) => void
  clients?: Client[]
  projects?: Project[]
  updateInvoiceMutation: MutationLike<{ id: number; data: Omit<Invoice, "id"> }>
  createInvoiceMutation: MutationLike<Omit<Invoice, "id">>
}


const InvoiceForm = ({
  isOpen,
  setIsOpen,
  selectedInvoice,
  setSelectedInvoice,
  clients,
  projects,
  updateInvoiceMutation,
  createInvoiceMutation
}: InvoiceFormProps) => {

  const form = useForm({
    defaultValues: selectedInvoice
      ? {
        clientId: selectedInvoice.clientId,
        projectId: selectedInvoice.projectId,
        amount: selectedInvoice.amount,
        status: selectedInvoice.status,
        issueDate: selectedInvoice.issueDate,
        dueDate: selectedInvoice.dueDate
      }
      : {
        clientId: 0,
        projectId: 0,
        amount: 0,
        status: "draft",
        issueDate: "",
        dueDate: ""
      },
    validators: {
      onChange: invoiceSchema
    },
    onSubmit: async ({ value }) => {
      if (selectedInvoice) {
        await updateInvoiceMutation.mutateAsync({
          id: selectedInvoice.id,
          data: value,
        })
      } else {
        await createInvoiceMutation.mutateAsync(value)
      }
      form.reset()
      setIsOpen(false)
      setSelectedInvoice(null)
    }
  })
  const formStructure: FormStructureItem[] = [{
    type: "field",
    name: "clientId",
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
    type: "field",
    name: "projectId",
    children: (field: FormFieldApi, children: ValidationErrorsRender) => (
      <div>
        <Label htmlFor="projectId">Project</Label>
        <Select
          value={String(field.state.value)}
          onValueChange={(value) => field.handleChange(Number(value))}
        >
          <SelectTrigger id="projectId">
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
    type: "field",
    name: "status",
    children: (field: FormFieldApi, children: ValidationErrorsRender) => (
      <div>
        <Label htmlFor="invoice-form-status">Status</Label>
        <InvoiceSelector value={String(field.state.value)} onValueChange={field.handleChange} />
        {children(field)}
      </div>
    )
  }, {
    type: "field",
    name: "amount",
    children: (field: FormFieldApi, children: ValidationErrorsRender) => (
      <div>
        <Label htmlFor={field.name}>Amount</Label>
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
    type: "field",
    name: "dueDate",
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
  }, {
    type: "field",
    name: "issueDate",
    children: (field: FormFieldApi, children: ValidationErrorsRender) => (
      <div>
        <Label htmlFor={field.name}>Issue Date</Label>
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
    <Button type="submit" disabled={createInvoiceMutation.isPending}>
      {createInvoiceMutation.isPending ? "Saving..." : "Save Invoice"}
    </Button>
    <Button type="button" onClick={() => { setIsOpen(false); setSelectedInvoice(null) }}>Cancel</Button>
  </div>

  return (
    <Dialog open={isOpen} onOpenChange={() => { setIsOpen(false); setSelectedInvoice(null) }}>
      <DialogContent>
        <DialogTitle>{selectedInvoice ? 'Edit invoice' : 'Create invoice'}</DialogTitle>
        <DialogDescription>
          Make changes to the invoice details.
        </DialogDescription>
        {GenerateForm({ form, formStructure, footer })}
      </DialogContent>
    </Dialog>
  )
}

export function InvoicesPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [statusFilter] = useState("")

  const queryClient = useQueryClient()
  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Invoice, "id"> }) =>
      updateInvoices(id, data),
    onSuccess: () => {
      toast.success("Invoice Updated")
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    },
    onError: () => {
      toast.error("Error when updating invoice")
    }
  })

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoices,
    onSuccess: () => {
      toast.success("Invoice Created")
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    },
    onError: () => {
      toast.error("Error when creating invoice")
    }
  })

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  })

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  })

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "clientId",
      header: "Client",
      cell: ({ row }) => {
        const client = clients?.find((client) => client.id == row.original.clientId)
        return client ? `${client.name} - ${client.company}` : "Unknown client"
      }
    },
    {
      accessorKey: "projectId",
      header: "Project",
      cell: ({ row }) => {
        const project = projects?.find((project) => project.id == row.original.projectId)
        return project ? `${project.name}` : "Unknown project"
      }
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount)
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        <Badge
          className={getInvoiceStatusClass(row.original.status)}
        >{
            row.original.status
          }</Badge>,
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) => formatDate(row.original.issueDate)
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.dueDate)
    },
    {
      header: 'Actions',
      cell: ({ row }) => <Button
        onClick={() => {
          setSelectedInvoice(row.original)
          setIsOpen(true)
        }}
      >
        Edit
      </Button>
    }
  ]

  const {
    data: invoices,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  })

  const filteredInvoices = useMemo(() => {
    const query = statusFilter.trim().toLowerCase()
    if (!query) return invoices ?? []
    return (invoices ?? []).filter((project) => {
      return (
        project.status.toLowerCase().includes(query)
      )
    })
  }, [invoices, statusFilter])

  if (isError) {
    return <p>{error.message}</p>
  }


  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle><h1>Invoices</h1></CardTitle>
            <Button onClick={() => { setIsOpen(true); setSelectedInvoice(null) }}>Add Invoice</Button>
        </CardHeader>
        <CardContent>
          {
            isLoading
              ? <p>Loading invoices...</p>
              : filteredInvoices?.length
                ? <GenerateTable data={filteredInvoices} columns={columns} />
                : statusFilter
                  ? <CardDescription><h3>No invoices found with the current status.</h3></CardDescription>
                  : <CardDescription><h3>No invoices yet. Create your first invoice to track payments.</h3></CardDescription>

          }
        </CardContent>
      </Card>
      {
        isOpen
          ? <InvoiceForm
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            setSelectedInvoice={setSelectedInvoice}
            selectedInvoice={selectedInvoice}
            clients={clients}
            projects={projects}
            updateInvoiceMutation={updateInvoiceMutation}
            createInvoiceMutation={createInvoiceMutation}
          />
          : null
      }
    </section>
  )
}
