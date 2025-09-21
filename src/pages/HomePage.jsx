import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import EventCarousel from '@/components/EventCarousel'
import EventMiniCarousel from '@/components/EventMiniCarousel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  registerForFreeEvent,
  unregisterFromEvent,
  getEvents,
  getLocations
} from '@/lib/api'
import { toast } from 'react-toastify'
import useAuthStore from '../stores/authStore'

import { Calendar, MapPin, Tag, ArrowRight, Loader2 } from 'lucide-react'
import { ShimmeringText } from '@/components/ui/shadcn-io/shimmering-text'
import { SplittingText } from '@/components/ui/shadcn-io/splitting-text'

import { API_BASE_URL, IMAGE_BASE_URL } from '@/lib/config'

// Définition des variantes pour les animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15 // Délai entre l'animation de chaque carte
    }
  }
}

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

function HomePage () {
  const {
    data: events,
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
    error: errorEvents
  } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    onError: err => {
      toast.error(err.message || 'Erreur lors du chargement des événements.')
    }
  })

  const {
    data: locations,
    isLoading: isLoadingLocations,
    isError: isErrorLocations,
    error: errorLocations
  } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
    onError: err => {
      toast.error(err.message || 'Erreur lors du chargement des lieux.')
    }
  })

  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const joinMutation = useMutation({
    mutationFn: registerForFreeEvent,
    onSuccess: () => {
      toast.success(`Billet obtenu avec succès !`)
      queryClient.invalidateQueries(['events']) // Invalidate the events list
    },
    onError: err => {
      toast.error(
        err.response?.data?.message || `Erreur lors de l'inscription.`
      )
    }
  })

  const leaveMutation = useMutation({
    mutationFn: unregisterFromEvent,
    onSuccess: () => {
      toast.success(`Désinscription de l'événement réussie !`)
      queryClient.invalidateQueries(['events']) // Invalidate the events list
    },
    onError: err => {
      toast.error(
        err.response?.data?.message || `Erreur lors de la désinscription.`
      )
    }
  })

  const handleJoin = eventId => {
    if (eventId) {
      joinMutation.mutate(eventId)
    }
  }

  const handleLeave = eventId => {
    if (eventId) {
      leaveMutation.mutate(eventId)
    }
  }

  if (isLoadingEvents || isLoadingLocations) {
    return <div className='text-center py-10'>Chargement des données...</div>
  }

  if (isErrorEvents) {
    return (
      <div className='text-center py-10 text-red-500'>
        Erreur lors du chargement des événements: {errorEvents.message}
      </div>
    )
  }

  if (isErrorLocations) {
    return (
      <div className='text-center py-10 text-red-500'>
        Erreur lors du chargement des lieux: {errorLocations.message}
      </div>
    )
  }

  return (
    <div className=''>
      <div>
        <EventCarousel />
      </div>

      <section className='py-12 md:py-20 bg-gray-100/10 dark:bg-gray-900/10'>
        <div className='container mx-auto px-6'>
          <div className='text-center mx-auto w-full mb-8 '>
            <h2 className='text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white'>
              Découvrez nos Lieux
            </h2>
          </div>
          <motion.div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.5 }}
          >
            {events.length > 0 ? (
              events.slice(0, 3).map(event => {
                const isEventPublished = event.status === 'publie'
                const isParticipating = event.participants?.some(
                  p => p === user?.id
                )
                return (
                  <motion.div key={event._id} variants={itemVariants}>
                    <Card className='flex flex-col h-full p-0 overflow-hidden rounded-md shadow-gray-600 shadow hover:shadow-xl bg-[#11123a]/90 border-2'>
                      {event.images && event.images.length > 0 && (
                        <EventMiniCarousel
                          images={event.images.map(img =>
                            img.startsWith('http')
                              ? img
                              : `${IMAGE_BASE_URL}/${img}`
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
                            <Calendar className='inline-block mr-1 h-4 w-4' />{' '}
                            Date:{' '}
                            {new Date(event.startDate).toLocaleDateString()}
                          </p>
                          <p>
                            <MapPin className='inline-block mr-1 h-4 w-4' />{' '}
                            Lieu:{' '}
                            {event.isOnline
                              ? 'En ligne'
                              : event.location?.name || 'N/A'}
                          </p>
                          <p>
                            <Tag className='inline-block mr-1 h-4 w-4' /> Prix:{' '}
                            {event.price === 0
                              ? 'Gratuit'
                              : `${event.price.toFixed(2)} FG`}
                          </p>
                        </div>
                        <div className='flex justify-between mt-auto pt-4 not-dark:text-black'>
                          {!isEventPublished ? (
                            <Button
                              size='sm'
                              className='bg-gray-400 text-white font-bold cursor-not-allowed'
                              disabled
                            >
                              Événement non publié
                            </Button>
                          ) : (
                            <>
                              {isAuthenticated &&
                              user?.role === 'participant' ? (
                                isParticipating ? (
                                  <Button
                                    size='sm'
                                    className='bg-red-500 hover:bg-red-600 text-white font-bold'
                                    onClick={() => handleLeave(event._id)}
                                    disabled={leaveMutation.isLoading}
                                  >
                                    {leaveMutation.isLoading ? (
                                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : (
                                      'Annuler ma participation'
                                    )}
                                  </Button>
                                ) : event.price === 0 ? (
                                  <Button
                                    size='sm'
                                    className='bg-green-500 hover:bg-green-600 text-white font-bold'
                                    onClick={() => handleJoin(event._id)}
                                    disabled={
                                      joinMutation.isLoading ||
                                      event.participants?.length >=
                                        event.maxParticipants ||
                                      event.maxParticipants -
                                        (event.participants?.length || 0) <=
                                        0
                                    }
                                  >
                                    {joinMutation.isLoading ? (
                                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    ) : event.participants?.length >=
                                        event.maxParticipants ||
                                      event.maxParticipants -
                                        (event.participants?.length || 0) <=
                                        0 ? (
                                      'Complet'
                                    ) : (
                                      'Obtenir un billet gratuit'
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    size='sm'
                                    className='bg-blue-500 hover:bg-blue-600 text-white font-bold'
                                    onClick={() =>
                                      navigate(`/events/${event._id}`)
                                    }
                                  >
                                    Acheter un billet
                                  </Button>
                                )
                              ) : isAuthenticated &&
                                user?.role !== 'participant' ? (
                                <Button
                                  size='sm'
                                  className='bg-gray-400 text-white font-bold cursor-not-allowed'
                                  disabled
                                >
                                  Seuls les participants peuvent s'inscrire
                                </Button>
                              ) : !isAuthenticated &&
                                !(
                                  event.participants?.length >=
                                    event.maxParticipants ||
                                  event.maxParticipants -
                                    (event.participants?.length || 0) <=
                                    0
                                ) ? (
                                <Button
                                  size='sm'
                                  className='bg-green-500 hover:bg-green-600 text-white font-bold'
                                  onClick={() => navigate('/login')}
                                >
                                  Participer
                                </Button>
                              ) : (
                                <Button
                                  size='sm'
                                  className='bg-gray-400 text-white font-bold cursor-not-allowed'
                                  disabled
                                >
                                  Complet
                                </Button>
                              )}
                            </>
                          )}
                          <Link to={`/events/${event._id}`}>
                            <Button
                              variant='outline'
                              className='w-fit transition-all duration-300 hover:scale-105'
                            >
                              Voir plus <ArrowRight className='ml-2 h-4 w-4' />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <div className='col-span-full text-center text-gray-500'>
                <p>Aucun événement récent disponible pour le moment.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <section className='py-6 md:py-10 bg-gray-100/10 dark:bg-gray-900/10'>
        <div className='container mx-auto px-6'>
          <div className='text-center mx-auto w-full mb-8 '>
            <h2 className='text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white'>
              Découvrez nos Lieux
            </h2>
          </div>
          <motion.div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.5 }}
          >
            {locations.length > 0 ? (
              locations.slice(0, 3).map(location => (
                <motion.div key={location._id} variants={itemVariants}>
                  <Card className='flex flex-col h-full p-0 overflow-hidden rounded-md shadow-gray-600 shadow hover:shadow-xl bg-[#11123a]/90'>
                    {location.images && location.images.length > 0 && (
                      <EventMiniCarousel
                        images={location.images.map(img =>
                          img.startsWith('http')
                            ? img
                            : `${IMAGE_BASE_URL}/${img}`
                        )}
                      />
                    )}
                    <CardHeader className='flex-grow text-2xl px-4 pt-4 pb-2'>
                      <CardTitle>{location.name}</CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col justify-between flex-grow p-4 pt-0'>
                      <p className='text-sm text-gray-100 dark:text-gray-300 mb-4'>
                        {location.description.substring(0, 200)}...
                      </p>
                      <div className='text-sm text-gray-300/80 mb-2 space-y-2'>
                        <p>
                          <MapPin className='inline-block mr-1 h-4 w-4' />{' '}
                          Adresse: {location.address}
                        </p>
                      </div>
                      <div className='flex justify-end mt-auto pt-4 not-dark:text-black'>
                        <Link to={`/locations/${location._id}`}>
                          <Button
                            variant='outline'
                            className='w-fit transition-all duration-300 hover:scale-105'
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
              <div className='col-span-full text-center text-gray-500'>
                <p>Aucun lieu récent disponible pour le moment.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
