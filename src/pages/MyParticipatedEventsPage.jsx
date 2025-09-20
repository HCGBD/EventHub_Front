import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

const itemVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IMAGE_BASE_URL } from '@/lib/config';
import { getParticipatedEvents, unregisterFromEvent, getCategories } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink
} from '@/components/ui/pagination'
import { ArrowLeft, Loader2, Calendar, MapPin, Tag, Search } from 'lucide-react'
import useAuthStore from '../stores/authStore'
import EventMiniCarousel from '@/components/EventMiniCarousel'


const EVENTS_PER_PAGE = 6

function MyParticipatedEventsPage () {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const leaveMutation = useMutation({
    mutationFn: unregisterFromEvent,
    onSuccess: () => {
      toast.success(`Désinscription de l'événement réussie !`)
      queryClient.invalidateQueries(['participatedEvents']) // Invalidate the participated events list
    },
    onError: err => {
      toast.error(
        err.response?.data?.message || `Erreur lors de la désinscription.`
      )
    }
  })

  const handleLeave = eventId => {
    if (eventId) {
      leaveMutation.mutate(eventId)
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [pendingSearchTerm, setPendingSearchTerm] = useState('')
  const [filters, setFilters] = useState({ category: 'all', type: 'all' })
  const [currentPage, setCurrentPage] = useState(1)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  const categories = useMemo(
    () => ['all', ...(categoriesData?.map(cat => cat.name) || [])],
    [categoriesData]
  )

  const queryParams = useMemo(() => {
    const selectedCategory = categoriesData?.find(
      cat => cat.name === filters.category
    )
    return {
      search: searchTerm,
      category: filters.category === 'all' ? undefined : selectedCategory?._id,
      isOnline: filters.type === 'all' ? undefined : filters.type === 'online',
      page: currentPage,
      limit: EVENTS_PER_PAGE
    }
  }, [searchTerm, filters, currentPage, categoriesData])

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm)
    setCurrentPage(1)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const {
    data: eventsData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['participatedEvents', queryParams],
    queryFn: () => getParticipatedEvents(queryParams),
    onError: err => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement de vos événements participés.'
      )
    }
  })

  const events = eventsData?.events || []
  const totalPages = eventsData?.totalPages || 1

  if (isLoading) {
    return (
      <div className='container mx-auto py-8'>
        <Skeleton className='h-[200px] w-full mb-4' />
        <Skeleton className='h-[200px] w-full mb-4' />
        <Skeleton className='h-[200px] w-full' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='container mx-auto py-8'>
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Impossible de charger vos événements participés. Veuillez
              réessayer.
            </p>
            <p className='text-red-500 text-sm'>{error?.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='bg-gray-300/40 dark:bg-gray-950 min-h-screen py-8'>
      <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
        <Link
          to='/'
          className='mb-6 inline-block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
        >
          <Button
            variant='ghost'
            className={'font-bold bg-red-400 hover:bg-red-500 text-white'}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Retour
          </Button>
        </Link>

        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-6'>
          Mes Événements Participés
        </h1>

        {/* Barre de filtres */}
        <div className='flex flex-col bg-gray-100/10 dark:bg-gray-900/10 md:flex-row gap-4 mb-8 p-4  rounded-full'>
          <div className='relative w-full md:flex-1 flex items-center'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
            <Input
              placeholder='Rechercher par nom...'
              className='pl-10 border-2 rounded-full not-dark:bg-white flex-grow'
              value={pendingSearchTerm}
              onChange={e => setPendingSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleSearch} className='ml-2 rounded-full'>
              Rechercher
            </Button>
          </div>
          <Select
            value={filters.category}
            onValueChange={value => {
              setFilters(f => ({ ...f, category: value }))
              setCurrentPage(1)
            }}
            className=''
          >
            <SelectTrigger className='w-full md:w-[180px] rounded-full not-dark:bg-white border-2'>
              <SelectValue placeholder='Catégorie' />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.type}
            onValueChange={value => {
              setFilters(f => ({ ...f, type: value }))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='w-full md:w-[180px] rounded-full not-dark:bg-white border-2'>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tous types</SelectItem>
              <SelectItem value='online'>En ligne</SelectItem>
              <SelectItem value='offline'>En personne</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {events && events.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {events.map(event => (
              <Card
                key={event._id}
                className='flex flex-col h-full p-0 overflow-hidden rounded-md shadow-gray-600 shadow hover:shadow-xl bg-[#11123a]/90 border-2'
              >
                {event.images && event.images.length > 0 && (
                  <EventMiniCarousel
                    images={event.images.map(
                      img =>
                        `${IMAGE_BASE_URL}${
                          img.startsWith('uploads/') ? img : `uploads/${img}`
                        }`
                    )}
                  />
                )}
                <CardHeader className='flex-grow text-2xl px-4'>
                  <CardTitle>{event.name}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col justify-between flex-grow p-4 pt-2'>
                  <p className='text-sm text-gray-100 dark:text-gray-300 mb-4'>
                    {event.description.substring(0, 200)}...
                  </p>
                  <div className='text-sm text-gray-300/80 mb-2 space-y-2'>
                    <p>
                      <Calendar className='inline-block mr-1 h-4 w-4' /> Date:{' '}
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <MapPin className='inline-block mr-1 h-4 w-4' /> Lieu:{' '}
                      {event.isOnline
                        ? 'En ligne'
                        : event.location?.name || 'N/A'}
                    </p>
                    <p>
                      <Tag className='inline-block mr-1 h-4 w-4' /> Catégorie:{' '}
                      {event.category?.name || 'N/A'}
                    </p>
                  </div>
                  <div className='flex flex-col gap-2 mt-4'>
                    <Button
                      className='w-full bg-red-500 hover:bg-red-600 text-white'
                      onClick={() => handleLeave(event._id)}
                      disabled={leaveMutation.isLoading}
                    >
                      {leaveMutation.isLoading ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        'Annuler ma participation'
                      )}
                    </Button>
                    <Link to={`/events/${event._id}`}>
                      <Button className='w-full bg-blue-500 hover:bg-blue-600 text-white'>
                        Voir les détails
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className='text-center py-8 bg-[#11123a]/90'>
            <CardContent>
              <p className='text-gray-50 '>
                Vous n'avez participé à aucun événement pour le moment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-12'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={e => {
                      e.preventDefault()
                      handlePageChange(currentPage - 1)
                    }}
                    disabled={currentPage === 1}
                    className={'bg-gray-400 '}
                  />
                </PaginationItem>
                {[...Array(totalPages).keys()].map(i => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href='#'
                      onClick={e => {
                        e.preventDefault()
                        handlePageChange(i + 1)
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={e => {
                      e.preventDefault()
                      handlePageChange(currentPage + 1)
                    }}
                    disabled={currentPage === totalPages}
                    className={'bg-gray-400 '}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyParticipatedEventsPage
