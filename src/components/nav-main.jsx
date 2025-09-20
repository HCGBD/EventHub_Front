import { IconCirclePlusFilled } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { LucideCalendarPlus } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function NavMain ({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          <SidebarMenuItem className='flex items-center gap-2'>
            <SidebarMenuButton
              tooltip='Quick Create'
              className='bg-amber-50 text-black hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/10 active:text-primary-foreground min-w-8 duration-200 ease-linear'
            >
              <IconCirclePlusFilled  />
              <span>Ajouter un Evemenent</span>
            </SidebarMenuButton>
            <Button
              size='icon'
              className='size-8 not-dark:text-black group-data-[collapsible=icon]:opacity-0'
              variant='outline'
            >
              <LucideCalendarPlus />
              <span className='sr-only'>Event</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <NavLink to={item.url}>
                {({ isActive }) => (
                  <SidebarMenuButton
                    className={isActive ? 'bg-muted text-black dark:text-white' : ''}
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon   />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}