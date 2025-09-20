import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPaginatedEvents, getCategories, registerForFreeEvent, unregisterFromEvent } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import useAuthStore from '../stores/authStore'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import EventMiniCarousel from '@/components/EventMiniCarousel'
import { Calendar, MapPin, Tag, ArrowRight, Search, Loader2 } from 'lucide-react'

import { API_BASE_URL, IMAGE_BASE_URL } from '@/lib/config';

const EVENTS_PER_PAGE = 6

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function PublicEventsPage () {
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingSearchTerm, setPendingSearchTerm] = useState('') // New state for input value
  const [filters, setFilters] = useState({ category: 'all', type: 'all' })
  const [currentPage, setCurrentPage] = useState(1)

  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const joinMutation = useMutation({
    mutationFn: registerForFreeEvent,
    onSuccess: () => {
      toast.success(`Billet obtenu avec succès !`);
      queryClient.invalidateQueries(['events']); // Invalidate the events list
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || `Erreur lors de l'inscription.`);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: unregisterFromEvent,
    onSuccess: () => {
      toast.success(`Désinscription de l'événement réussie !`);
      queryClient.invalidateQueries(['events']); // Invalidate the events list
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || `Erreur lors de la désinscription.`);
    },
  });

  const handleJoin = (eventId) => {
    if (eventId) {
      joinMutation.mutate(eventId);
    }
  };

  const handleLeave = (eventId) => {
    if (eventId) {
      leaveMutation.mutate(eventId);
    }
  };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categories = useMemo(
    () => ['all', ...(categoriesData?.map(cat => cat.name) || [])],
    [categoriesData]
  );

  const queryParams = useMemo(() => {
    const selectedCategory = categoriesData?.find(cat => cat.name === filters.category);
    return {
      search: searchTerm,
      category: filters.category === 'all' ? undefined : selectedCategory?._id,
      isOnline: filters.type === 'all' ? undefined : (filters.type === 'online'),
      page: currentPage,
      limit: EVENTS_PER_PAGE,
    };
  }, [searchTerm, filters, currentPage, categoriesData]);

  const {
    data: eventsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['events', queryParams],
    queryFn: () => getPaginatedEvents(queryParams),
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des événements."
      );
    },
  });

  const events = eventsData?.events || [];
  const totalPages = eventsData?.totalPages || 1;

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(EVENTS_PER_PAGE)].map((_, index) => (
          <Skeleton key={index} className="h-[300px] w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger les événements. Veuillez réessayer.</p>
            <p className="text-red-500 text-sm">{error?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='text-center mb-12'>
        <h1 className='text-4xl md:text-6xl font-extrabold tracking-tight'>
          Découvrez nos événements
        </h1>
        <p className='mt-4 text-lg text-muted-foreground max-w-2xl mx-auto'>
          Parcourez, recherchez et filtrez pour trouver l'événement parfait pour
          vous.
        </p>
      </div>

      {/* Barre de filtres */}
      <div className='flex flex-col bg-gray-100/10 dark:bg-gray-900/10 md:flex-row gap-4 mb-8 p-4  rounded-full'>
        <div className='relative w-full md:flex-1 flex items-center'> {/* Added flex and items-center */}
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
          <Input
            placeholder='Rechercher par nom...'
            className='pl-10 border-2 rounded-full not-dark:bg-white flex-grow' // Added flex-grow
            value={pendingSearchTerm}
            onChange={e => setPendingSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // Add onKeyDown handler
          />
          <Button onClick={handleSearch} className='ml-2 rounded-full'>Rechercher</Button> {/* Search button */}
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

      {/* Grille des événements */}
      <motion.div
        key={currentPage} // Animer à chaque changement de page
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {events.length > 0 ? (
          events.map(event => (
            <motion.div key={event._id} variants={itemVariants}>
              <Card className='flex flex-col h-full p-0 overflow-hidden rounded-md shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card borde-4'>
                {event.images && event.images.length > 0 && (
                  <EventMiniCarousel images={event.images.map(img => img.startsWith('http') ? img : `${IMAGE_BASE_URL}/${img}`)} />
                )}
                <CardHeader className='flex-grow px-4 pt-4'>
                  <CardTitle className='text-lg font-bold'>
                    {event.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col p-4'>
                  <p className='text-sm flex-grow'> {event.description.substring(0, 200)}...</p>
                  <div className='text-sm  mt-4 space-y-1'>
                    <p>
                      <Calendar className='inline-block mr-2 h-4 w-4' />
                      {new Date(event.startDate).toLocaleDateString('fr-FR', {
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      <MapPin className='inline-block mr-2 h-4 w-4' />
                      {event.isOnline
                        ? 'En ligne'
                        : event.location?.name || 'N/A'}
                    </p>
                    <p>
                      <Tag className='inline-block mr-2 h-4 w-4' />
                      {event.price === 0
                        ? 'Gratuit'
                        : `${event.price.toFixed(2)} GNF`}
                    </p>
                  </div>
                  <div className='flex justify-between items-center mt-4'>
                    {(() => {
                      const isEventPublished = event.status === 'publie';
                      const isEventFull = event.participants?.length >= event.maxParticipants;
                      const remainingSeats = event.maxParticipants - (event.participants?.length || 0);
                      const isParticipating = event.participants?.some(p => p === user?.id);

                      if (!isEventPublished) {
                        return (
                          <Button
                            size='sm'
                            className='bg-gray-400 text-white font-bold cursor-not-allowed'
                            disabled
                          >
                            Événement non publié
                          </Button>
                        );
                      } else if (isAuthenticated && user?.role === 'participant') {
                        if (isParticipating) {
                          return (
                            <Button
                              size='sm'
                              className='bg-red-500 hover:bg-red-600 text-white font-bold'
                              onClick={() => handleLeave(event._id)}
                              disabled={leaveMutation.isLoading}
                            >
                              {leaveMutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Annuler ma participation'}
                            </Button>
                          );
                        } else {
                          return (
                            <Button
                              size='sm'
                              className='bg-green-500 hover:bg-green-600 text-white font-bold'
                              onClick={() => handleJoin(event._id)}
                              disabled={joinMutation.isLoading || isEventFull || remainingSeats <= 0}
                            >
                              {joinMutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEventFull || remainingSeats <= 0 ? 'Complet' : 'Participer')}
                            </Button>
                          );
                        }
                      } else if (isAuthenticated && user?.role !== 'participant') {
                        return (
                          <Button
                            size='sm'
                            className='bg-gray-400 text-white font-bold cursor-not-allowed'
                            disabled
                          >
                            Seuls les participants peuvent s'inscrire
                          </Button>
                        );
                      } else if (!isAuthenticated && !isEventFull) {
                        return (
                          <Button
                            size='sm'
                            className='bg-green-500 hover:bg-green-600 text-white font-bold'
                            onClick={() => navigate('/login')}
                          >
                            Participer
                          </Button>
                        );
                      } else {
                        return (
                          <Button
                            size='sm'
                            className='bg-gray-400 text-white font-bold cursor-not-allowed'
                            disabled
                          >
                            Complet
                          </Button>
                        );
                      }
                    })()}
                    <Link to={`/events/${event._id}`}>
                      <Button
                        variant='outline'
                        className='w-fit not-dark:text-black transition-all duration-300 hover:scale-105'
                      >
                        Voir plus <ArrowRight className='ml-2 h-4 w-4' />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className='col-span-full text-center py-20'>
            <p className='text-xl font-semibold'>Aucun événement trouvé</p>
            <p className='text-muted-foreground'>
              Essayez d'ajuster vos filtres.
            </p>
          </div>
        )}
      </motion.div>

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
  )
}