import React, { useState, useEffect, useCallback } from 'react';
import { IMAGE_BASE_URL } from '@/lib/config';
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import {
  getCategories,
  getLocations,
  createEvent,
  updateEvent
} from '@/lib/api'

const step1Schema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères.'),
  category: z.string({ required_error: 'La catégorie est requise.' })
})
const step2Schema = z.object({
  isOnline: z.boolean().default(false),
  location: z.string().optional(),
  onlineUrl: z.string().optional(),
  startDate: z.preprocess(
    (arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    },
    z.date({
      required_error: "La date de début est requise.",
      invalid_type_error: "Format de date invalide."
    }).min(new Date(new Date().setSeconds(0, 0)), { message: "La date de début ne peut pas être dans le passé." })
  ),
  endDate: z.string().min(1, { message: "La date de fin est requise." }),
})
const step3Schema = z.object({
  price: z.coerce.number().min(0, 'Le prix doit être positif.'),
  maxParticipants: z.coerce
    .number()
    .min(1, 'Il doit y avoir au moins 1 participant.'),
  images: z.any().optional()
})
const combinedSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .refine(
    data => {
      if (data.isOnline) {
        return (
          !!data.onlineUrl &&
          z
            .string()
            .url('Veuillez fournir une URL valide.')
            .safeParse(data.onlineUrl).success
        )
      }
      return !!data.location
    },
    {
      message:
        "Le lieu est requis pour un événement physique, ou l'URL pour un événement en ligne.",
      path: ['location']
    }
  )
  .refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: 'La date de fin doit être après la date de début.',
    path: ['endDate']
  })
const stepFields = [
  ['name', 'description', 'category'],
  ['isOnline', 'location', 'onlineUrl', 'startDate', 'endDate'],
  ['price', 'maxParticipants', 'images']
]

// --- Helper & Sub-Components ---
const formatDateTimeLocal = dateString => {
  if (!dateString) return ''
  const date = new Date(dateString)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

export const CustomStepIndicator = ({ currentStep, steps }) => (
  <div className='flex items-center justify-center p-4'>
    {steps.map((label, index) => (
      <React.Fragment key={label}>
        <div className='flex flex-col items-center'>
          <motion.div
            className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold`}
            animate={{
              backgroundColor: currentStep >= index ? '#11123a' : '#ffffff',
              color: currentStep >= index ? '#ffffff' : '#11123a'
            }}
            transition={{ duration: 0.3 }}
          >
            {index + 1}
          </motion.div>
          <p
            className={`mt-2 text-sm font-medium ${
              currentStep >= index
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-400'
            }`}
          >
            {label}
          </p>
        </div>
        {index < steps.length - 1 && (
          <motion.div
            className='mx-4 h-1 flex-1 rounded-full'
            animate={{
              backgroundColor: currentStep > index ? '#11123a' : '#e5e7eb'
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
)

// --- Main EventForm Component ---
export function EventForm ({ initialData, onFormSuccess }) {
  const [step, setStep] = React.useState(0)
  const queryClient = useQueryClient()
  const isEditMode = Boolean(initialData?._id)

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations({ validated: true })
  })

  const {
    control,
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(combinedSchema),
    mode: 'onChange',
    defaultValues: initialData
      ? {
          ...initialData,
          images: undefined // Clear images on reset to avoid issues with FileList
        }
      : { name: '', description: '', startDate: '', endDate: '', location: '', category: '', isOnline: false, onlineUrl: '', images: undefined }
  })

  const watchedImages = watch('images')
  const [previewUrls, setPreviewUrls] = React.useState([])
  const [currentExistingImages, setCurrentExistingImages] = React.useState([])
  const [imagesToDelete, setImagesToDelete] = React.useState([])

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        startDate: formatDateTimeLocal(initialData.startDate),
        endDate: formatDateTimeLocal(initialData.endDate),
        location: initialData.location?._id || initialData.location,
        category: initialData.category?._id || initialData.category,
        images: undefined
      })
      setCurrentExistingImages(initialData.images || []) // Set existing images
      setImagesToDelete([]) // Clear imagesToDelete on new initialData
    } else {
      reset({ isOnline: false, price: 0, maxParticipants: 1 })
      setCurrentExistingImages([]) // Clear for new form
      setImagesToDelete([]) // Clear for new form
    }
    setStep(0)
  }, [initialData, reset])

  React.useEffect(() => {
    if (initialData && categories && initialData.category) {
      const categoryId = initialData.category._id || initialData.category
      setValue('category', categoryId)
    }
    if (initialData && locations && initialData.location) {
      const locationId = initialData.location._id || initialData.location
      setValue('location', locationId)
    }
  }, [initialData, categories, locations, setValue])

  React.useEffect(() => {
    let newUrls = []
    let objectUrlsCreated = false

    // Case 1: User has selected new files. This takes priority.
    if (watchedImages instanceof FileList && watchedImages.length > 0) {
      const files = Array.from(watchedImages)
      newUrls = files
        .filter(file => file instanceof File)
        .map(file => URL.createObjectURL(file))
      objectUrlsCreated = true
      setPreviewUrls(newUrls)
    }
    // Case 2: No new files selected, but we are in edit mode and have initial images.

    // Case 3: No new files, not in edit mode, or no initial images.
    else {
      setPreviewUrls([])
    }

    // Cleanup function: only revoke URLs if they were created with createObjectURL
    return () => {
      if (objectUrlsCreated) {
        newUrls.forEach(url => URL.revokeObjectURL(url))
      }
    }
  }, [watchedImages, initialData, isEditMode])

  const isOnline = watch('isOnline')

  const mutation = useMutation({
    mutationFn: isEditMode
      ? data => updateEvent(initialData._id, data)
      : createEvent,
    onSuccess: () => {
      toast.success(
        `Événement ${isEditMode ? 'mis à jour' : 'créé'} avec succès !`
      )
      queryClient.invalidateQueries({ queryKey: ['events'] })
      onFormSuccess()
    },
    onError: error => {
      toast.error(error.response?.data?.message || error.message)
    }
  })

  const handleNext = async () => {
    const fields = stepFields[step]
    const isValid = await trigger(fields)
    if (isValid) {
      setStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setStep(prev => prev - 1)
  }

  const handleRemoveExistingImage = imagePath => {
    setImagesToDelete(prev => [...prev, imagePath])
  }

  const onSubmit = data => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'images') {
        if (data.images && data.images.length > 0) {
          for (let i = 0; i < data.images.length; i++) {
            formData.append('images', data.images[i])
          }
        }
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    })

    // Add images to delete
    if (imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete))
    }

    if (isEditMode && (!data.images || data.images.length === 0)) {
      formData.delete('images') // If no new images, don't send empty array
    }
    mutation.mutate(formData)
  }

  const stepLabels = ['Informations', 'Lieu & Date', 'Détails']

  const variants = {
    enter: direction => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: direction => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }

  return (
    <div className='max-w-5xl mx-auto rounded-4xl shadow-gray-400  bg-gray-300 dark:bg-gray-800 shadow-2xl overflow-hidden '>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='p-6'>
          <CustomStepIndicator currentStep={step} steps={stepLabels} />
        </div>

        <div className='p-6 space-y-4 min-h-[40vh] overflow-hidden relative'>
          <AnimatePresence mode='wait' custom={step}>
            <motion.div
              key={step}
              custom={step}
              variants={variants}
              initial='enter'
              animate='center'
              exit='exit'
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='w-full'
            >
              {step === 0 && (
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Nom de l'événement</Label>
                    <Input
                      id='name'
                      {...register('name')}
                      className={'bg-white'}
                    />
                    <p className='text-red-500 text-sm'>
                      {errors.name?.message}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      {...register('description')}
                      className={'bg-white dark:bg-gray-500'}
                    />
                    <p className='text-red-500 text-sm'>
                      {errors.description?.message}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label>Catégorie</Label>
                    <Controller
                      name='category'
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            key={initialData?._id || 'new-event-category'}
                            onValueChange={field.onChange}
                            value={field.value}
                            className={'bg-white'}
                          >
                            <SelectTrigger className={'bg-white'}>
                              <SelectValue placeholder='Sélectionnez une catégorie' />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <SelectItem value='loading' disabled>
                                  Chargement...
                                </SelectItem>
                              ) : (
                                categories?.map(cat => (
                                  <SelectItem key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )
                      }}
                    />
                    <p className='text-red-500 text-sm'>
                      {errors.category?.message}
                    </p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className='space-y-6'>
                  <div className='flex items-center space-x-2'>
                    <Controller
                      name='isOnline'
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id='isOnline'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor='isOnline'>Cet événement est en ligne</Label>
                  </div>

                  {isOnline ? (
                    <div className='space-y-2'>
                      <Label htmlFor='onlineUrl'>URL de l'événement</Label>
                      <Input
                        id='onlineUrl'
                        {...register('onlineUrl')}
                        placeholder='https://example.com'
                        className={'bg-white'}
                      />
                      <p className='text-red-500 text-sm'>
                        {errors.onlineUrl?.message || errors.location?.message}
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <Label>Lieu</Label>
                      <Controller
                        name='location'
                        control={control}
                        render={({ field }) => (
                          <Select
                            key={initialData?._id || 'new-event-location'}
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingLocations}
                          >
                            <SelectTrigger className={'bg-white'}>
                              <SelectValue placeholder='Sélectionnez un lieu' />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingLocations ? (
                                <SelectItem value='loading' disabled>
                                  Chargement...
                                </SelectItem>
                              ) : (
                                locations?.map(loc => (
                                  <SelectItem key={loc._id} value={loc._id}>
                                    {loc.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className='text-red-500 text-sm'>
                        {errors.location?.message}
                      </p>
                    </div>
                  )}

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='startDate'>Date et heure de début</Label>
                    <Input id='startDate' type='datetime-local' {...register('startDate')} className={"bg-white"} />
                    <p className='text-red-500 text-sm'>
                      {errors.startDate?.message}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='endDate'>Date et heure de fin</Label>
                    <Input id='endDate' type='datetime-local' {...register('endDate')} className={"bg-white"} />
                    <p className='text-red-500 text-sm'>
                      {errors.endDate?.message}
                    </p>
                  </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='price'>Prix (en €)</Label>
                    <Input
                      id='price'
                      type='number'
                      step='0.01'
                      {...register('price')}
                      className={'bg-white'}
                    />
                    <p className='text-red-500 text-sm'>
                      {errors.price?.message}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='maxParticipants'>
                      Participants maximum
                    </Label>
                    <Input
                      id='maxParticipants'
                      type='number'
                      {...register('maxParticipants')}
                      className={'bg-white'}
                    />
                    <p className='text-red-500 text-sm'>
                      {errors.maxParticipants?.message}
                    </p>
                  </div>
                  <div className='space-y-2 col-span-2'>
                    <Label htmlFor='images'>Images</Label>
                    <Input
                      id='images'
                      type='file'
                      multiple
                      accept='image/*'
                      {...register('images')}
                      className={'bg-white'}
                    />
                    <p className='text-red-500 text-sm'>
                      {errors.images?.message}
                    </p>
                  </div>

                  {/* Section for Existing Images */}
                  {isEditMode && currentExistingImages.length > 0 && (
                    <div className='col-span-2'>
                      <Label>Images existantes</Label>
                      <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                        {currentExistingImages
                          .filter(path => !imagesToDelete.includes(path)) // Filter out marked for deletion
                          .map((imagePath, index) => (
                            <div key={imagePath} className='relative'>
                              <img
                                src={`${IMAGE_BASE_URL}/${
                                  imagePath.startsWith('uploads/')
                                    ? imagePath
                                    : `uploads/${imagePath}`
                                }`}
                                alt={`Image existante ${index + 1}`}
                                className='w-full h-32 object-cover rounded-lg shadow-md'
                              />
                              <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute top-1 right-1 h-6 w-6 rounded-full'
                                onClick={() =>
                                  handleRemoveExistingImage(imagePath)
                                }
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Section for Newly Selected Images */}
                  {previewUrls.length > 0 && (
                    <div className='col-span-2'>
                      <Label>Nouvelles images sélectionnées</Label>
                      <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                        {previewUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Nouvelle image ${index + 1}`}
                            className='w-full h-32 object-cover rounded-lg shadow-md'
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <CardFooter className='pt-4  bg-gray-300 p-3 px-10 dark:bg-gray-800'>
          <div className='flex justify-between w-full'>
            <div>
              <Button
                variant='outline'
                type='button'
                onClick={() => onFormSuccess()}
              >
                Annuler
              </Button>
            </div>
            <div className='flex gap-2'>
              {step > 0 && (
                <Button type='button' variant='outline' onClick={handlePrev}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Précédent
                </Button>
              )}
              {step < 2 && (
                <Button type='button' onClick={handleNext}>
                  Suivant
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              )}
              {step === 2 && (
                <Button type='submit' disabled={mutation.isPending}>
                  {mutation.isPending
                    ? 'Enregistrement...'
                    : isEditMode
                    ? 'Enregistrer les modifications'
                    : 'Enregistrer'}
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </form>
    </div>
  )
}
