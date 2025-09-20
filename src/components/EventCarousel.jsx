import React from 'react';
import { IMAGE_BASE_URL } from '@/lib/config';
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { SplittingText } from '@/components/ui/shadcn-io/splitting-text'
import TypingText from '@/components/ui/shadcn-io/typing-text'
import { ShimmeringText } from '@/components/ui/shadcn-io/shimmering-text'
import { ContainerTextFlip } from '@/components/ui/shadcn-io/container-text-flip'
import { useQuery } from '@tanstack/react-query'
import { getSettings } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

const EventCarousel = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['appSettings'],
    queryFn: getSettings
  })

  if (isLoading) {
    return (
      <div className='relative mb-5 w-full h-[513px] rounded-xl overflow-hidden'>
        <Skeleton className='w-full h-full' />
      </div>
    )
  }

  if (isError || !settings) {
    return (
      <div className='relative mb-5 w-full h-[513px] rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center text-red-500'>
        Erreur lors du chargement du carrousel.
      </div>
    )
  }

  const carouselImages = settings.carousel || [] // Use the new 'carousel' field
  const carouselWelcomeText = settings.carouselWelcomeText || 'Bienvenue chez'
  const carouselAppNameText = settings.carouselAppNameText || 'Event Hub'
  const carouselDescriptionText = settings.carouselDescriptionText || 'Découvrez les meilleurs événements près de chez vous'

  return (
    <div className='relative mb-5 w-full h-[513px] rounded-xl overflow-hidden'>
      <Carousel
        plugins={[plugin.current]}
        className='w-full h-full '
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className='h-full'>
          {carouselImages.length > 0 ? (
            carouselImages.map((imageUrl, index) => (
              <CarouselItem key={index} className='  '>
                <img
                  src={imageUrl.startsWith('http') ? imageUrl : `${IMAGE_BASE_URL}/${imageUrl}`}
                  alt={`Carrousel ${index + 1}`}
                  className='w-full  h-[513px] object-cover  '
                />
              </CarouselItem>
            ))
          ) : (
            <CarouselItem className='  '>
              <img
                src={'https://picsum.photos/1920/1080?random=1'} // Fallback image
                alt={'Default Carousel'}
                className='w-full  h-[513px] object-cover  '
              />
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className='absolute left-4 top-1/2 -translate-y-1/2 z-10' />
        <CarouselNext className='absolute right-4 top-1/2 -translate-y-1/2 z-10' />
      </Carousel>
      <div className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center z-5'>
        <div className='flex '>
          <h1 className='text-4xl md:text-7xl font-extrabold text-white ' >{carouselWelcomeText} </h1>
            {' '}
          <ContainerTextFlip
            words={[carouselAppNameText, carouselAppNameText, carouselAppNameText]}
            interval={2500}
            animationDuration={600}
          />
        </div>

        <TypingText
          text={[carouselDescriptionText, carouselDescriptionText, carouselDescriptionText]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          className=' text-3xl md:text-4xl font-bold text-center max-w-2xl'
          cursorClassName='h-12'
          textColors={['#539eda', '#f0674e', '#ab85db']}
          variableSpeed={{ min: 50, max: 120 }}
        />
      </div>
    </div>
  )
}

export default EventCarousel
