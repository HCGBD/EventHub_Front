import React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useLocation } from 'react-router-dom'

const EventMiniCarousel = ({ images }) => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );
  const location = useLocation();
   const isEventDetailPage = /^\/events\/.+/.test(location.pathname);
   const isLocationDetailPage = /^\/locations\/.+/.test(location.pathname);


  return (
    <div className={`relative w-full   ${isEventDetailPage || isLocationDetailPage ? 'md:h-96 ' : 'h-50'} rounded-t-md overflow-hidden`}>
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="h-full">
          {images.map((imageUrl, index) => (
            <CarouselItem key={index}>
              <img
                src={imageUrl}
                alt={`Event image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute not-dark:text-black left-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6" />
        <CarouselNext className="absolute not-dark:text-black right-2 top-1/2 -translate-y-1/2 z-10 h-6 w-6" />
      </Carousel>
    </div>
  );
};

export default EventMiniCarousel;
