import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getClients, getProjects, getProjectsByClientId } from "@/lib/api"
import { type ProjectFormValues, projectSchema } from "@/lib/schemas"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Client, Project } from "@/types/types"
import { useForm } from "@tanstack/react-form"
import { useQuery } from "@tanstack/react-query"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

function fieldError(field: {
    state: {
        meta: {
            isTouched: boolean
            errors: unknown[]
        }
    }
}) {
    if (!field.state.meta.isTouched || field.state.meta.errors.length === 0) {
        return null
    }

    return (
        <p className="text-sm text-red-600">
            {field.state.meta.errors
                .map((error) =>
                    typeof error === "string"
                        ? error
                        : typeof error === "object" && error !== null && "message" in error
                            ? String(error.message)
                            : ""
                )
                .filter(Boolean)
                .join(", ")}
        </p>
    )
}

function statusBadgeClass(status: string) {
    switch (status) {
        case "active":
            return "bg-amber-100 text-amber-800 border-amber-200"
        case "planning":
            return "bg-blue-100 text-blue-800 border-blue-200"
        case "completed":
            return "bg-green-100 text-green-800 border-green-200"
        default:
            return ""
    }
}

export function TestPage() {
    const [selectedClientId, setSelectedClientId] = useState(0)
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    })
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        dueDate: true,
        budget: true,
        status: true,
        client: true,
        name: true,
    })

    const clientsQuery = useQuery({
        // `queryKey` uniquely identifies this cache entry inside TanStack Query.
        queryKey: ["clients"],
        // `queryFn` is the async function that fetches the data.
        queryFn: getClients,
        // `staleTime` keeps the data fresh for 60 seconds before refetching on reuse.
        staleTime: 1000 * 60,
        // `gcTime` controls how long unused cached data stays in memory.
        gcTime: 1000 * 60 * 5,
        // `refetchOnWindowFocus` disables automatic refetch when the browser tab gets focus again.
        refetchOnWindowFocus: false,
        // `refetchOnReconnect` decides if the query should refetch when the network comes back.
        refetchOnReconnect: true,
        // `refetchOnMount` decides if the query should refetch again when this component remounts.
        refetchOnMount: false,
        // `retryDelay` controls the wait time between retry attempts.
        retryDelay: 1000,
        // `networkMode` changes how the query behaves when offline.
        networkMode: "online",
        // `notifyOnChangeProps` can reduce rerenders by tracking only selected result fields.
        notifyOnChangeProps: ["data", "error"],
        // `select` lets you transform the fetched data before the component receives it.
        select: (data) => data.filter((client) => client.status === "active"),
        // `meta` stores extra custom information alongside the query definition.
        meta: { feature: "tests-page", resource: "clients" },
    })

    const projectsQuery = useQuery({
        // A different key means a different cache bucket.
        queryKey: ["projects"],
        // This fetches the full project list used by the table example.
        queryFn: getProjects,
        // Keep the list warm a little longer because it is reused in multiple tabs.
        staleTime: 1000 * 60,
        // `retry` tells the query how many times it should retry after a failure.
        retry: 1,
        // `refetchOnMount` avoids re-requesting if fresh cached data already exists.
        refetchOnMount: false,
        // `refetchOnReconnect` lets the table data refresh after connection loss.
        refetchOnReconnect: true,
        // `throwOnError` keeps errors in query state instead of throwing to an error boundary.
        throwOnError: false,
        // `retryDelay` can be a fixed number or a function for backoff strategies.
        retryDelay: 1200,
        // `networkMode` is useful when you want a query to pause or continue offline.
        networkMode: "online",
        // `select` is often used to sort, filter, or reshape server data for the UI.
        select: (data) => data.slice().sort((a, b) => a.name.localeCompare(b.name)),
        // `placeholderData` can provide fake or previous data before the real request resolves.
        placeholderData: [],
    })

    const clientProjectsQuery = useQuery({
        // Include the selected id in the key so each client has its own cached result.
        queryKey: ["projects", "client", selectedClientId],
        // The fetch function receives the selected client id from component state.
        queryFn: () => getProjectsByClientId(selectedClientId),
        // `enabled` prevents the query from running until a valid client is selected.
        enabled: selectedClientId > 0,
        // `placeholderData` keeps the previous result visible while the next client is loading.
        placeholderData: (previousData) => previousData,
        // `retry` limits noise for this demo when the dependent request fails.
        retry: 1,
        // `refetchOnReconnect` refreshes dependent data after the browser reconnects.
        refetchOnReconnect: true,
        // `throwOnError` leaves the error available on `clientProjectsQuery.error`.
        throwOnError: false,
        // `retryDelay` sets the pause before trying a failed dependent query again.
        retryDelay: 1000,
        // `networkMode` can be changed when you want special offline behavior.
        networkMode: "online",
        // `select` can derive a lighter data shape just for the current component.
        select: (data) => data.map((project) => ({
            id: project.id,
            name: project.name,
            status: project.status,
            dueDate: project.dueDate,
        })),
        // `meta` is handy when debugging or adding custom query instrumentation.
        meta: { feature: "dependent-query", dependsOn: "selectedClientId" },
    })

    const clientMap = useMemo(() => {
        return new Map((clientsQuery.data ?? []).map((client) => [client.id, client]))
    }, [clientsQuery.data])

    const columns = useMemo<ColumnDef<Project>[]>(() => {
        return [
            {
                // `accessorKey` tells TanStack Table which field from the row to read.
                accessorKey: "name",
                // `header` renders the header cell content for this column.
                header: "Project",
                // `enableGlobalFilter` allows this column to participate in the global search box.
                enableGlobalFilter: true,
                // `enableColumnFilter` allows this column to also participate in per-column filters.
                enableColumnFilter: true,
                // `cell` customizes how each body cell is rendered.
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">#{row.original.id}</p>
                    </div>
                ),
                // `meta` is often used for UI hints like alignment, widths, or export labels.
                meta: { align: "left", exportLabel: "Project name" },
                // `size` is the desired column width used by column sizing features.
                size: 260,
                // `minSize` prevents the column from shrinking below this width.
                minSize: 180,
            },
            {
                // `id` gives the column a stable internal name when no accessorKey exists.
                id: "client",
                // `header` renders the visible header label for this computed column.
                header: "Client",
                // `enableSorting` leaves this computed column sortable if you later add a sorting function.
                enableSorting: false,
                // `enableGlobalFilter` includes this computed client label in global search.
                enableGlobalFilter: true,
                // `cell` renders a value derived from related client data instead of a direct row field.
                cell: ({ row }) => {
                    return clientMap.get(row.original.clientId)?.name ?? "Unknown client"
                },
                // `filterFn` customizes how the global filter matches this column's content.
                filterFn: (row, _columnId, filterValue) => {
                    const clientName = clientMap.get(row.original.clientId)?.name ?? ""
                    return clientName.toLowerCase().includes(String(filterValue).toLowerCase())
                },
                // `meta` can be read later by custom table header or cell components.
                meta: { align: "left" },
                // `size` suggests a default width for this computed column.
                size: 220,
            },
            {
                accessorKey: "status",
                header: "Status",
                // `enableSorting` keeps sorting active explicitly for this column.
                enableSorting: true,
                // `enableGlobalFilter` lets the status text be matched by the global search.
                enableGlobalFilter: true,
                cell: ({ row }) => (
                    <Badge className={statusBadgeClass(row.original.status)}>
                        {row.original.status}
                    </Badge>
                ),
                // `meta` is a common place to stash design-system specific config.
                meta: { align: "center", badgeColumn: true },
                // `size` can help keep badge-like columns compact.
                size: 140,
            },
            {
                accessorKey: "budget",
                header: "Budget",
                // `sortingFn` picks a built-in numeric sort for this numeric column.
                sortingFn: "basic",
                // `enableGlobalFilter` can be disabled when searching numeric text is not useful.
                enableGlobalFilter: false,
                cell: ({ row }) => formatCurrency(row.original.budget),
                // `meta` can describe formatting expectations for reusable renderers.
                meta: { align: "right", format: "currency" },
                // `size` helps reserve enough width for formatted currency values.
                size: 160,
            },
            {
                accessorKey: "dueDate",
                header: "Due date",
                // `enableHiding` allows this column to be hidden if you later add column visibility controls.
                enableHiding: true,
                // `enableGlobalFilter` can be disabled for date columns if global search should stay simpler.
                enableGlobalFilter: false,
                cell: ({ row }) => formatDate(row.original.dueDate),
                // `meta` is useful for downstream helpers such as export or print views.
                meta: { align: "right", format: "date" },
                // `size` gives date columns a predictable width.
                size: 160,
            },
        ]
    }, [clientMap])

    const formDefaults: ProjectFormValues = {
        clientId: 0,
        name: "",
        status: "planning",
        budget: 0,
        dueDate: "",
    }

    const table = useReactTable({
        // `data` is the raw row array the table will render.
        data: projectsQuery.data ?? [],
        // `columns` describes headers, accessors, and custom cell rendering.
        columns,
        // `state` stores controlled table state such as sorting and filtering.
        state: {
            sorting,
            globalFilter,
            pagination,
            rowSelection,
            columnVisibility,
        },
        // `onSortingChange` lets the table update our React state when the user sorts.
        onSortingChange: setSorting,
        // `onGlobalFilterChange` keeps the search box in sync with TanStack Table state.
        onGlobalFilterChange: setGlobalFilter,
        // `onPaginationChange` keeps the current page and page size controlled in React state.
        onPaginationChange: setPagination,
        // `onRowSelectionChange` lets TanStack Table control selected rows through React state.
        onRowSelectionChange: setRowSelection,
        // `onColumnVisibilityChange` keeps column show/hide state controlled by React.
        onColumnVisibilityChange: setColumnVisibility,
        // `globalFilterFn` selects the built-in string matching strategy for searchable columns.
        globalFilterFn: "includesString",
        // `autoResetPageIndex` decides whether filtering/sorting should jump back to page 1 automatically.
        autoResetPageIndex: true,
        // `autoResetAll` resets all internal table state when the underlying data changes.
        autoResetAll: false,
        // `initialState` sets the first table state before the user interacts with it.
        initialState: {
            pagination: {
                pageIndex: 0,
                pageSize: 5,
            },
        },
        // `enableSortingRemoval` keeps one sort direction active instead of cycling back to unsorted.
        enableSortingRemoval: false,
        // `enableMultiSort` allows users to sort by multiple columns with modifier keys.
        enableMultiSort: true,
        // `enableRowSelection` turns on row selection APIs such as `row.getIsSelected()`.
        enableRowSelection: true,
        // `enableMultiRowSelection` allows selecting more than one row at a time.
        enableMultiRowSelection: true,
        // `enableSubRowSelection` matters when your table has nested rows.
        enableSubRowSelection: false,
        // `columnResizeMode` configures when size changes are applied during resizing.
        columnResizeMode: "onChange",
        // `isMultiSortEvent` defines which browser event should trigger multi-column sorting.
        isMultiSortEvent: (event) => event instanceof MouseEvent && event.shiftKey,
        // `debugTable` logs internal table lifecycle info in development when set to true.
        debugTable: false,
        // `debugHeaders` logs header generation details for debugging complex tables.
        debugHeaders: false,
        // `debugColumns` logs column processing details for debugging column definitions.
        debugColumns: false,
        // `meta` is a shared bag for app-specific helpers that cells/headers can read later.
        meta: {
            emptyMessage: "No projects matched your filter.",
            source: "tests-page",
        },
        // `defaultColumn` can define shared defaults applied to every column.
        defaultColumn: {
          enableSorting: true,
          minSize: 120,
        },
        // `getRowId` is useful when rows come from a backend with stable ids.
        getRowId: (originalRow) => String(originalRow.id),
        // `getCoreRowModel` is the base row pipeline every table needs.
        getCoreRowModel: getCoreRowModel(),
        // `getSortedRowModel` enables sorting behavior.
        getSortedRowModel: getSortedRowModel(),
        // `getFilteredRowModel` enables the search filter behavior.
        getFilteredRowModel: getFilteredRowModel(),
        // `getPaginationRowModel` enables client-side pagination.
        getPaginationRowModel: getPaginationRowModel(),
    })

    const form = useForm({
        // `defaultValues` defines the starting shape and initial values for the whole form.
        defaultValues: formDefaults,
        // `defaultState` can initialize touched/dirty/submission flags for advanced cases.
        defaultState: {
          isTouched: false,
        },
        validators: {
            // `onChange` validates every field update with the shared Zod schema.
            onChange: projectSchema,
            // `onChangeAsync` is useful for server-side or delayed async validation.
            onChangeAsync: async ({ value }) => {
              if (value.name === "Forbidden project") {
                return { form: "This project name is reserved." }
              }
              return undefined
            },
            // `onBlur` runs validation when the user leaves a field.
            onBlur: projectSchema,
            // `onSubmit` runs validation only when the user submits the form.
            onSubmit: projectSchema,
        },
        // `onSubmit` receives the final validated values when the form is submitted.
        onSubmit: async ({ value }) => {
            toast.success(`Draft project ready: ${value.name}`)
            form.reset()
        },
        // `onSubmitInvalid` runs when submission fails validation, useful for scroll/focus helpers.
        onSubmitInvalid: ({ formApi }) => {
          console.error("invalid submit", formApi.state.errors)
        },
        // `canSubmitWhenInvalid` can allow submit buttons to stay enabled in special workflows.
        canSubmitWhenInvalid: false,
    })

    return (
        <main className="space-y-6">
            <section className="space-y-2">
                <h1>TanStack Examples</h1>
                <p className="text-muted-foreground">
                    Complete examples for TanStack Query, TanStack Form, TanStack Table,
                    and the app tab component, with inline comments on the important props.
                </p>
            </section>

            <Tabs
                // `defaultValue` chooses which tab is active on first render.
                defaultValue="query"
                // `orientation` controls whether tabs are laid out horizontally or vertically.
                orientation="horizontal"
                // `className` controls spacing between the tab list and tab panels.
                className="space-y-4"
            >
                <TabsList
                    // `variant` switches the visual style defined in the shared tabs component.
                    variant="line"
                    // `className` makes the tab list wrap nicely on smaller screens.
                    className="flex w-full flex-wrap justify-start"
                >
                    <TabsTrigger
                        // `value` must match a `TabsContent` value so this trigger opens that panel.
                        value="query"
                        // `className` lets you fine-tune spacing or typography for one trigger.
                        className="min-w-32"
                    >
                        TanStack Query
                    </TabsTrigger>
                    <TabsTrigger
                        // `value` connects this trigger to the `form` content panel.
                        value="form"
                        // `className` keeps all triggers visually balanced in this demo.
                        className="min-w-32"
                    >
                        TanStack Form
                    </TabsTrigger>
                    <TabsTrigger
                        // `value` connects this trigger to the `table` content panel.
                        value="table"
                        // `className` gives the last tab the same minimum width as the others.
                        className="min-w-32"
                    >
                        TanStack Table
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    // `value` links this content panel to the trigger with the same value.
                    value="query"
                    // `className` sets the layout for the cards inside the tab panel.
                    className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Query Setup</CardTitle>
                            <CardDescription>
                                This tab shows a simple list query plus a dependent query.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="query-client-select">Select a client</Label>
                                <Select
                                    // `value` keeps the select controlled from React state.
                                    value={selectedClientId ? String(selectedClientId) : ""}
                                    // `onValueChange` receives the selected option value as a string.
                                    onValueChange={(value) => setSelectedClientId(Number(value))}
                                >
                                    <SelectTrigger
                                        // `id` connects the trigger to the label for accessibility.
                                        id="query-client-select"
                                        // `className` is useful when one trigger needs a custom width.
                                        className="w-full"
                                        // `aria-label` helps screen readers describe the purpose of the trigger.
                                        aria-label="Select client for dependent project query"
                                    >
                                        <SelectValue placeholder="Choose a client to run the dependent query" />
                                    </SelectTrigger>
                                    <SelectContent
                                        // `position` chooses how the dropdown is positioned relative to its trigger.
                                        position="popper"
                                    >
                                        {(clientsQuery.data ?? []).map((client: Client) => (
                                            <SelectItem
                                                // `key` helps React reconcile the mapped list efficiently.
                                                key={client.id}
                                                // `value` is the payload returned by `onValueChange`.
                                                value={String(client.id)}
                                                // `className` allows per-option styling when needed.
                                                className="truncate"
                                            >
                                                {client.name} - {client.company}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <Card>
                                    <CardHeader>
                                        <CardDescription>Clients query</CardDescription>
                                        <CardTitle className="text-2xl">
                                            {clientsQuery.isLoading ? "Loading..." : clientsQuery.data?.length ?? 0}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardDescription>Selected client projects</CardDescription>
                                        <CardTitle className="text-2xl">
                                            {selectedClientId === 0
                                                ? "-"
                                                : clientProjectsQuery.isLoading
                                                    ? "Loading..."
                                                    : clientProjectsQuery.data?.length ?? 0}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardDescription>Background fetch</CardDescription>
                                        <CardTitle className="text-2xl">
                                            {clientProjectsQuery.isFetching ? "Yes" : "No"}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    // `type="button"` prevents form-submit behavior inside interactive UIs.
                                    type="button"
                                    // `variant` changes the visual style while keeping button behavior the same.
                                    variant="outline"
                                    // `onClick` manually triggers a fresh request for this query.
                                    onClick={() => void clientsQuery.refetch()}
                                >
                                    Refetch clients
                                </Button>
                                <Button
                                    // `type="button"` keeps this action as a plain UI event.
                                    type="button"
                                    // `variant` gives a lighter secondary emphasis.
                                    variant="secondary"
                                    // `disabled` stops interaction until a client is selected.
                                    disabled={selectedClientId === 0}
                                    // `onClick` manually refetches the dependent query.
                                    onClick={() => void clientProjectsQuery.refetch()}
                                >
                                    Refetch selected client projects
                                </Button>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="font-medium">Dependent query result</p>
                                {selectedClientId === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Pick a client above to enable the second query.
                                    </p>
                                ) : clientProjectsQuery.isError ? (
                                    <p className="text-sm text-red-600">
                                        {clientProjectsQuery.error instanceof Error
                                            ? clientProjectsQuery.error.message
                                            : "Failed to load projects."}
                                    </p>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        {(clientProjectsQuery.data ?? []).map((project) => (
                                            <div key={project.id} className="rounded-md border p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium">{project.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Due {formatDate(project.dueDate)}
                                                        </p>
                                                    </div>
                                                    <Badge className={statusBadgeClass(project.status)}>
                                                        {project.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>What To Notice</CardTitle>
                            <CardDescription>
                                The inline comments point at the props you will usually configure first.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                `queryKey` is the cache identity. If the key changes, TanStack Query
                                treats it as different data.
                            </p>
                            <p>
                                `enabled` is the usual way to create dependent queries, like
                                loading projects only after a client is selected.
                            </p>
                            <p>
                                `isLoading`, `isError`, and `isFetching` are the most useful state
                                flags to render loading, error, and background refresh feedback.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="form">
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Setup</CardTitle>
                            <CardDescription>
                                This example validates with the shared `projectSchema` and submits a local draft.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                // `onSubmit` prevents the browser reload and delegates to TanStack Form.
                                onSubmit={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    form.handleSubmit()
                                }}
                                // `className` controls the responsive layout of all form fields.
                                className="grid gap-4 md:grid-cols-2"
                            >
                                <form.Field
                                    // `name` must match one key from `defaultValues`.
                                    name="clientId"
                                    // `mode` controls when the field subscribes and rerenders for state updates.
                                    mode="value"
                                    // `children` is a render function that receives the live TanStack field API.
                                    children={(field) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="form-client">Client</Label>
                                            <Select
                                                // `value` keeps the select synced with the field state.
                                                value={String(field.state.value)}
                                                // `onValueChange` updates the field when the user selects an option.
                                                onValueChange={(value) => field.handleChange(Number(value))}
                                            >
                                                <SelectTrigger
                                                    // `id` ties the trigger to the `<Label htmlFor />`.
                                                    id="form-client"
                                                    // `className` is where you size or align this specific field control.
                                                    className="w-full"
                                                    // `aria-label` gives screen readers a direct control description.
                                                    aria-label="Client field"
                                                >
                                                    <SelectValue placeholder="Select a client" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    // `position` configures how the floating panel is placed.
                                                    position="popper"
                                                >
                                                    {(clientsQuery.data ?? []).map((client: Client) => (
                                                        <SelectItem
                                                            // `key` gives React a stable identity for each option row.
                                                            key={client.id}
                                                            // `value` is the string passed back into `onValueChange`.
                                                            value={String(client.id)}
                                                        >
                                                            {client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldError(field)}
                                        </div>
                                    )}
                                />

                                <form.Field
                                    // `name` maps this field to the `name` value in the form object.
                                    name="name"
                                    // `validators` lets you add field-specific rules on top of form-level validation.
                                    validators={{
                                        // `onChange` can validate this one field independently.
                                        onChange: ({ value }) => {
                                            if (value.length > 0 && value.length < 3) {
                                                return "Use at least 3 characters."
                                            }
                                            return undefined
                                        },
                                        // `onBlur` is useful for checks you only want after the user leaves the field.
                                        onBlur: ({ value }) => {
                                            if (value.toLowerCase() === "test") {
                                                return "Avoid generic project names like 'test'."
                                            }
                                            return undefined
                                        },
                                        // `onChangeAsync` is where API-backed uniqueness checks often go.
                                        onChangeAsync: async () => {
                                          const alreadyExists = false
                                          return alreadyExists ? "This project name already exists." : undefined
                                        },
                                    }}
                                    // `children` lets you render any custom UI while still using TanStack Form state.
                                    children={(field) => (
                                        <div className="space-y-2">
                                            <Label htmlFor={field.name}>Project name</Label>
                                            <Input
                                                // `id` links the input with its label.
                                                id={field.name}
                                                // `name` is the field identifier used by the form state.
                                                name={field.name}
                                                // `value` makes the input controlled by TanStack Form.
                                                value={field.state.value}
                                                // `onBlur` marks the field as touched.
                                                onBlur={field.handleBlur}
                                                // `onChange` pushes the new string value into the form state.
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                // `placeholder` gives the user an example of the expected input.
                                                placeholder="Website redesign"
                                                // `autoComplete` hints to the browser how to autofill this input.
                                                autoComplete="off"
                                                // `required` marks the input as required at the browser level too.
                                                required
                                            />
                                            {fieldError(field)}
                                        </div>
                                    )}
                                />

                                <form.Field
                                    // `name` maps this field to the `status` value in the form object.
                                    name="status"
                                    // `validators` can also be attached directly to select-like fields.
                                    validators={{
                                        // `onChange` allows a field-level rule that depends only on this field's value.
                                        onChange: ({ value }) => {
                                            if (value === "completed" && form.state.values.budget === 0) {
                                                return "Completed projects should usually have a budget greater than 0."
                                            }
                                            return undefined
                                        },
                                    }}
                                    // `children` exposes the field API used to read and update the current value.
                                    children={(field) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="form-status">Status</Label>
                                            <Select
                                                // `value` reflects the current field value from TanStack Form state.
                                                value={field.state.value}
                                                // `onValueChange` writes the selected option back into the field state.
                                                onValueChange={(value) =>
                                                    field.handleChange(value as ProjectFormValues["status"])
                                                }
                                            >
                                                <SelectTrigger
                                                    // `id` links the select trigger to its label.
                                                    id="form-status"
                                                    // `className` gives you a hook for field-level layout control.
                                                    className="w-full"
                                                    // `aria-label` gives the control an explicit accessible name.
                                                    aria-label="Project status field"
                                                >
                                                    <SelectValue placeholder="Select a status" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    // `position` changes how the menu is aligned and floated.
                                                    position="popper"
                                                >
                                                    <SelectItem value="planning">Planning</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {fieldError(field)}
                                        </div>
                                    )}
                                />

                                <form.Field
                                    // `name` maps this field to the numeric `budget` value in the form object.
                                    name="budget"
                                    // `validators` is useful for one-off numeric rules local to this field.
                                    validators={{
                                        // `onChange` can reject domain-specific values not covered by the schema.
                                        onChange: ({ value }) => {
                                            if (value > 1000000) {
                                                return "Keep the demo budget under 1,000,000."
                                            }
                                            return undefined
                                        },
                                    }}
                                    // `children` renders the controlled input using the field helpers.
                                    children={(field) => (
                                        <div className="space-y-2">
                                            <Label htmlFor={field.name}>Budget</Label>
                                            <Input
                                                // `id` links the input to the label.
                                                id={field.name}
                                                // `name` identifies the input in the submitted form structure.
                                                name={field.name}
                                                // `type="number"` shows a numeric keyboard and browser number UI.
                                                type="number"
                                                // `value` reads the current numeric value from form state.
                                                value={field.state.value}
                                                // `onBlur` marks the field as touched for validation messaging.
                                                onBlur={field.handleBlur}
                                                // `onChange` converts the raw string input into a number for the schema.
                                                onChange={(event) => field.handleChange(Number(event.target.value))}
                                                // `placeholder` hints at the kind of number expected here.
                                                placeholder="15000"
                                                // `min` sets the minimum numeric value accepted by the browser UI.
                                                min={0}
                                                // `step` controls how the number input increments.
                                                step={100}
                                            />
                                            {fieldError(field)}
                                        </div>
                                    )}
                                />

                                <form.Field
                                    // `name` maps this field to the `dueDate` value in the form object.
                                    name="dueDate"
                                    // `validators` can compare one field against other form values when needed.
                                    validators={{
                                        // `onChange` is commonly used for cross-field date logic.
                                        onChange: ({ value }) => {
                                            if (form.state.values.status === "completed" && !value) {
                                                return "Completed projects should have a due date."
                                            }
                                            return undefined
                                        },
                                    }}
                                    // `children` gives access to the current field state and handlers.
                                    children={(field) => (
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor={field.name}>Due date</Label>
                                            <Input
                                                // `id` connects the input with the visible label.
                                                id={field.name}
                                                // `name` matches the form field key.
                                                name={field.name}
                                                // `type="date"` uses the browser date input UI.
                                                type="date"
                                                // `value` reflects the current date string from form state.
                                                value={field.state.value}
                                                // `onBlur` marks the field as touched.
                                                onBlur={field.handleBlur}
                                                // `onChange` stores the selected date string in form state.
                                                onChange={(event) => field.handleChange(event.target.value)}
                                                // `min` can prevent choosing dates earlier than today in the browser UI.
                                                min={new Date().toISOString().split("T")[0]}
                                            />
                                            {fieldError(field)}
                                        </div>
                                    )}
                                />

                                <div className="md:col-span-2 flex flex-wrap gap-3">
                                    <Button
                                        // `type="submit"` makes this button trigger the form submit handler.
                                        type="submit"
                                        // `disabled` prevents duplicate submits while the form is submitting.
                                        disabled={form.state.isSubmitting}
                                    >
                                        {form.state.isSubmitting ? "Submitting..." : "Submit Example"}
                                    </Button>
                                    <Button
                                        // `type="button"` prevents accidental form submission.
                                        type="button"
                                        // `variant` swaps to the secondary button style.
                                        variant="secondary"
                                        // `onClick` runs local UI logic instead of submitting the form.
                                        onClick={() => form.reset()}
                                    >
                                        Reset
                                    </Button>
                                </div>

                                <form.Subscribe
                                    // `selector` chooses which piece of form state this subscriber watches.
                                    selector={(state) => ({
                                        canSubmit: state.canSubmit,
                                        isDirty: state.isDirty,
                                        isSubmitting: state.isSubmitting,
                                        values: state.values,
                                    })}
                                    // `children` receives only the selected slice, which can reduce rerenders.
                                    children={(state) => (
                                        <div className="md:col-span-2 rounded-lg border p-4 text-sm">
                                            <p className="font-medium">form.Subscribe example</p>
                                            <p className="text-muted-foreground">
                                                Dirty: {state.isDirty ? "yes" : "no"} | Can submit: {state.canSubmit ? "yes" : "no"} | Submitting: {state.isSubmitting ? "yes" : "no"}
                                            </p>
                                            <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                                {JSON.stringify(state.values, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                />

                                <form.Subscribe
                                    // `selector` can subscribe to a single primitive too, not only an object.
                                    selector={(state) => state.errorMap}
                                    // `children` can render debug information for advanced validation flows.
                                    children={(errorMap) => (
                                        <div className="md:col-span-2 text-xs text-muted-foreground">
                                            Global error map: {JSON.stringify(errorMap)}
                                        </div>
                                    )}
                                />
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="table">
                    <Card>
                        <CardHeader>
                            <CardTitle>Table Setup</CardTitle>
                            <CardDescription>
                                This example uses sorting, filtering, custom cells, and shared project data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-2">
                                    <Label htmlFor="project-search">Search projects or client names</Label>
                                    <Input
                                        // `id` matches the label for accessible form controls.
                                        id="project-search"
                                        // `value` keeps the search box controlled from React state.
                                        value={globalFilter}
                                        // `onChange` updates the global table filter.
                                        onChange={(event) => setGlobalFilter(event.target.value)}
                                        // `placeholder` gives the user a quick example of searchable text.
                                        placeholder="Search..."
                                        // `autoComplete` disables browser autofill for a transient filter input.
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Rows: {table.getRowModel().rows.length} of {projectsQuery.data?.length ?? 0}</p>
                                    <p>Selected: {table.getFilteredSelectedRowModel().rows.length}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {table.getAllLeafColumns().map((column) => (
                                    <Button
                                        key={column.id}
                                        // `type="button"` keeps column toggles as plain UI actions.
                                        type="button"
                                        // `variant` changes the appearance based on visibility state.
                                        variant={column.getIsVisible() ? "default" : "outline"}
                                        // `size` is handy for compact toolbars like this one.
                                        size="sm"
                                        // `onClick` uses the built-in visibility toggle for each column.
                                        onClick={() => column.toggleVisibility()}
                                    >
                                        {column.id}
                                    </Button>
                                ))}
                                <Button
                                    // `type="button"` keeps this toolbar action from submitting forms.
                                    type="button"
                                    // `variant` gives this reset action lower emphasis.
                                    variant="secondary"
                                    // `size` makes the action fit nicely with the other toolbar buttons.
                                    size="sm"
                                    // `onClick` is a quick way to restore all columns.
                                    onClick={() => table.resetColumnVisibility()}
                                >
                                    Reset columns
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder ? null : (
                                                        <button
                                                            // `type="button"` stops the button from acting like a form submit button.
                                                            type="button"
                                                            // `className` styles the clickable sortable header.
                                                            className="inline-flex items-center gap-2 font-medium"
                                                            // `onClick` uses TanStack Table's built-in sorting toggle handler.
                                                            onClick={header.column.getToggleSortingHandler()}
                                                        >
                                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                                            {{
                                                                asc: "↑",
                                                                desc: "↓",
                                                            }[header.column.getIsSorted() as string] ?? null}
                                                        </button>
                                                    )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length > 0 ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                // `data-state` is often used to style selected rows in UI kits.
                                                data-state={row.getIsSelected() ? "selected" : undefined}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell
                                                        key={cell.id}
                                                        // `onClick` here is just a teaching example for row selection toggles.
                                                        onClick={() => row.toggleSelected()}
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                                                No projects matched your filter.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </p>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        // `value` syncs the page-size control with table pagination state.
                                        value={String(table.getState().pagination.pageSize)}
                                        // `onValueChange` updates how many rows each page should show.
                                        onValueChange={(value) => table.setPageSize(Number(value))}
                                    >
                                        <SelectTrigger
                                            // `className` gives the page-size selector a compact toolbar width.
                                            className="w-32"
                                            // `aria-label` describes the control for assistive technologies.
                                            aria-label="Rows per page"
                                        >
                                            <SelectValue placeholder="Rows" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="5">5 rows</SelectItem>
                                            <SelectItem value="10">10 rows</SelectItem>
                                            <SelectItem value="20">20 rows</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        // `type="button"` keeps the pagination control from submitting any parent form.
                                        type="button"
                                        // `variant` gives a lower-emphasis navigation style.
                                        variant="outline"
                                        // `disabled` prevents going before the first page.
                                        disabled={!table.getCanPreviousPage()}
                                        // `onClick` moves the table to the previous page.
                                        onClick={() => table.previousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        // `type="button"` keeps the pagination action local to the table.
                                        type="button"
                                        // `variant` keeps the pagination controls visually consistent.
                                        variant="outline"
                                        // `disabled` prevents going past the last page.
                                        disabled={!table.getCanNextPage()}
                                        // `onClick` advances the table to the next page.
                                        onClick={() => table.nextPage()}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-lg border p-4 text-sm">
                                <p className="font-medium">Table state snapshot</p>
                                <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                                    {JSON.stringify(table.getState(), null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    )
}
