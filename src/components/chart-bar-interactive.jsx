import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useQuery } from "@tanstack/react-query";
import { getEventActivityStats } from "@/lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton";

export const description = "A bar chart that shows an annual overview and allows drilling down to a daily view for each month."

const chartConfig = {
  evenements: {
    label: "Événements",
    color: "var(--chart-1)",
  },
}

export function ChartBarInteractive() {
  const [selectedYear, setSelectedYear] = React.useState('actuelle');
  const [selectedMonth, setSelectedMonth] = React.useState(null);

  const currentYearValue = selectedYear === 'actuelle' ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const currentMonthValue = selectedMonth !== null ? selectedMonth + 1 : undefined; // Backend expects 1-12 for month

  const { data: backendChartData, isLoading, isError } = useQuery({
    queryKey: ['eventActivityStats', currentYearValue, currentMonthValue],
    queryFn: () => getEventActivityStats(currentYearValue, currentMonthValue),
  });

  const dataToDisplay = React.useMemo(() => {
    if (selectedMonth === null) {
      // Monthly view: map backend data (month number) to chart format
      const mappedMonthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString('fr-FR', { month: 'short' }).replace('.', ''),
        evenements: 0,
      }));
      (backendChartData || []).forEach(item => {
        const monthIndex = item.month - 1; // Convert 1-indexed month to 0-indexed
        if (mappedMonthlyData[monthIndex]) {
          mappedMonthlyData[monthIndex].evenements = item.evenements;
        }
      });
      return mappedMonthlyData;
    } else {
      // Daily view: Ensure all days of the month are present, even if no events
      const now = new Date();
      const year = selectedYear === 'actuelle' ? now.getFullYear() : now.getFullYear() - 1;
      const month = selectedMonth; // 0-indexed month

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const allDaysArray = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const date = new Date(year, month, day).toISOString().split('T')[0];
        return {
          date: date, // This will be the dataKey for XAxis
          evenements: 0, // Initialize event count to 0
        };
      });

      // Populate the array with actual event data from the backend
      (backendChartData || []).forEach(item => {
        const dayIndex = item.day - 1; // Backend sends 'day' (1-indexed)
        if (allDaysArray[dayIndex]) {
          allDaysArray[dayIndex].evenements = item.evenements;
        }
      });
      return allDaysArray;
    }
  }, [selectedMonth, selectedYear, backendChartData]);

  const allMonths = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Card className={"not-dark:bg-white dark:bg-accent not-dark:text-black"} >
      <CardHeader>
        <CardTitle>Activité des Événements</CardTitle>
        <CardDescription>
          {selectedMonth === null 
            ? `Total par mois pour l'année ${currentYearValue}`
            : `Détail par jour pour ${new Date(0, selectedMonth).toLocaleString('fr-FR', { month: 'long' })}`
          }
        </CardDescription >
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            value={selectedYear}
            onValueChange={(value) => value && setSelectedYear(value)}
            variant="outline"
            aria-label="Filtre par année"
            className={"not-dark:bg-[#11123a] not-dark:text-white dark:data-[state=on]:bg-green-500 data-[state=on]:bg-gray-400 "}
          >
            <ToggleGroupItem value="actuelle"  className={"dark:data-[state=on]:bg-green-500 data-[state=on]:bg-gray-400"} >Année actuelle</ToggleGroupItem>
            <ToggleGroupItem value="precedente"  className={"dark:data-[state=on]:bg-green-500 data-[state=on]:bg-gray-400"}>Année précédente</ToggleGroupItem>
          </ToggleGroup>
          <div className="border-l border-border h-6" />
          <ToggleGroup
            type="single"
    
            value={selectedMonth === null ? 'all' : selectedMonth.toString()}
            onValueChange={(value) => {
              if (value === 'all') {
                setSelectedMonth(null);
              } else if (value) {
                setSelectedMonth(parseInt(value, 10));
              }
            }}
            variant="outline"
            aria-label="Filtre par mois"
            className="flex-wrap  justify-start  not-dark:bg-[#11123a] not-dark:text-white dark:data-[state=on]:bg-green-500 data-[state=on]:bg-gray-400"
          >
            <ToggleGroupItem value="all" className={"dark:data-[state=on] :bg-green-500 data-[state=on]:bg-gray-400"} >Tous</ToggleGroupItem>
            {allMonths.map(monthIndex => (
              <ToggleGroupItem key={monthIndex} value={monthIndex.toString()} className={"dark:data-[state=on]:bg-green-500 data-[state=on]:bg-gray-400"}>
                {new Date(0, monthIndex).toLocaleString('fr-FR', { month: 'short' })}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : isError ? (
          <p className="text-red-500">Erreur lors du chargement des données du graphique.</p>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={dataToDisplay}
              margin={{ top: 20, left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={selectedMonth === null ? "month" : "date"}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  if (selectedMonth === null) {
                    return value;
                  }
                  const date = new Date(value);
                  return date.toLocaleDateString("fr-FR", { day: "numeric" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="evenements"
                fill="var(--color-evenements)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}