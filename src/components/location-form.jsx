import React, { useState, useEffect, useCallback } from 'react';
import { IMAGE_BASE_URL } from '@/lib/config';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { createLocation, updateLocation } from '@/lib/api';
import { CustomStepIndicator } from '@/components/event-form';
import { MapInput } from './MapInput'; // Assuming CustomStepIndicator is exported from event-form

const step1Schema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }).max(100, { message: "Le nom ne doit pas dépasser 100 caractères." }),
  description: z.string().max(500, { message: "La description ne doit pas dépasser 500 caractères." }).optional(),
  address: z.string().max(200, { message: "L'adresse ne doit pas dépasser 200 caractères." }).optional(), // Nouveau champ
  coordinates: z.object({ // Nouveau champ pour les coordonnées
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional().nullable(), // Permettre que les coordonnées soient nulles ou non définies
});
const step2Schema = z.object({
  images: z.any().optional()
});
const combinedSchema = step1Schema.merge(step2Schema);

const stepFields = [
  ['name', 'description', 'address'], // 'address' reste dans la première étape
  ['coordinates.latitude', 'coordinates.longitude'], // Nouvelle étape pour les coordonnées
  ['images']
];

const stepLabels = ['Informations', 'Localisation', 'Images']

export function LocationForm ({ initialData, onFormSuccess }) {
  const [step, setStep] = React.useState(0)
  const queryClient = useQueryClient()
  const isEditMode = Boolean(initialData?._id)

  const { control, register, handleSubmit, trigger, watch, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(combinedSchema),
    mode: 'onChange',
    defaultValues: initialData
      ? {
          ...initialData,
          address: initialData.address || '', // Assurer une valeur par défaut
          coordinates: initialData.coordinates || { latitude: undefined, longitude: undefined }, // Assurer une valeur par défaut
        }
      : { name: '', description: '', address: '', coordinates: { latitude: undefined, longitude: undefined }, images: undefined }
  })

  const watchedImages = watch('images')
  const watchedCoordinates = watch('coordinates'); // Nouveau: pour passer à MapInput

  const [previewUrls, setPreviewUrls] = React.useState([])
  const [currentExistingImages, setCurrentExistingImages] = React.useState([]);
  const [imagesToDelete, setImagesToDelete] = React.useState([]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = React.useState(null);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Erreur lors du géocodage de l'adresse:", error);
      toast.error("Erreur lors de la recherche d'adresse.");
      setSearchResults([]);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      geocodeAddress(searchTerm.trim());
    }
  };

  const handleSelectSearchResult = (result) => {
    setSelectedSearchResult(result);
    const newCoordinates = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    setValue('coordinates.latitude', newCoordinates.latitude, { shouldValidate: true });
    setValue('coordinates.longitude', newCoordinates.longitude, { shouldValidate: true });
    // Optionnel: Mettre à jour le champ 'address' du formulaire avec l'adresse trouvée

  };

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        images: undefined // Clear images on reset to avoid issues with FileList
      });
      setCurrentExistingImages(initialData.images || []); // Set existing images
      setImagesToDelete([]); // Clear imagesToDelete on new initialData
    } else {
      reset({ name: '', description: '', images: undefined });
      setCurrentExistingImages([]); // Clear for new form
      setImagesToDelete([]); // Clear for new form
    }
    setStep(0);
  }, [initialData, reset]);

  React.useEffect(() => {
    let newUrls = []
    let objectUrlsCreated = false

    if (watchedImages instanceof FileList && watchedImages.length > 0) {
      const files = Array.from(watchedImages)
      newUrls = files
        .filter(file => file instanceof File)
        .map(file => URL.createObjectURL(file))
      objectUrlsCreated = true
      setPreviewUrls(newUrls)
    } else {
      setPreviewUrls([])
    }

    return () => {
      if (objectUrlsCreated) {
        newUrls.forEach(url => URL.revokeObjectURL(url))
      }
    }
  }, [watchedImages, initialData, isEditMode])

  const mutation = useMutation({
    mutationFn: isEditMode
      ? data => updateLocation(initialData._id, data)
      : createLocation,
    onSuccess: () => {
      toast.success(
        `Lieu ${isEditMode ? 'mis à jour' : 'créé'} avec succès !`
      )
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      onFormSuccess() // Callback to close modal or redirect
    },
    onError: error => {
      toast.error(`Erreur ici  ${error.response?.data?.message || error.message} `)
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

  const handleRemoveExistingImage = (imagePath) => {
    setImagesToDelete(prev => [...prev, imagePath]);
  };

  const onSubmit = data => {
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      if (key === 'images') {
        if (data.images && data.images.length > 0) {
          for (let i = 0; i < data.images.length; i++) {
            formData.append('images', data.images[i])
          }
        }
      } else if (key === 'coordinates' && data[key] !== undefined && data[key] !== null) {
        // Sérialiser l'objet coordinates en JSON
        formData.append(key, JSON.stringify(data[key]));
      }
      else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    })

    // Add images to delete
    if (imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    if (isEditMode && (!data.images || data.images.length === 0)) {
      formData.delete('images') // If no new images, don't send empty array
    }
    mutation.mutate(formData)
  }

  

  const variants = {
    enter: direction => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: direction => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  }

  const handleMapCoordinatesChange = ({ latitude, longitude }) => {
    setValue('coordinates.latitude', latitude, { shouldValidate: true });
    setValue('coordinates.longitude', longitude, { shouldValidate: true });
  };

  return (
    <div className='max-w-3xl mx-auto rounded-2xl bg-gray-300 dark:bg-gray-800 shadow-2xl overflow-hidden'>
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
                    <Label htmlFor='name'>Nom du lieu</Label>
                    <Input id='name' {...register('name')} className={"bg-white"} />
                    <p className='text-red-500 text-sm'>
                      {errors.name?.message}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea id='description' {...register('description')} className={"not-dark:bg-white dark:bg-gray-500"} />
                    <p className='text-red-500 text-sm'>
                      {errors.description?.message}
                    </p>
                  </div>
                  {/* Nouveaux champs pour l'adresse et les coordonnées */}
                  <div className='space-y-2'>
                    <Label htmlFor='address'>Adresse</Label>
                    <Input id='address' {...register('address')} className={"bg-white"} />
                    <p className='text-red-500 text-sm'>
                      {errors.address?.message}
                    </p>
                  </div>
                  
                </div>
              )}

              {step === 1 && (
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='searchAddress'>Rechercher une adresse</Label>
                    <div className='flex space-x-2'>
                      <Input
                        id='searchAddress'
                        type='text'
                        placeholder='Ex: Tour Eiffel, Paris'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={"bg-white"}
                      />
                      <Button type='button' onClick={handleSearch}>Rechercher</Button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className='space-y-2'>
                      <Label>Résultats de la recherche</Label>
                      <div className='max-h-40 overflow-y-auto border rounded-md p-2 bg-white'>
                        {searchResults.map((result) => (
                          <div
                            key={result.place_id}
                            className='p-2 hover:bg-gray-100 cursor-pointer'
                            onClick={() => handleSelectSearchResult(result)}
                          >
                            {result.display_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSearchResult && (
                    <div className='space-y-2'>
                      <Label>Coordonnées sélectionnées</Label>
                      <p className='text-sm'>
                        Latitude: {selectedSearchResult.lat}, Longitude: {selectedSearchResult.lon}
                      </p>
                      <p className='text-sm'>
                        Adresse: {selectedSearchResult.display_name}
                      </p>
                    </div>
                  )}

                  <div className='space-y-2'>
                    <Label>Sélectionner sur la carte</Label>
                    <MapInput
                      initialCoordinates={watchedCoordinates}
                      onCoordinatesChange={handleMapCoordinatesChange}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className='grid grid-cols-1 gap-6'>
                  <div className='space-y-2 col-span-1'>
                    <Label htmlFor='images'>Images</Label>
                    <Input
                      id='images'
                      type='file'
                      multiple
                      accept='image/*'
                      {...register('images')}
                      className={"bg-white"}
                    />
                    <p className='text-red-500 text-sm'>
                      {errors.images?.message}
                    </p>
                  </div>

                  {/* Section for Existing Images */}
                  {isEditMode && currentExistingImages.length > 0 && (
                    <div className='col-span-1'>
                      <Label>Images existantes</Label>
                      <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                        {currentExistingImages
                          .filter(path => !imagesToDelete.includes(path)) // Filter out marked for deletion
                          .map((imagePath, index) => (
                            <div key={imagePath} className='relative'>
                              <img
                                src={imagePath.startsWith('http') ? imagePath : `${IMAGE_BASE_URL}/${imagePath}`}
                                alt={`Image existante ${index + 1}`}
                                className='w-full h-32 object-cover rounded-lg shadow-md'
                              />
                              <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute top-1 right-1 h-6 w-6 rounded-full'
                                onClick={() => handleRemoveExistingImage(imagePath)}
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
                    <div className='col-span-1'>
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

        <CardFooter className='pt-4 bg-gray-300 p-3 dark:bg-gray-800'>
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
              {step < stepLabels.length - 1 && (
                <Button type='button' onClick={handleNext}>
                  Suivant
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              )}
              {step === stepLabels.length - 1 && (
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
