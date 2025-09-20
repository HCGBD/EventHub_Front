import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLocationById } from '@/lib/api' // Assuming getLocationById exists
import { LocationForm } from '@/components/location-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import useAuthStore from '@/stores/authStore'

const LocationFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const { user } = useAuthStore();
  const rolePrefix = user?.role === 'admin' ? '/admin' : '/organizer'; // Adjust roles as needed

  const {
    data: locationData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['location', id],
    queryFn: () => getLocationById(id),
    enabled: isEditMode, // Only fetch if in edit mode
    onError: err => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement du lieu."
      )
      navigate(`${rolePrefix}/locations`) // Redirect if location not found or error
    }
  })

  const handleFormSuccess = () => {
    navigate(`${rolePrefix}/locations`) // Navigate back to location list after success
  }

  if (isLoading && isEditMode) { // Affiche le skeleton uniquement en mode édition
    return (
      <div className='container mx-auto py-8'>
         <Skeleton className='h-[600px] w-full' />
      </div>
    )
  }

  if (isError && isEditMode) {
    return (
      <div className='container mx-auto py-8 '>
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Impossible de charger le lieu. Veuillez réessayer.</p>
            <p className='text-red-500 text-sm'>{error?.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto   py-8'>
      <div className="mb-6 ms-3 md:ms-37">
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier un lieu' : 'Ajouter un lieu'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Modifiez les détails de votre lieu ci-dessous."
            : "Remplissez le formulaire pour créer un nouveau lieu."
          }
        </p>
      </div>
      <LocationForm
        initialData={isEditMode ? locationData : null}
        onFormSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default LocationFormPage
