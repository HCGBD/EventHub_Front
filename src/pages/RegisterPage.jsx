import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { IMAGE_BASE_URL } from '@/lib/config';

import { getSettings, updateSettings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';



const valueItemSchema = z.object({
  title: z.string().min(1, { message: 'Le titre de la valeur est requis.' }),
  description: z.string().min(1, { message: 'La description de la valeur est requise.' }),
  icon: z.string().optional(), // Assuming icon names are strings
});

const settingsSchema = z.object({
  mainLogo: z.any().optional(), // FileList for new logo, or string for existing path
  darkModeLogo: z.any().optional(), // FileList for new dark mode logo, or string for existing path
  aboutText: z.string().min(10, { message: 'Le texte "À propos" doit contenir au moins 10 caractères.' }),
  carousel: z.array(z.string()).optional(), // Array of existing image URLs
  newCarouselImages: z.any().optional(), // FileList for new carousel images
  carouselWelcomeText: z.string().min(1, { message: 'Le texte de bienvenue du carrousel est requis.' }),
  carouselAppNameText: z.string().min(1, { message: 'Le nom de l\'application du carrousel est requis.' }),
  carouselDescriptionText: z.string().min(1, { message: 'La description du carrousel est requise.' }),

  // New fields for AboutPage
  founderName: z.string().min(1, { message: 'Le nom du fondateur est requis.' }),
  founderRole: z.string().min(1, { message: 'Le rôle du fondateur est requis.' }),
  founderImage: z.any().optional(), // String for existing path
  newFounderImage: z.any().optional(), // FileList for new founder image file
  founderBio: z.string().min(10, { message: 'La biographie du fondateur doit contenir au moins 10 caractères.' }),
  callToActionText: z.string().min(10, { message: 'Le texte d\'appel à l\'action doit contenir au moins 10 caractères.' }),
  values: z.array(valueItemSchema).optional(),
});

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: currentSettings, isLoading, isError } = useQuery({
    queryKey: ['appSettings'],
    queryFn: getSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      aboutText: '',
      carousel: [],
      newCarouselImages: undefined,
      carouselWelcomeText: '',
      carouselAppNameText: '',
      carouselDescriptionText: '',
      // New fields for AboutPage
      founderName: '',
      founderRole: '',
      founderImage: '', // Existing image path
      newFounderImage: undefined, // For new file upload
      founderBio: '',
      callToActionText: '',
      values: [],
    },
  });
  const [mainLogoPreview, setMainLogoPreview] = useState(null);
  const [darkModeLogoPreview, setDarkModeLogoPreview] = useState(null);
  const [founderImagePreview, setFounderImagePreview] = useState(null); // New state for founder image preview
  const [carouselPreviews, setCarouselPreviews] = useState([]); // Now an array of URLs

  // Watch for file changes
  const watchedMainLogo = watch('mainLogo');
  const watchedDarkModeLogo = watch('darkModeLogo');
  const watchedNewFounderImage = watch('newFounderImage'); // New watch for founder image
  const watchedCarousel = watch('carousel'); // Watch for existing carousel images
  const watchedNewCarouselImages = watch('newCarouselImages'); // Watch for new carousel image files
  const watchedValues = watch('values'); // New watch for values

  useEffect(() => {
    if (currentSettings) {
      reset({
        aboutText: currentSettings.aboutText,
        carousel: currentSettings.carousel || [],
        carouselWelcomeText: currentSettings.carouselWelcomeText,
        carouselAppNameText: currentSettings.carouselAppNameText,
        carouselDescriptionText: currentSettings.carouselDescriptionText,
        // New fields for AboutPage
        founderName: currentSettings.founderName || '',
        founderRole: currentSettings.founderRole || '',
        founderBio: currentSettings.founderBio || '',
        callToActionText: currentSettings.callToActionText || '',
        values: currentSettings.values || [],
      });
      setMainLogoPreview(currentSettings.mainLogo ? (currentSettings.mainLogo.startsWith('http') ? currentSettings.mainLogo : `${IMAGE_BASE_URL}/${currentSettings.mainLogo}`) : null);
      setDarkModeLogoPreview(currentSettings.darkModeLogo ? `http://localhost:5000/${currentSettings.darkModeLogo}` : null); // Set dark mode logo preview
    }
  }, [currentSettings, reset]);

  // Effect for main logo preview
  useEffect(() => {
    if (watchedMainLogo && watchedMainLogo.length > 0) {
      const file = watchedMainLogo[0];
      if (file instanceof File) {
        setMainLogoPreview(URL.createObjectURL(file));
        return () => URL.revokeObjectURL(file);
      }
    }
    else if (currentSettings && currentSettings.mainLogo) {
      setMainLogoPreview(`http://localhost:5000/${currentSettings.mainLogo}`);
    }
    else {
      setMainLogoPreview(null);
    }
  }, [watchedMainLogo, currentSettings]);

  // Effect for dark mode logo preview
  useEffect(() => {
    if (watchedDarkModeLogo && watchedDarkModeLogo.length > 0) {
      const file = watchedDarkModeLogo[0];
      if (file instanceof File) {
        setDarkModeLogoPreview(URL.createObjectURL(file));
        return () => URL.revokeObjectURL(file);
      }
    }
    else if (currentSettings && currentSettings.darkModeLogo) {
      setDarkModeLogoPreview(`http://localhost:5000/${currentSettings.darkModeLogo}`);
    }
    else {
      setDarkModeLogoPreview(null);
    }
  }, [watchedDarkModeLogo, currentSettings]);

  // Effect for founder image preview
  useEffect(() => {
    if (watchedNewFounderImage && watchedNewFounderImage.length > 0) {
      const file = watchedNewFounderImage[0];
      if (file instanceof File) {
        setFounderImagePreview(URL.createObjectURL(file));
        return () => URL.revokeObjectURL(file);
      }
    }
    else if (currentSettings && currentSettings.founderImage) {
      setFounderImagePreview(`http://localhost:5000/${currentSettings.founderImage}`);
    }
    else {
      setFounderImagePreview(null);
    }
  }, [watchedNewFounderImage, currentSettings]);




  // Effect for carousel image previews
  useEffect(() => {
    const newPreviews = [];
    const urlsToRevoke = [];

    // Add existing carousel images
    watchedCarousel?.forEach(imageUrl => {
      newPreviews.push(`${IMAGE_BASE_URL}/${imageUrl}`);
    });

    // Add new carousel image files
    if (watchedNewCarouselImages && watchedNewCarouselImages.length > 0) {
      Array.from(watchedNewCarouselImages).forEach(file => {
        if (file instanceof File) {
          const url = URL.createObjectURL(file);
          newPreviews.push(url);
          urlsToRevoke.push(url);
        }
      });
    }
    setCarouselPreviews(newPreviews);

    return () => {
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [watchedCarousel, watchedNewCarouselImages]);
  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast.success('Paramètres mis à jour avec succès !');
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour des paramètres.');
    },
  });

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('aboutText', data.aboutText);
    formData.append('carouselWelcomeText', data.carouselWelcomeText);
    formData.append('carouselAppNameText', data.carouselAppNameText);
    formData.append('carouselDescriptionText', data.carouselDescriptionText);

    // New fields for AboutPage
    formData.append('founderName', data.founderName);
    formData.append('founderRole', data.founderRole);
    formData.append('founderBio', data.founderBio);
    formData.append('callToActionText', data.callToActionText);
    formData.append('values', JSON.stringify(data.values)); // Values array as JSON string

    // Handle main logo file
    if (data.mainLogo && data.mainLogo.length > 0 && data.mainLogo[0] instanceof File) {
      formData.append('mainLogo', data.mainLogo[0]);
    }

    // Handle dark mode logo file
    if (data.darkModeLogo && data.darkModeLogo.length > 0 && data.darkModeLogo[0] instanceof File) {
      formData.append('darkModeLogo', data.darkModeLogo[0]);
    }

    // Handle new founder image file
    if (data.newFounderImage && data.newFounderImage.length > 0 && data.newFounderImage[0] instanceof File) {
      formData.append('founderImage', data.newFounderImage[0]); // Use 'founderImage' as field name for backend
    } else if (data.founderImage) {
      // If no new file, but there's an existing image path, send it
      formData.append('founderImage', data.founderImage);
    }

    // Handle existing carousel images (array of URLs)
    if (data.carousel && data.carousel.length > 0) {
      formData.append('carousel', JSON.stringify(data.carousel));
    } else {
      formData.append('carousel', JSON.stringify([])); // Ensure it's always an array
    }

    // Handle new carousel image files
    if (data.newCarouselImages && data.newCarouselImages.length > 0) {
      Array.from(data.newCarouselImages).forEach((file, index) => {
        formData.append(`newCarouselImages[${index}]`, file);
      });
    }

    mutation.mutate(formData);
  };



  const handleRemoveCarouselImage = (indexToRemove) => {
    const currentCarousel = watchedCarousel || [];
    const currentNewCarouselImages = watchedNewCarouselImages ? Array.from(watchedNewCarouselImages) : [];

    if (indexToRemove < currentCarousel.length) {
      // Removing an existing image
      const updatedCarousel = currentCarousel.filter((_, index) => index !== indexToRemove);
      setValue('carousel', updatedCarousel);
    } else {
      // Removing a new image
      const newImageIndex = indexToRemove - currentCarousel.length;
      const updatedNewCarouselImages = currentNewCarouselImages.filter((_, index) => index !== newImageIndex);
      setValue('newCarouselImages', updatedNewCarouselImages.length > 0 ? updatedNewCarouselImages : undefined);
    }
  };

  const handleBulkCarouselImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setValue('newCarouselImages', files); // Set the newCarouselImages field with the FileList
      event.target.value = null; // Clear the input
    }
  };

  const addValueItem = () => {
    setValue('values', [...(watchedValues || []), { title: '', description: '', icon: '' }]);
  };

  const removeValueItem = (indexToRemove) => {
    setValue('values', watchedValues.filter((_, index) => index !== indexToRemove));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent className="space-y-4"><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent className="space-y-4"><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
          <CardContent className="space-y-4"><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return <div className="container mx-auto py-10 text-red-500">Erreur lors du chargement des paramètres.</div>;
  }

  return (
    <motion.div
      className="container mx-auto py-10"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-8">Gestion des Paramètres du Site</motion.h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section Logo Principal (Light Mode) */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Logo Principal (Mode Clair)</CardTitle>
              <CardDescription>Mettez à jour le logo principal de votre site pour le mode clair.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mainLogoPreview && (
                <div className="mb-4">
                  <Label>Logo actuel/aperçu</Label>
                  <img src={mainLogoPreview} alt="Logo actuel" className="max-h-32 object-contain mt-2" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="mainLogo">Télécharger un nouveau logo (Mode Clair)</Label>
                <Input id="mainLogo" type="file" accept="image/*" {...register('mainLogo')} />
                {errors.mainLogo && <p className="text-red-500 text-sm">{errors.mainLogo.message}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Logo Principal (Dark Mode) */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Logo Principal (Mode Sombre)</CardTitle>
              <CardDescription>Mettez à jour le logo principal de votre site pour le mode sombre.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {darkModeLogoPreview && (
                <div className="mb-4">
                  <Label>Logo actuel/aperçu</Label>
                  <img src={darkModeLogoPreview} alt="Logo actuel (Mode Sombre)" className="max-h-32 object-contain mt-2" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="darkModeLogo">Télécharger un nouveau logo (Mode Sombre)</Label>
                <Input id="darkModeLogo" type="file" accept="image/*" {...register('darkModeLogo')} />
                {errors.darkModeLogo && <p className="text-red-500 text-sm">{errors.darkModeLogo.message}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Textes Globaux du Carrousel */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Textes Globaux du Carrousel</CardTitle>
              <CardDescription>Mettez à jour les textes principaux affichés sur le carrousel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="carouselWelcomeText">Texte de bienvenue</Label>
                <Input id="carouselWelcomeText" {...register('carouselWelcomeText')} />
                {errors.carouselWelcomeText && <p className="text-red-500 text-sm">{errors.carouselWelcomeText.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="carouselAppNameText">Nom de l\'application</Label>
                <Input id="carouselAppNameText" {...register('carouselAppNameText')} />
                {errors.carouselAppNameText && <p className="text-red-500 text-sm">{errors.carouselAppNameText.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="carouselDescriptionText">Texte de description</Label>
                <Textarea id="carouselDescriptionText" {...register('carouselDescriptionText')} rows={3} />
                {errors.carouselDescriptionText && <p className="text-red-500 text-sm">{errors.carouselDescriptionText.message}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Carrousel Items */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Images du Carrousel</CardTitle>
              <CardDescription>Gérez les images de votre carrousel. Les images existantes sont affichées ci-dessous, suivies des nouvelles images que vous avez sélectionnées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {carouselPreviews.map((imageUrl, index) => (
                  <motion.div
                    key={imageUrl + index} // Using imageUrl + index as key, assuming imageUrl is unique enough or index helps
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="relative group"
                  >
                    <img src={imageUrl} alt={`Carrousel ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveCarouselImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="bulkCarouselImages">Ajouter plusieurs images au carrousel</Label>
                <Input
                  id="bulkCarouselImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkCarouselImageUpload}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section À Propos */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Section "À Propos"</CardTitle>
              <CardDescription>Mettez à jour le texte de la section "À propos" de votre site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aboutText">Texte "À Propos"</Label>
                <Textarea id="aboutText" {...register('aboutText')} rows={6} />
                {errors.aboutText && <p className="text-red-500 text-sm">{errors.aboutText.message}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Fondateur */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Section Fondateur</CardTitle>
              <CardDescription>Mettez à jour les informations du fondateur.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {founderImagePreview && (
                <div className="mb-4">
                  <Label>Image actuelle/aperçu du fondateur</Label>
                  <img src={founderImagePreview} alt="Image du fondateur" className="max-h-32 object-contain mt-2" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newFounderImage">Télécharger une nouvelle image du fondateur</Label>
                <Input id="newFounderImage" type="file" accept="image/*" {...register('newFounderImage')} />
                {errors.newFounderImage && <p className="text-red-500 text-sm">{errors.newFounderImage.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderName">Nom du fondateur</Label>
                <Input id="founderName" {...register('founderName')} />
                {errors.founderName && <p className="text-red-500 text-sm">{errors.founderName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderRole">Rôle du fondateur</Label>
                <Input id="founderRole" {...register('founderRole')} />
                {errors.founderRole && <p className="text-red-500 text-sm">{errors.founderRole.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="founderBio">Biographie du fondateur</Label>
                <Textarea id="founderBio" {...register('founderBio')} rows={6} />
                {errors.founderBio && <p className="text-red-500 text-sm">{errors.founderBio.message}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Appel à l'Action */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Section Appel à l\'Action</CardTitle>
              <CardDescription>Mettez à jour le texte d\'appel à l\'action de la page "À propos".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="callToActionText">Texte d\'appel à l\'action</Label>
                <Textarea id="callToActionText" {...register('callToActionText')} rows={4} />
                {errors.callToActionText && <p className="text-red-500 text-sm">{errors.callToActionText.message}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Nos Valeurs */}
        <motion.div variants={itemVariants}>
          <Card className={"not-dark:bg-gray-300 not-dark:text-black  dark:bg-accent"}>
            <CardHeader>
              <CardTitle>Section "Nos Valeurs"</CardTitle>
              <CardDescription>Gérez les valeurs affichées sur la page "À propos".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
       
              <AnimatePresence>
                {watchedValues?.map((value, index) => (
                  <motion.div
                    key={index} // Using index as key, consider a unique ID if available
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="border p-4 rounded-lg relative"
                  >
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={() => removeValueItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor={`values.${index}.title`}>Titre</Label>
                      <Input
                        id={`values.${index}.title`}
                        {...register(`values.${index}.title`)}
                      />
                      {errors.values?.[index]?.title && <p className="text-red-500 text-sm">{errors.values[index].title.message}</p>}
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor={`values.${index}.description`}>Description</Label>
                      <Textarea
                        id={`values.${index}.description`}
                        {...register(`values.${index}.description`)}
                        rows={3}
                      />
                      {errors.values?.[index]?.description && <p className="text-red-500 text-sm">{errors.values[index].description.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`values.${index}.icon`}>Nom de l\'icône (doit correspondre à un composant lucide-react, ex: Users, Lightbulb)</Label>
                      <Input
                        id={`values.${index}.icon`}
                        {...register(`values.${index}.icon`)}
                      />
                      {errors.values?.[index]?.icon && <p className="text-red-500 text-sm">{errors.values[index].icon.message}</p>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button type="button" variant="outline" onClick={addValueItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une valeur
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}

