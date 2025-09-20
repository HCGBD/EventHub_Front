import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { IconPlus, IconDotsVertical } from '@tabler/icons-react'
import { Eye, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { CategoryForm } from '@/components/category-form'
import { getCategories, deleteCategory } from '@/lib/api'

export default function CategoryPage () {
  const queryClient = useQueryClient()
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [categoryToDelete, setCategoryToDelete] = React.useState(null)

  const {
    data: categories,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      toast.success('Catégorie supprimée avec succès !')
      setIsDeleteDialogOpen(false)
    },
    onError: error => {
      toast.error(`Erreur lors de la suppression: ${error.message}`)
      setIsDeleteDialogOpen(false)
    }
  })

  const openDeleteDialog = id => {
    setCategoryToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete)
    }
  }

  const handleEdit = category => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Nom de la Catégorie',
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      )
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <div>{row.getValue('description')}</div>
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Ouvrir le menu</span>
                <IconDotsVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() =>
                  alert(`Voir ${category.name} (ID: ${category._id})`)
                }
              >
                <Eye className='mr-2 h-4 w-4' />
                <span>Voir</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Pencil className='mr-2 h-4 w-4' />
                <span>Modifier</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-red-600 focus:text-red-600'
                onClick={() => openDeleteDialog(category._id)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  const table = useReactTable({
    data: categories || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters
    }
  })

  return (
    <div className='p-4 lg:p-6 w-full'>
      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingCategory}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La catégorie sera
              définitivement supprimée de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-semibold'>Gestion des Catégories</h1>
          <p className='text-muted-foreground'>
            Gérez les catégories d'événements.
          </p>
        </div>
        <Button className={'not-dark:bg-[#11123a]'} onClick={handleAdd}>
          <IconPlus className='mr-2 h-4 w-4' /> Ajouter une Catégorie
        </Button>
      </div>

      <div className='flex items-center space-x-4 mb-4'>
        <Input
          placeholder='Filtrer par nom...'
          value={table.getColumn('name')?.getFilterValue() ?? ''}
          onChange={event =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
      </div>

      <div className='rounded-md border bg-gray-300  dark:bg-accent'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Chargement...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-red-500'
                >
                  Erreur lors du chargement des catégories.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Aucune catégorie trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
