import { Badge } from "@/components/ui/badge";
import { GenerateTable } from "../_components/tableCreator"
import type { ColumnDef } from "@tanstack/react-table";
import type { Client } from "@/types/types";
import { getClients } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const OperationsPage = () => {
    const [, setIsOpen] = useState(false)
    const [, setSelectedClient] = useState<Client | null>(null)
    const navigate = useNavigate()

    const { data: clients, isLoading, isError } = useQuery({
        queryKey: ["clients"],
        queryFn: getClients,
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
            cell: ({ row }) => <Badge>{row.original.status}</Badge>,
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
    if (isLoading || isError) return <></>

    return (
        <GenerateTable
            columns={columns}
            data={clients ?? []}
            filteredTable={true}
            paginatedTable={false}
            sortedTable={true}
        />
    )
}
