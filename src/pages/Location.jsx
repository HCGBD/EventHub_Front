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
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  MapPin,
  Hourglass
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getLocations,
  deleteLocation,
  approveLocation,
  rejectLocation,
  setPendingLocation
} from '@/lib/api'
import useAuthStore from '@/stores/authStore'

const LocationCards = ({ locations }) => {
  const stats = React.useMemo(() => {
    if (!locations) return { total: 0, approved: 0, pending: 0, rejected: 0 }
    const validLocations = locations.filter(l => l != null)
    return {
      total: validLocations.length,
      approved: validLocations.filter(l => l && l.status === 'approuve').length,
      pending: validLocations.filter(l => l && l.status === 'en_attente').length,
      rejete: validLocations.filter(l => l && l.status === 'rejete').length
    }
  }, [locations])

  const cardsData = [
    { title: 'Total des Lieux', value: stats.total, Icon: MapPin },
    { title: 'Lieux Approuvés', value: stats.approved, Icon: CheckCircle },
    { title: 'Lieux en Attente', value: stats.pending, Icon: Hourglass },
    { title: 'Lieux Rejetés', value: stats.rejected, Icon: XCircle }
  ]

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
      {cardsData.map((card, index) => (
        <Card key={index}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            <card.Icon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function LocationPage () {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)
  const navigate = useNavigate()
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [locationToDelete, setLocationToDelete] = React.useState(null)

  const {
    data: rawLocations,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  })

  const locations = React.useMemo(
    () => (rawLocations || []).filter(loc => loc && typeof loc === 'object'),
    [rawLocations]
  )

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries(['locations'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const deleteMutation = useMutation({
    ...mutationOptions,
    mutationFn: deleteLocation,
    onSuccess: () => {
      mutationOptions.onSuccess()
      toast.success('Lieu supprimé.')
      setIsDeleteDialogOpen(false)
    },
    onError: error => {
      toast.error(`Erreur lors de la suppression: ${error.message}`)
      setIsDeleteDialogOpen(false)
    }
  })

  const approveMutation = useMutation({
    ...mutationOptions,
    mutationFn: approveLocation,
    onSuccess: () => {
      mutationOptions.onSuccess()
      toast.success('Lieu approuvé.')
    }
  })
  const rejectMutation = useMutation({
    ...mutationOptions,
    mutationFn: rejectLocation,
    onSuccess: () => {
      mutationOptions.onSuccess()
      toast.success('Lieu rejeté.')
    }
  })
  const setPendingMutation = useMutation({
    ...mutationOptions,
    mutationFn: setPendingLocation,
    onSuccess: () => {
      mutationOptions.onSuccess()
      toast.success('Lieu mis en attente.')
    }
  })

  const openDeleteDialog = id => {
    setLocationToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete)
    }
  }

  const handleEdit = location => {
    const prefix = user?.role === 'admin' ? '/admin' : '/organizer'
    navigate(`${prefix}/locations/${location._id}/edit`)
  }

  const handleAdd = () => {
    const prefix = user?.role === 'admin' ? '/admin' : '/organizer'
    navigate(`${prefix}/locations/new`)
  }

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nom du Lieu',
        cell: ({ row }) => (
          <div className='font-medium'>{row.getValue('name')}</div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.getValue('status')
          if (!status) return null; // Add this check
          const variant =
            {
              approuve: 'default',
              en_attente: 'secondary',
              rejete: 'destructive'
            }[status] || 'outline'
          return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>
        }
      },
      {
        accessorKey: 'createdBy',
        header: 'Créé par',
        cell: ({ row }) => <div>{row.original.createdBy?.email || 'N/A'}</div>
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const location = row.original
          if (!location) return null; // Add this check
          const canEdit =
            user?.role === 'admin' || user?.id === location.createdBy?._id
          // console.log(canEdit);

          const canChangeStatus = user?.role === 'admin'

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Ouvrir</span>
                  <IconDotsVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => navigate(`/locations/${location._id}`)}>
                  <Eye className='mr-2 h-4 w-4' />
                  <span>Voir</span>
                </DropdownMenuItem>
                {canEdit && (
                  <DropdownMenuItem onClick={() => handleEdit(location)}>
                    <Pencil className='mr-2 h-4 w-4' />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                )}

                {canChangeStatus && <DropdownMenuSeparator />}

                {canChangeStatus && location.status === 'en_attente' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => approveMutation.mutate(location._id)}
                    >
                      <CheckCircle className='mr-2 h-4 w-4' />
                      <span>Approuver</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => rejectMutation.mutate(location._id)}
                    >
                      <XCircle className='mr-2 h-4 w-4' />
                      <span>Rejeter</span>
                    </DropdownMenuItem>
                  </>
                )}

                {canChangeStatus && location.status === 'approuve' && (
                  <DropdownMenuItem
                    onClick={() => rejectMutation.mutate(location._id)}
                  >
                    <XCircle className='mr-2 h-4 w-4' />
                    <span>Désapprouver</span>
                  </DropdownMenuItem>
                )}

                {canChangeStatus && location.status === 'rejete' && (
                  <DropdownMenuItem
                    onClick={() => setPendingMutation.mutate(location._id)}
                  >
                    <Hourglass className='mr-2 h-4 w-4' />
                    <span>Remettre en attente</span>
                  </DropdownMenuItem>
                )}

                {canChangeStatus && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className='text-red-600 focus:text-red-600'
                      onClick={() => openDeleteDialog(location._id)}
                    >
                      <Trash2 className='mr-2 h-4 w-4' />
                      <span>Supprimer</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      }
    ],
    [user, approveMutation, rejectMutation, deleteMutation, setPendingMutation]
  )

  const table = useReactTable({
    data: locations || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters }
  })

  return (
    <div className='p-4 lg:p-6 w-full'>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le lieu sera définitivement
              supprimé de nos serveurs.
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
          <h1 className='text-2xl font-semibold'>Gestion des Lieux</h1>
          <p className='text-muted-foreground'>
            Gérez les lieux où se déroulent les événements.
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'organizer') && (
          <Button className={'not-dark:bg-[#11123a]'} onClick={handleAdd}>
            <IconPlus className='mr-2 h-4 w-4' /> Ajouter un Lieu
          </Button>
        )}
      </div>

      <LocationCards locations={locations} />

      <div className='flex items-center space-x-4 mb-4'>
        <Input
          placeholder='Filtrer par nom...'
          value={table.getColumn('name')?.getFilterValue() ?? ''}
          onChange={event =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <Select
          value={table.getColumn('status')?.getFilterValue() ?? 'all'}
          onValueChange={value => {
            table
              .getColumn('status')
              ?.setFilterValue(value === 'all' ? undefined : value)
          }}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filtrer par statut' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tous les statuts</SelectItem>
            <SelectItem value='approuve'>Approuvé</SelectItem>
            <SelectItem value='en_attente'>En attente</SelectItem>
            <SelectItem value='rejete'>Rejeté</SelectItem>
          </SelectContent>
        </Select>
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
                  Erreur lors du chargement.
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
                  Aucun lieu trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
