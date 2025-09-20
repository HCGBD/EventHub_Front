import * as React from 'react'
import {
  Eye,
  Pencil,
  Trash2,
  Send,
  X,
  Calendar,
  CalendarCheck,
  FileText,
  Hourglass,
  Undo2
} from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconDotsVertical } from '@tabler/icons-react'
import { toast } from 'react-toastify'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getEvents,
  deleteEvent,
  submitForApproval,
  approveEvent,
  rejectEvent,
  cancelEvent,
  revertToDraft,
  revertRejectedToDraft,
  cancelApproval,
  revertFromRejectionByOrganizer
} from '@/lib/api'
import useAuthStore from '@/stores/authStore'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const dateRangeFilterFn = (row, columnId, filterValue) => {
  const eventDate = new Date(row.getValue(columnId))
  eventDate.setHours(0, 0, 0, 0)

  const { from, to } = filterValue
  const fromDate = from ? new Date(from) : undefined
  if (fromDate) fromDate.setHours(0, 0, 0, 0)

  const toDate = to ? new Date(to) : undefined
  if (toDate) toDate.setHours(0, 0, 0, 0)

  if (!fromDate && !toDate) return true
  if (fromDate && !toDate) return eventDate >= fromDate
  if (!fromDate && toDate) return eventDate <= toDate
  return eventDate >= fromDate && eventDate <= toDate
}

const statusMapping = {
  brouillon: { label: 'Brouillon', variant: 'destructive' },
  en_attente_approbation: { label: 'En attente', variant: 'outline' },
  publie: { label: 'Publié', variant: 'default' },
  annule: { label: 'Annulé', variant: 'secondary' },
  termine: { label: 'Terminé', variant: 'secondary' }
}

export default function EventPage () {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [dateRange, setDateRange] = React.useState({
    from: undefined,
    to: undefined
  })

  // State for rejection modal
  const [rejectionModalOpen, setRejectionModalOpen] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [eventToReject, setEventToReject] = React.useState(null)

  // State for delete confirmation modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [eventToDelete, setEventToDelete] = React.useState(null)

  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const isOrganizer = user?.role === 'organizer'

  const {
    data: eventsData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success('Événement supprimé avec succès.')
      queryClient.invalidateQueries(['events'])
      setIsDeleteDialogOpen(false)
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
      setIsDeleteDialogOpen(false)
    }
  })

  const submitForApprovalMutation = useMutation({
    mutationFn: submitForApproval,
    onSuccess: () => {
      toast.success('Événement soumis à approbation.')
      queryClient.invalidateQueries(['events'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const approveMutation = useMutation({
    mutationFn: approveEvent,
    onSuccess: () => {
      toast.success('Événement approuvé.')
      queryClient.invalidateQueries(['events'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const rejectMutation = useMutation({
    mutationFn: rejectEvent,
    onSuccess: () => {
      toast.success('Événement rejeté avec succès.')
      queryClient.invalidateQueries(['events'])
      setRejectionModalOpen(false)
      setRejectionReason('')
      setEventToReject(null)
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const cancelMutation = useMutation({
    mutationFn: cancelEvent,
    onSuccess: () => {
      toast.success('Événement annulé.')
      queryClient.invalidateQueries(['events'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const revertToDraftMutation = useMutation({
    mutationFn: revertToDraft,
    onSuccess: () => {
      toast.success('Événement remis en brouillon avec succès.')
      queryClient.invalidateQueries(['events'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const revertFromRejectionMutation = useMutation({
    mutationFn: revertFromRejectionByOrganizer,
    onSuccess: () => {
      toast.success('Événement remis en brouillon.')
      queryClient.invalidateQueries(['events'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const revertRejectedToDraftMutation = useMutation({
    mutationFn: revertRejectedToDraft,
    onSuccess: () => {
      toast.success('Événement rejeté remis en brouillon avec succès.')
      queryClient.invalidateQueries(['events'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const cancelApprovalMutation = useMutation({
    mutationFn: cancelApproval,
    onSuccess: () => {
      toast.success('Approbation annulée. Événement remis en brouillon.')
      queryClient.invalidateQueries(['events'])
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const openDeleteDialog = id => {
    setEventToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete)
    }
  }

  const handleEdit = event => {
    const prefix = isAdmin ? '/admin' : '/organizer'
    navigate(`${prefix}/events/${event._id}/edit`)
  }

  const handleCreate = () => {
    const prefix = isAdmin ? '/admin' : '/organizer'
    navigate(`${prefix}/events/new`)
  }

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error('Le motif du rejet ne peut pas être vide.')
      return
    }
    rejectMutation.mutate({ id: eventToReject._id, reason: rejectionReason })
  }

  const columns = React.useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label='Select row'
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: 'name',
        header: "Nom de l'événement",
        cell: ({ row }) => (
          <div className='font-medium'>{row.getValue('name')}</div>
        )
      },
      ...(isAdmin
        ? [
            {
              accessorKey: 'organizer',
              header: 'Créé par',
              cell: ({ row }) => {
                const event = row.original
                if (event.organizer?._id === user.id) {
                  return <div className='font-semibold'>Vous</div>
                }
                const fullName = `${event.organizer?.prenom || ''} ${
                  event.organizer?.nom || ''
                }`.trim()
                return <div>{fullName || 'N/A'}</div>
              }
            }
          ]
        : []),
      {
        accessorKey: 'startDate',
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('startDate'))
          return (
            <div>
              {date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )
        },
        filterFn: dateRangeFilterFn
      },
      {
        accessorKey: 'location',
        header: 'Lieu',
        cell: ({ row }) => {
          const event = row.original
          return (
            <div>
              {event.isOnline ? 'En ligne' : event.location?.name || 'N/A'}
            </div>
          )
        }
      },
      {
        id: 'inscriptions',
        header: 'Inscriptions',
        cell: ({ row }) => {
          const event = row.original
          return (
            <div>{`${event.participants.length} / ${event.maxParticipants}`}</div>
          )
        }
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const statusKey = row.getValue('status')
          const { label, variant } = statusMapping[statusKey] || {
            label: statusKey,
            variant: 'outline'
          }
          return <Badge variant={variant}>{label}</Badge>
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const event = row.original
          const isOwner = event.organizer?._id === user?.id

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Ouvrir le menu</span>
                  <IconDotsVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => navigate(`/events/${event._id}`)}>
                  <Eye className='mr-2 h-4 w-4' />
                  <span>Voir</span>
                </DropdownMenuItem>

                {/* --- Modifier --- */}
                {((isOrganizer && isOwner && event.status === 'brouillon') ||
                  (isAdmin && event.status === 'brouillon')) && (
                  <DropdownMenuItem onClick={() => handleEdit(event)}>
                    <Pencil className='mr-2 h-4 w-4' />
                    <span>Modifier</span>
                  </DropdownMenuItem>
                )}

                {/* --- Soumettre pour approbation --- */}
                {((isOrganizer && isOwner && event.status === 'brouillon') ||
                  (isAdmin && event.status === 'brouillon')) && (
                  <DropdownMenuItem
                    onClick={() => submitForApprovalMutation.mutate(event._id)}
                    disabled={submitForApprovalMutation.isPending}
                  >
                    <Send className='mr-2 h-4 w-4' />
                    <span>Soumettre pour approbation</span>
                  </DropdownMenuItem>
                )}

                {/* --- Annuler l'approbation (par l'organisateur) --- */}
                {((isOrganizer &&
                  isOwner &&
                  event.status === 'en_attente_approbation') ||
                  (isAdmin && event.status === 'en_attente_approbation')) && (
                  <DropdownMenuItem
                    onClick={() => cancelApprovalMutation.mutate(event._id)}
                    disabled={cancelApprovalMutation.isPending}
                  >
                    <X className='mr-2 h-4 w-4' />
                    <span>Annuler la demande</span>
                  </DropdownMenuItem>
                )}

                {/* --- Approuver (Admin) --- */}
                {isAdmin && event.status === 'en_attente_approbation' && (
                  <DropdownMenuItem
                    onClick={() => approveMutation.mutate(event._id)}
                    disabled={approveMutation.isPending}
                  >
                    <CalendarCheck className='mr-2 h-4 w-4' />
                    <span>Approuver</span>
                  </DropdownMenuItem>
                )}

                {/* --- Rejeter (Admin) --- */}
                {isAdmin && event.status === 'en_attente_approbation' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setEventToReject(event)
                      setRejectionModalOpen(true)
                    }}
                  >
                    <X className='mr-2 h-4 w-4' />
                    <span>Rejeter</span>
                  </DropdownMenuItem>
                )}

                {/* --- Remettre en brouillon (par l'organisateur après rejet) --- */}
                {isOrganizer && isOwner && event.status === 'rejete' && (
                  <DropdownMenuItem
                    onClick={() =>
                      revertFromRejectionMutation.mutate(event._id)
                    }
                    disabled={revertFromRejectionMutation.isPending}
                  >
                    <Undo2 className='mr-2 h-4 w-4' />
                    <span>Remettre en brouillon</span>
                  </DropdownMenuItem>
                )}

                {/* --- Annuler (événement publié) --- */}
                {((isOrganizer && isOwner && event.status === 'publie') ||
                  (isAdmin && event.status === 'publie')) && (
                  <DropdownMenuItem
                    className='text-orange-600 focus:text-orange-600'
                    onClick={() => cancelMutation.mutate(event._id)}
                    disabled={cancelMutation.isPending}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    <span>Annuler l'événement</span>
                  </DropdownMenuItem>
                )}

                {/* --- Remettre en brouillon (événement annulé) --- */}
                {((isOrganizer && isOwner && event.status === 'annule') ||
                  (isAdmin && event.status === 'annule')) && (
                  <DropdownMenuItem
                    onClick={() => revertToDraftMutation.mutate(event._id)}
                    disabled={revertToDraftMutation.isPending}
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    <span>Remettre en brouillon</span>
                  </DropdownMenuItem>
                )}

                {/* --- Remettre en brouillon (Admin, pour événement rejeté) --- */}
                {isAdmin && event.status === 'rejete' && (
                  <DropdownMenuItem
                    onClick={() =>
                      revertRejectedToDraftMutation.mutate(event._id)
                    }
                    disabled={revertRejectedToDraftMutation.isPending}
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    <span>Forcer en brouillon (Admin)</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                {/* --- Supprimer --- */}
                {(isOrganizer || isAdmin) && (
                  <DropdownMenuItem
                    className='text-red-600 focus:text-red-600'
                    onClick={() => openDeleteDialog(event._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    <span>Supprimer</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      }
    ],
    [deleteMutation, isAdmin, user]
  )

  const table = useReactTable({
    data: eventsData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection
    }
  })

  const eventCardsData = React.useMemo(() => {
    const total = eventsData?.length || 0
    const aVenir = eventsData?.filter(e => e.status === 'publie').length || 0
    const brouillon =
      eventsData?.filter(e => e.status === 'brouillon').length || 0
    const enAttente =
      eventsData?.filter(e => e.status === 'en_attente_approbation').length || 0
    return [
      { title: 'Total des Événements', value: total, Icon: Calendar },
      { title: 'Événements Publiés', value: aVenir, Icon: CalendarCheck },
      { title: 'Événements en Brouillon', value: brouillon, Icon: FileText },
      { title: "En Attente d'Approbation", value: enAttente, Icon: Hourglass }
    ]
  }, [eventsData])

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
              Cette action est irréversible. L'événement sera définitivement
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

      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Rejeter l'événement</DialogTitle>
            <DialogDescription>
              Veuillez fournir un motif pour le rejet. L'organisateur sera
              notifié par email.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='rejection-reason' className='text-right'>
                Motif
              </Label>
              <Textarea
                id='rejection-reason'
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className='col-span-3'
                placeholder="Ex: L'image n'est pas appropriée, la description est incomplète..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Annuler</Button>
            </DialogClose>
            <Button
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending
                ? 'Envoi en cours...'
                : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-semibold'>Gestion des Événements</h1>
          <p className='text-muted-foreground'>
            Affichez, créez et gérez tous vos événements.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <IconPlus className='mr-2 h-4 w-4' /> Ajouter un Événement
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6'>
        {eventCardsData.map((card, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {card.title}
              </CardTitle>
              <card.Icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex items-center flex-wrap w-auto max-w-3xl  space-x-4 mb-4'>
        <div>
          <Input
            placeholder='Filtrer par nom...'
            value={table.getColumn('name')?.getFilterValue() ?? ''}
            onChange={event =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='max-w-sm'
          />
        </div>
        <div>
          <Select
            value={table.getColumn('status')?.getFilterValue() ?? 'all'}
            onValueChange={value => {
              const isAll = value === 'all'
              table
                .getColumn('status')
                ?.setFilterValue(isAll ? undefined : value)
            }}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filtrer par statut' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tous les statuts</SelectItem>
              {Object.entries(statusMapping).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <DatePicker
            selectsRange={true}
            startDate={dateRange.from}
            endDate={dateRange.to}
            onChange={update => {
              const [start, end] = update
              const newRange = { from: start, to: end }
              setDateRange(newRange)
              table.getColumn('startDate')?.setFilterValue(newRange)
            }}
            isClearable={true}
            placeholderText='Sélectionner une plage de dates'
            className='p-2 border rounded-md'
          />
        </div>
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
                  className='h-24 text-center'
                >
                  Erreur lors de la récupération des données.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
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
                  Aucun événement trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-end space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  )
}
