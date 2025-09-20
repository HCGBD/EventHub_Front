import { useQuery } from '@tanstack/react-query'
import { getOrganizerDashboardStats, getOrganizerEventsWithParticipants } from '@/lib/api'
import { SectionCards } from '@/components/section-cards'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconCalendarStats,
  IconUsersGroup,
  IconClockHour4,
  IconUserPlus
} from '@tabler/icons-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import React from 'react'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'

function OrganizerDashboard () {
  const {
    data: stats,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['organizerDashboardStats'],
    queryFn: getOrganizerDashboardStats
  })

  const {
    data: eventsChartData,
    isLoading: isChartLoading,
    isError: isChartError
  } = useQuery({
    queryKey: ['organizerEventsChart'],
    queryFn: getOrganizerEventsWithParticipants
  })

  const organizerCardsData = React.useMemo(() => {
    if (!stats) return []
    return [
      {
        title: 'Événements Créés',
        value: stats.totalEventsCreated || 0,
        description: 'Total de vos événements',
        Icon: IconCalendarStats
      },
      {
        title: 'Participants Totaux',
        value: stats.totalParticipants || 0,
        description: 'Inscriptions à vos événements',
        Icon: IconUsersGroup
      },
      {
        title: "En Attente d'Approbation",
        value: stats.pendingApprovalEvents || 0,
        description: 'Vos événements à valider',
        Icon: IconClockHour4
      },
      {
        title: 'Événements Rejetés',
        value: stats.rejectedEvents || 0,
        description: 'Vos événements refusés',
        Icon: IconUserPlus
      }
    ]
  }, [stats])

  if (isLoading || isChartLoading) {
    return (
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className='grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
          <Skeleton className='h-[120px]' />
          <Skeleton className='h-[120px]' />
          <Skeleton className='h-[120px]' />
          <Skeleton className='h-[120px]' />
        </div>
        <div className='px-4 lg:px-6'>
          <Skeleton className='h-[300px] w-full' />
        </div>
      </div>
    )
  }

  if (isError || isChartError) {
    return (
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6'>
        <p className='text-red-500'>
          Erreur lors du chargement des statistiques du tableau de bord de
          l'organisateur.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <h1 className='text-2xl font-semibold mb-6 px-4 lg:px-6'>
          Tableau de Bord 
        </h1>
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 '>
          {organizerCardsData.map((card, index) => (
            <Card key={index} className='@container/card hover:animate-squeeze'>
              <CardHeader>
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className='text-2xl  font-semibold tabular-nums @[250px]/card:text-3xl'>
                  {card.value}
                </CardTitle>
                <CardAction>
                  <Badge variant='outline'>
                    <card.Icon color='white' />
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  {card.description}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className='px-4 lg:px-6'>
            <ChartAreaInteractive data={eventsChartData} />
        </div>
      </div>
    </>
  )
}

export default OrganizerDashboard