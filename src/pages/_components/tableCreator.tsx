import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import type { ColumnDef, ColumnFiltersState, Header, PaginationState, SortingState, Table as ReactTable, TableOptions } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { useState } from "react"
import { PaginateOptions, SortingOptions, FilterOptions, TableSizeOptions } from "./table/options"

type PaginationConfig = {
    pageSize?: number
    amountOfOptions?: number
}

type GenerateTableProps<TData> = {
    columns: ColumnDef<TData>[]
    data: TData[]
    sortedTable?: boolean
    filteredTable?: boolean
    paginatedTable?: boolean | PaginationConfig
}

export function GenerateTable<TData>({ columns, data, sortedTable = false, filteredTable = false, paginatedTable = false }: GenerateTableProps<TData>) {
    const paginationConfig = typeof paginatedTable === "object" ? paginatedTable : undefined
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: paginationConfig?.pageSize ?? 2,
    } satisfies PaginationState);
    let sortComponent: (header: Header<TData, unknown>) => ReactNode = () => null
    let filterComponent: (header: Header<TData, unknown>) => ReactNode = () => null
    let paginateComponent: (table: ReactTable<TData>) => ReactNode = () => null
    const [sorting, setSorting] = useState<SortingState>([])

    const tableProperties: TableOptions<TData> = {
        data,
        columns,
        state: {},
        getCoreRowModel: getCoreRowModel(),
    }

    if (sortedTable) {
        sortComponent = (header) => SortingOptions(header)
        tableProperties.onSortingChange = setSorting
        tableProperties.getSortedRowModel = getSortedRowModel()
        tableProperties.state = { ...tableProperties.state, sorting }
    }
    if (filteredTable) {
        filterComponent = (header) => FilterOptions(header)
        tableProperties.onColumnFiltersChange = setColumnFilters
        tableProperties.getFilteredRowModel = getFilteredRowModel()
        tableProperties.state = { ...tableProperties.state, columnFilters }
    }
    if (paginatedTable) {
        paginateComponent = (table) => PaginateOptions(table)
        tableProperties.onPaginationChange = setPagination
        tableProperties.getPaginationRowModel = getPaginationRowModel()
        tableProperties.state = { ...tableProperties.state, pagination }
    }

    const table = useReactTable(tableProperties)

    return <Table>
        <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                            <Card>
                                <CardContent className="flex flex-col w-full">
                                    <div>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </div>
                                    <div>
                                        {header.column.getCanSort() ? sortComponent(header) : null}
                                        {header.column.getCanFilter() ? filterComponent(header) : null}
                                    </div>
                                </CardContent>
                            </Card>
                        </TableHead>
                    ))}
                </TableRow>
            ))}
        </TableHeader>
        <TableBody>
            {table.getRowModel()?.rows?.map((row) => (
                <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
        {
            paginatedTable
                ? <div>
                    {
                        paginateComponent(table)
                    }
                    {
                        TableSizeOptions(table, paginationConfig?.pageSize, paginationConfig?.amountOfOptions)
                    }
                </div>
                : null
        }
    </Table>
}
