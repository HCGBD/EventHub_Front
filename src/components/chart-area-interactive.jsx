import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const description = "An interactive area chart"

const chartConfig = {
  participantsCount: {
    label: "Participants",
    color: "hsl(var(--primary))", // Use primary color for participants
  },
}

export function ChartAreaInteractive({ data }) {
  // Data is now passed via props
  // No need for timeRange state or filtering logic

  return (
    <Card className="@container/card  not-dark:bg-white dark:bg-accent not-dark:text-black">
      <CardHeader>
        <CardTitle>Participants par Événement</CardTitle>
        <CardDescription>
          Nombre de participants inscrits pour chaque événement que vous avez créé.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name" // Event name on X-axis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                // Truncate long event names if necessary
                return value.length > 15 ? value.substring(0, 12) + '...' : value;
              }}
            />
            <YAxis
              dataKey="participantsCount" // Participants count on Y-axis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 'dataMax + 10']} // Adjust Y-axis domain dynamically
            />
            <Tooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Événement: ${value}`}
                  formatter={(value, name) => [`${value} participants`, name]}
                  indicator="dot" />
              } />
            <Area
              dataKey="participantsCount"
              type="natural"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary))"
              stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}