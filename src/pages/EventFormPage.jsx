import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getEventById } from '@/lib/api'
import { EventForm } from '@/components/event-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import useAuthStore from '@/stores/authStore'

const EventFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const { user } = useAuthStore();
  const rolePrefix = user?.role === 'admin' ? '/admin' : '/organizer';

  const {
    data: eventData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
    enabled: isEditMode, // Only fetch if in edit mode
    onError: err => {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Erreur lors du chargement de l'événement."
      )
      navigate(`${rolePrefix}/events`) // Redirect if event not found or error
    }
  })

  const handleFormSuccess = () => {
    navigate(`${rolePrefix}/events`) // Navigate back to event list after success
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
            <p>Impossible de charger l'événement. Veuillez réessayer.</p>
            <p className='text-red-500 text-sm'>{error?.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto   py-8'>
      <div className="mb-6 ms-3">
        <h1 className="text-2xl font-semibold">
          {isEditMode ? 'Modifier un événement' : 'Ajouter un événement'}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Modifiez les détails de votre événement ci-dessous."
            : "Remplissez le formulaire pour créer un nouvel événement."
          }
        </p>
      </div>
      <EventForm
        initialData={isEditMode ? eventData : null}
        onFormSuccess={handleFormSuccess}
      />
    </div>
  )
}

export default EventFormPage