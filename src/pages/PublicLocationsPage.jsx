import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink
} from '@/components/ui/pagination'
import EventMiniCarousel from '@/components/EventMiniCarousel'
import { MapPin, ArrowRight, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getPaginatedLocations } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'

import { API_BASE_URL, IMAGE_BASE_URL } from '@/lib/config';

const LOCATIONS_PER_PAGE = 6

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function PublicLocationsPage () {
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingSearchTerm, setPendingSearchTerm] = useState('') // New state for input value
  const [currentPage, setCurrentPage] = useState(1)

  const queryParams = useMemo(() => ({
    search: searchTerm,
    page: currentPage,
    limit: LOCATIONS_PER_PAGE,
  }), [searchTerm, currentPage]);

  const {
    data: locationsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['locations', queryParams],
    queryFn: () => getPaginatedLocations(queryParams),
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement des lieux."
      );
    },
  });

  const locations = locationsData?.locations || [];
  const totalPages = locationsData?.totalPages || 1;

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
        {[...Array(LOCATIONS_PER_PAGE)].map((_, index) => (
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
            <p>Impossible de charger les lieux. Veuillez réessayer.</p>
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
          Découvrez nos lieux
        </h1>
        <p className='mt-4 text-lg not-dark:text-gray-800 max-w-2xl mx-auto'>
          Explorez les meilleurs endroits pour vos prochains événements.
        </p>
      </div>

      {/* Barre de recherche */}
      <div className='flex justify-center mb-8'>
        <div className='relative w-full max-w-md flex items-center'> {/* Added flex and items-center */}
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
          <Input
            placeholder='Rechercher un lieu par nom...'
            className='pl-10 border-2 rounded-full not-dark:bg-white flex-grow' // Added flex-grow
            value={pendingSearchTerm}
            onChange={e => setPendingSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // Add onKeyDown handler
          />
          <Button onClick={handleSearch} className='ml-2 rounded-full'>Rechercher</Button> {/* Search button */}
        </div>
      </div>

      {/* Grille des lieux */}
      <motion.div
        key={currentPage} // Animer à chaque changement de page
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {locations.length > 0 ? (
          locations.map(location => (
            <motion.div key={location._id} variants={itemVariants}>
              <Card className='flex flex-col h-full p-0 overflow-hidden rounded-md shadow-lg shadow-gray-600 hover:shadow-2xl transition-shadow duration-300 bg-card'>
                {location.images && location.images.length > 0 && (
                  <EventMiniCarousel images={location.images.map(img => img.startsWith('http') ? img : `${IMAGE_BASE_URL}/${img}`)} />
                )}
                <CardHeader className='flex-grow px-4 pt-4'>
                  <CardTitle className='text-lg font-bold'>
                    {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col p-4 pt-2'>
                  <p className='text-sm  flex-grow'>
                   
                     {location.description.substring(0, 200)}...
                  </p>
                  <div className='text-sm mt-4 space-y-1'>
                    <p>
                      <MapPin className='inline-block mr-2 h-4 w-4' />
                      {location.address}
                    </p>
                  </div>
                  <Link to={`/locations/${location._id}`} className='mt-4'>
                    <Button variant='outline' className='w-full dark:bg-green-400 bg-green-400 rounded-full'>
                      Voir plus <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className='col-span-full text-center py-20'>
            <p className='text-xl font-semibold'>Aucun lieu trouvé</p>
            <p className='text-muted-foreground'>
              Essayez d'ajuster votre recherche.
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
