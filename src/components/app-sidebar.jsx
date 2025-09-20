import * as React from 'react'
import {
  IconCalendar,
  IconCalendarEvent,
  IconCamera,
  IconCategory,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMapPinBolt,
  IconMapPinCode,
  IconMapPinCog,
  IconMapPinHeart,
  IconReport,
  IconSearch,
  IconSettings,
  IconUser,
  IconUsers
} from '@tabler/icons-react'

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

import logo from '../assets/img/LogoBlack.png'
import { NavLink } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard
    },
    {
      title: 'Evenement',
      url: '/events',
      icon: IconCalendarEvent
    },
    {
      title: 'Lieux',
      url: '/locations',
      icon: IconMapPinCode
    },
    {
      title: 'Categories',
      url: '/categories',
      icon: IconCategory,
      adminOnly: true
    },
    {
      title: 'Utilisateurs',
      url: '/users',
      icon: IconUser,
      adminOnly: true
    },
    // {
    //   title: 'Statistiques',
    //   url: '/statisitque',
    //   icon: IconChartBar,
    //   adminOnly: true
    // }
  ],
  navSecondary: [
    {
      title: 'Paramètres',
      url: '/settings',
      icon: IconSettings,
      adminOnly: true
    }
  ],
  documents: [
    {
      name: 'After',
      url: '#',
      icon: IconDatabase
    }
  ]
}

export function AppSidebar ({ ...props }) {
  const { user } = useAuthStore()

  // Filter and map main navigation based on user role
  const filteredNavMain = data.navMain
    .filter(item => {
      // Only show adminOnly items to admins
      if (item.adminOnly) {
        return user?.role === 'admin'
      }
      return true // Show all other items to everyone
    })
    .map(item => {
      let finalUrl = item.url
      // Prefix URLs based on user role
      if (user?.role === 'admin') {
        if (item.title === 'Dashboard') {
          finalUrl = '/admin/dashboard'
        } else {
          finalUrl = '/admin' + item.url // e.g., /admin/events
        }
      } else if (user?.role === 'organizer') {
        if (item.title === 'Dashboard') {
          finalUrl = '/organizer/dashboard'
        } else {
          finalUrl = '/organizer' + item.url
        }
      }
      return { ...item, url: finalUrl }
    })

  // Filter secondary navigation based on user role
  const filteredNavSecondary = data.navSecondary.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin'
    }
    return true
  });

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-4 hover:bg-n hover:text-white h-30 flex justify-center items-center '
            >
              <NavLink className={""} href='/'>
                <img src={logo} alt='' className='size-40 object-contain' />
                {/* <span className='text-base font-semibold'>Event Hub</span> */}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={filteredNavSecondary} className='mt-auto' /> {/* Use filteredNavSecondary */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
