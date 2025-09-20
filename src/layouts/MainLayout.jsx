import { Outlet, useLocation } from 'react-router-dom'
import { Navbar05 } from '@/components/ui/shadcn-io/navbar-05'
import LightRays from '@/components/LightRays'
import { useEffect } from 'react'
import useAuthStore from '@/stores/authStore'
import Footer from '@/components/Footer'

function MainLayout () {
  const justLoggedOut = useAuthStore((state) => state.justLoggedOut);
  const resetJustLoggedOut = useAuthStore((state) => state.resetJustLoggedOut);
  const location = useLocation();

  // Vérifie si le chemin correspond à une page de détail d'événement (ex: /events/quelquechose)
  const isEventDetailPage = /^\/events\/.+/.test(location.pathname);


  useEffect(() => {
    if (justLoggedOut) {
      resetJustLoggedOut();
    }
  }, [justLoggedOut, resetJustLoggedOut]);

  return (
    <div className='bg-background min-h-screen flex flex-col'>
      <LightRays
        raysOrigin='top-center'
        raysColor='#00ffff'
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        distortion={0.05}
        className='fixed inset-0 z-0'
      />
      <div className='relative z-10 flex flex-col flex-grow'>
        <header className='sticky top-0 z-50'>
          <Navbar05 />
        </header>
        <main className={`flex-grow ${isEventDetailPage ? '' : 'px-3'}`}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default MainLayout