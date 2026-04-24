import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ClientTableSizeSelector } from "@/pages/_constants/selectors"
import type { Header, Table as ReactTable } from "@tanstack/react-table"
import { ArrowDownUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoveDown, MoveUp } from "lucide-react"

export const SortingOptions = <TData,>(header: Header<TData, unknown>) => (
    <Button variant={'outline'} onClick={header.column.getToggleSortingHandler()}>
        {
            header.column.getIsSorted()
                ? header.column.getIsSorted() === 'asc'
                    ? <MoveDown />
                    : <MoveUp />
                : <ArrowDownUp />
        }
    </Button>
)

export const FilterOptions = <TData,>(header: Header<TData, unknown>) => {
    return (
        <Input
            value={(header.column.getFilterValue() as string) ?? ''}
            onChange={(e) => header.column.setFilterValue(e.target.value)}
            placeholder={`Filter ${header.column.id}...`}
        />
    )
}

export const PaginateOptions = <TData,>(table: ReactTable<TData>) => {
    return (
        <>
            <CardContent className="items-center justify-center flex">
                <Button
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronsLeft />
                </Button>
                <Button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft />
                </Button>
                {
                    table
                        .getPageOptions()
                        .map((e) =>
                            <Button
                                key={e}
                                onClick={() => table.setPageIndex(Number(e))}
                                disabled={table.getState().pagination.pageIndex === e}
                            >
                                {e + 1}
                            </Button>
                        )
                }
                {
                    <>
                        <Button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight />
                        </Button>
                        <Button
                            onClick={() => table.lastPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight />
                        </Button>
                    </>
                }


            </CardContent>
            <div>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
        </>
    )
}

export const TableSizeOptions = <TData,>(table: ReactTable<TData>, defaultSize?: number, amountOfOptions?: number) => {
    return (
        <div className=" grow-1 flex gap-2">
            <Label>
                Table Size
            </Label>
            <ClientTableSizeSelector
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(e) => table.setPageSize(Number(e))}
                defaultSize={defaultSize}
                amountOfOptions={amountOfOptions}
            />
        </div>
    )
}
