import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EventMiniCarousel from '@/components/EventMiniCarousel'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEventById, registerForFreeEvent, unregisterFromEvent } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import useAuthStore from '../stores/authStore'

import {
  Calendar,
  MapPin,
  Tag,
  ArrowLeft,
  UserCircle,
  Ticket,
  Loader2
} from 'lucide-react'

import { API_BASE_URL, IMAGE_BASE_URL } from '@/lib/config';

function EventDetailPage () {
  const { eventId } = useParams()
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEventById(eventId),
    enabled: !!eventId,
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement de l'événement."
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerForFreeEvent,
    onSuccess: () => {
      toast.success(`Billet obtenu avec succès ! Un e-mail de confirmation vous a été envoyé.`);
      queryClient.invalidateQueries({queryKey:['event', eventId]});
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || `Erreur lors de l'inscription.`);
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: unregisterFromEvent,
    onSuccess: () => {
      toast.success(`Désinscription de l'événement réussie !`);
      queryClient.invalidateQueries({queryKey:['event', eventId]});
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || `Erreur lors de la désinscription.`);
    },
  });

  const handleRegister = () => {
    if (eventId) {
      registerMutation.mutate(eventId);
    }
  };

  const handleUnregister = () => {
    if (eventId) {
      unregisterMutation.mutate(eventId);
    }
  };

  const handlePurchase = () => {
    navigate(`/events/${eventId}/simulate-payment`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-[600px] w-full" />
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
            <p>Impossible de charger l'événement. Veuillez réessayer.</p>
            <p className="text-red-500 text-sm">{error?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Aucun événement trouvé.</p>
      </div>
    );
  }

  const imageUrls = event.images?.map(img => `${IMAGE_BASE_URL}/${img.startsWith('uploads/') ? img : `uploads/${img}`}`) || [];

  const isLoggedIn = isAuthenticated;
  const isParticipantRole = user?.role === 'participant';
  const isParticipating = event.participants?.some(p => p._id === user?.id);
  const isEventFull = event.participants?.length >= event.maxParticipants;
  const isEventPublished = event.status === 'publie';
  const remainingSeats = event.maxParticipants - (event.participants?.length || 0);

  const renderActionButton = () => {
    if (!isEventPublished) {
      return <Button size='lg' className='mt-4 sm:mt-0 bg-gray-400 text-white font-bold cursor-not-allowed' disabled>Événement non publié</Button>;
    }

    if (isEventFull && !isParticipating) {
        return <Button size='lg' className='mt-4 sm:mt-0 bg-gray-400 text-white font-bold cursor-not-allowed' disabled>Complet</Button>;
    }

    if (!isLoggedIn) {
        return <Button size='lg' className='mt-4 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-bold' onClick={() => navigate('/login')}>Se connecter pour participer</Button>;
    }

    if (!isParticipantRole) {
        return <Button size='lg' className='mt-4 sm:mt-0 bg-gray-400 text-white font-bold cursor-not-allowed' disabled>Seuls les participants peuvent s'inscrire</Button>;
    }

    if (isParticipating) {
        return (
            <Button size='lg' className='mt-4 sm:mt-0 bg-red-500 hover:bg-red-600 text-white font-bold' onClick={handleUnregister} disabled={unregisterMutation.isPending}>
                {unregisterMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Annuler ma participation'}
            </Button>
        );
    }

    // If not participating, not full, and is a participant
    if (event.price === 0) {
        return (
            <Button size='lg' className='mt-4 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-bold' onClick={handleRegister} disabled={registerMutation.isPending}>
                {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Obtenir un billet gratuit'}
            </Button>
        );
    } else {
        return (
            <Button size='lg' className='mt-4 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white font-bold' onClick={handlePurchase}>
                Acheter un billet ({event.price.toFixed(2)} GNF)
            </Button>
        );
    }
  };

  return (
    <div className='bg-gray-300/40  dark:bg-gray-950'>
      <div className='container mx-auto max-w-6xl  px-4 sm:px-6 lg:px-8 py-8'>
        <Button
          onClick={() => navigate(-1)}
          variant='ghost'
          className='mb-6   dark:text-gray-400 hover:text-black dark:hover:text-white font-bold bg-red-400 hover:bg-red-500 text-white'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Retour
        </Button>

        <div className='bg-white pb-8 dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden'>
          {/* AFFICHE LA PREMIÈRE IMAGE DE L'ÉVÉNEMENT */}
          {imageUrls.length > 0 && (
            <div className='w-full h-74 md:h-96'>
              <img
                src={imageUrls[0]}
                alt={event.name}
                className='w-full h-full object-cover'
              />
            </div>
          )}

          <div className='p-6 md:p-8'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
              <div>
                <Badge
                  variant='default'
                  className='mb-2 font-extrabold bg-blue-500 text-white hover:bg-blue-600'
                >
                  {event.category.name}
                </Badge>
                <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white'>
                  {event.name}
                </h1>
              </div>
              {renderActionButton()}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2'>
                <h2 className='text-2xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-900 dark:text-white'>
                  Description
                </h2>
                <p className='text-gray-700 dark:text-gray-300 whitespace-pre-line'>
                  {event.description}
                </p>

                {/* Galerie d'images en mini carrousel */}
                {imageUrls.length > 1 && (
                  <div className='mt-8  '>
                    <h3 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
                      Galerie
                    </h3>
                    <EventMiniCarousel images={imageUrls.slice(1)} />
                  </div>
                )}
              </div>

              <div>
                <div className='bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-inner'>
                  <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
                    Détails
                  </h2>
                  <ul className='space-y-4 text-gray-700 dark:text-gray-300'>
                    <li className='flex items-start'>
                      <Calendar className='h-6 w-6 mr-3 mt-1 text-gray-500 dark:text-gray-400' />
                      <div>
                        <strong className='text-gray-900 dark:text-white'>
                          Date & Heure
                        </strong>
                        <p>
                          {new Date(event.startDate).toLocaleDateString(
                            'fr-FR',
                            { weekday: 'long', day: 'numeric', month: 'long' }
                          )}
                        </p>
                        <p className='text-sm'>
                          {new Date(event.startDate).toLocaleTimeString(
                            'fr-FR',
                            { hour: '2-digit', minute: '2-digit' }
                          )}{' '}
                          -{' '}
                          {new Date(event.endDate).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </li>
                    <li className='flex items-start'>
                      <MapPin className='h-6 w-6 mr-3 mt-1 text-gray-500 dark:text-gray-400' />
                      <div>
                        <strong className='text-gray-900 dark:text-white'>
                          Lieu
                        </strong>
                        {event.isOnline ? (
                          <a
                            href={event.onlineUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-400 hover:underline'
                          >
                            En ligne
                          </a>
                        ) : (
                          <p>
                            {event.location?.name}, {event.location?.address}
                          </p>
                        )}
                      </div>
                    </li>
                    <li className='flex items-start'>
                      <UserCircle className='h-6 w-6 mr-3 mt-1 text-gray-500 dark:text-gray-400' />
                      <div>
                        <strong className='text-gray-900 dark:text-white'>
                          Organisateur
                        </strong>
                        <p>{event.organizer.name}</p>
                      </div>
                    </li>
                    <li className='flex items-start'>
                      <Tag className='h-6 w-6 mr-3 mt-1 text-gray-500 dark:text-gray-400' />
                      <div>
                        <strong className='text-gray-900 dark:text-white'>
                          Prix
                        </strong>
                        <p>
                          {event.price === 0
                            ? 'Gratuit'
                            : `${event.price.toFixed(2)} GNF`}
                        </p>
                      </div>
                    </li>
                    <li className='flex items-start'>
                      <Ticket className='h-6 w-6 mr-3 mt-1 text-gray-500 dark:text-gray-400' />
                      <div>
                        <strong className='text-gray-900 dark:text-white'>
                          Places restantes
                        </strong>
                        <p>{remainingSeats > 0 ? remainingSeats : 'Complet'}</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className='text-center mt-8 border-t border-gray-200 dark:border-gray-700 pt-6'>
                  {/* The participation buttons are now handled above, this can be removed or repurposed */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage