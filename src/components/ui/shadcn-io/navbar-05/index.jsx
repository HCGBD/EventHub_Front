'use client'
import * as React from 'react'
import { useEffect, useState, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import useAuthStore from '@/stores/authStore'

import { IconLogout, IconUserCircle } from '@tabler/icons-react'
import { LayoutDashboard, Calendar, ChevronDownIcon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from '@/components/ui/navigation-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import logoEvent from '../../../../assets/img/logoEvent.png'
import logoEventBlack from '../../../../assets/img/LogoBlack.png'
import StarBorder from '@/components/StarBorder'
import { ModeToggle } from '@/components/mode-toggle'
import { useTheme } from '@/components/theme-provider'

// --- Définition du UserMenu --- //
const UserMenu = ({ user, handleLogout }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='ghost' className='relative me-5  h-8 w-8 rounded-full'>
        <Avatar className=' h-10 w-10 '>
          <AvatarImage src={user.avatar} alt={user.prenom} />
          <AvatarFallback
            className={
              'bg-[#11123a]/90 border-2 border-white text-gray-50 font-extrabold'
            }
          >
            {user.prenom?.[0]}

            {user.nom?.[0]}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className='w-56 ' align='end' forceMount>
      <DropdownMenuLabel className='font-normal'>
        <div className='flex flex-col space-y-1'>
          <p className='text-sm font-medium leading-none'>
            {user.prenom} {user.nom}
          </p>
          <p className='text-xs leading-none text-muted-foreground'>
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <NavLink
            to={`/participant/profile`}
            className='flex items-center w-full cursor-pointer'
          >
            <IconUserCircle className='mr-2 h-4 w-4' />
            <span>Mon Profil</span>
          </NavLink>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
        <IconLogout className='mr-2 h-4 w-4' />
        <span>Déconnexion</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

const HamburgerIcon = ({ className, ...props }) => (
  <svg
    className={cn('pointer-events-none', className)}
    width={16}
    height={16}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M4 12L20 12'
      className='origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]'
    />
    <path
      d='M4 12H20'
      className='origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45'
    />
    <path
      d='M4 12H20'
      className='origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]'
    />
  </svg>
)

// --- Composant Principal Navbar05 --- //

export const Navbar05 = React.forwardRef(({ className, ...props }, ref) => {
  // Logique de données directement ici
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const { theme } = useTheme()

  // Définition des liens de navigation

  const navUser = [
    { to: '/participant', label: 'Acceuil' },
    { to: '/events', label: 'Événements' },
    { to: '/locations', label: 'Lieux' },
    {
      to: '/participant/my-participated-events',
      label: 'Mes Événements Participés'
    },
    { to: '/participant/my-tickets', label: 'Mes Billets' },
    { to: '/about', label: 'A Propos' },
    { to: '/contact', label: 'Contact' }
  ]

  const navVisiteur = [
    { to: '/', label: 'Acceuil' },
    { to: '/events', label: 'Événements' },
    { to: '/locations', label: 'Lieux' },
    { to: '/about', label: 'A Propos' },
    { to: '/contact', label: 'Contact' }
  ]

  const navigationLinks = React.useMemo(() => {
    if (user) {
      if (user.role === 'participant') {
        return navUser
      } else if (user.role === 'admin' || user.role === 'organizer') {
        return navVisiteur // No main navigation links for admin/organizer
      }
    }
    return navVisiteur
  }, [user, navUser, navVisiteur])

  // Logique d'affichage
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setIsMobile(width < 768)
      }
    }
    checkWidth()
    const resizeObserver = new ResizeObserver(checkWidth)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const combinedRef = React.useCallback(
    node => {
      containerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const navLinkClasses = ({ isActive }) =>
    cn(
      ' hover:text-gray-200 dark:text-black hover:bg-[#11123a]/70 font-bold transition-colors group inline-flex h-10 w-max items-center justify-center rounded-2xl dark:bg-gray-200 bg-background/50 backdrop-blur-xl px-4 py-2 not-dark:text-gray-800 focus:bg-accent/30 focus:text-accent-foreground focus:outline-none',
      isActive &&
        'not-dark:text-gray-50 bg-[#11123a] dark:bg-[#11123a] dark:text-gray-50 dark:border dark:border-white'
    )
  const mobileNavLinkClasses = ({ isActive }) =>
    cn(
      'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/30 hover:text-accent-foreground',
      isActive && 'text-primary bg-accent/30'
    )

  return (
    <header
      ref={combinedRef}
      className={cn(
        'sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/0 px-4 md:px-6 [&_*]:no-underline py-5 ',
        className
      )}
      {...props}
    >
      <div className='container mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 border  border-gray-400 dark:border-gray-50 pb-1  pe-3 ps-3 rounded-full  shadow-2xl shadow-gray-800 '>
        {/* Left side */}
        <div className='flex items-center gap-2'>
          {isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className='group h-9 w-9 hover:bg-accent hover:text-accent-foreground'
                  variant='ghost'
                  size='icon'
                >
                  <HamburgerIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align='start' className='w-64 p-1'>
                <NavigationMenu className='max-w-none'>
                  <NavigationMenuList className='flex-col items-start gap-0'>
                    {navigationLinks.map((link, index) => {
                      return (
                        <NavigationMenuItem key={index} className='w-full'>
                          <NavLink
                            to={link.to}
                            end={link.to === '/' || link.to === '/participant'}
                            className={mobileNavLinkClasses}
                          >
                            {link.label}
                          </NavLink>
                        </NavigationMenuItem>
                      )
                    })}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          )}
          <div className='flex items-center gap-6'>
            <NavLink
              to='/'
              end
              className='flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer'
            >
              <div className='text-2xl'>
                <img
                  className='w-23 h-23'
                  src={theme === 'dark' ? logoEventBlack : logoEvent}
                  alt=''
                />
              </div>
            </NavLink>
            {!isMobile && navigationLinks && navigationLinks.length > 0 && (
              <NavigationMenu className='flex'>
                <NavigationMenuList className='gap-1'>
                  {navigationLinks.map((link, index) => {
                    return (
                      <NavigationMenuItem className={''} key={index}>
                        <NavLink to={link.to} end={link.to === '/' || link.to === '/participant'} className={navLinkClasses}>
                          {link.label}
                        </NavLink>
                      </NavigationMenuItem>
                    )
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
        </div>
        {/* Right side */}
        <div className='flex items-center gap-4'>
          <ModeToggle />
          {user ? (
            user.role === 'admin' || user.role === 'organizer' ? (
              <Button
                onClick={() => {
                  if (user.role === 'admin') {
                    navigate('/admin/dashboard')
                  } else if (user.role === 'organizer') {
                    navigate('/organizer/dashboard')
                  }
                }}
                className={'rounded-4xl  hover:bg-green-500 hover:text-white'}
              >
                <LayoutDashboard className='mr-2 h-4 w-4' />
                Mon espace
              </Button>
            ) : (
              <UserMenu user={user} handleLogout={handleLogout} />
            )
          ) : (
            <Button
              className={
                'rounded-4xl font-bold hover:bg-green-500 hover:text-white'
              }
              asChild
            >
              <Link to='/login'>Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
})

Navbar05.displayName = 'Navbar05'
