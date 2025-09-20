import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft } from 'lucide-react'
import EventMiniCarousel from '@/components/EventMiniCarousel'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getLocationById } from '@/lib/api' // Assuming this function exists or will be created
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import { MapInput } from '@/components/MapInput'; // Import MapInput

import { API_BASE_URL, IMAGE_BASE_URL } from '@/lib/config';

// Animation Variants (reused from HomePage)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
}

function LocationDetailPage () {
  const { locationId } = useParams()
  const navigate = useNavigate();

  const {
    data: location,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocationById(locationId),
    enabled: !!locationId,
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement du lieu."
      );
    },
  });

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
            <p>Impossible de charger le lieu. Veuillez réessayer.</p>
            <p className="text-red-500 text-sm">{error?.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Aucun lieu trouvé.</p>
      </div>
    );
  }

  const imageUrls = location.images?.map(img => img.startsWith('http') ? img : `${IMAGE_BASE_URL}/${img}`) || [];

  return (
    <div className='bg-gray-300/40 dark:bg-gray-950'>
      <div className='container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8'>
        <Button
          onClick={() => navigate(-1)}
          variant='ghost'
          className='mb-6   dark:text-gray-400 hover:text-black dark:hover:text-white font-bold bg-red-400 hover:bg-red-500 text-white'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Retour
        </Button>

        <div className='bg-white pb-8 dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden'>
          {imageUrls.length > 0 && (
            <div className='w-full h-74 md:h-96'>
              <img
                src={imageUrls[0]}
                alt={location.name}
                className='w-full h-full object-cover'
              />
            </div>
          )}

          <div className='p-6 md:p-8'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
              <div>
                <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white'>
                  {location.name}
                </h1>
              </div>
              <Button
                size='lg'
                className='mt-4 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-bold hover:text-xl transition-all duration-300 hover:scale-105'
              >
                Voir les événements
              </Button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2'>
                <h2 className='text-2xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 text-gray-900 dark:text-white'>
                  Description
                </h2>
                <p className='text-gray-700 dark:text-gray-300 whitespace-pre-line'>
                  {location.description}
                </p>

                {/* Galerie d'images en mini carrousel */}
                {imageUrls.length > 1 && (
                  <div className='mt-8'>
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
                    Informations
                  </h2>
                  <ul className='space-y-4 text-gray-700 mt-10 dark:text-gray-300'>
                    <li className='flex items-start'>
                      <MapPin className='h-6 w-6 mr-3 mt-1 text-gray-500 dark:text-gray-400' />
                      <div>
                        <strong className='text-gray-900 dark:text-white'>
                          Adresse
                        </strong>
                        <p>{location.address}</p>
                      </div>
                    </li>
                  </ul>
                </div>
                {location.coordinates && location.coordinates.latitude && location.coordinates.longitude && (
                  <div className='space-y-2 mt-8'>
                    <h3 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
                      Localisation sur la carte
                    </h3>
                    <MapInput
                      initialCoordinates={location.coordinates}
                      onCoordinatesChange={() => {}} // Dummy function as no interaction needed
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationDetailPage
