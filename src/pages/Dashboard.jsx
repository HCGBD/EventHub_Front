import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';
import { SectionCards } from '@/components/section-cards';
import { ChartBarInteractive } from '@/components/chart-bar-interactive';
import { Skeleton } from '@/components/ui/skeleton';

function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <div className='px-4 lg:px-6'>
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6'>
        <p className="text-red-500">Erreur lors du chargement des statistiques du tableau de bord.</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
        <SectionCards stats={stats} />
        <div className='px-4 lg:px-6'>
          <ChartBarInteractive stats={stats} />
        </div>
      </div>
    </>
  );
}

export default Dashboard;