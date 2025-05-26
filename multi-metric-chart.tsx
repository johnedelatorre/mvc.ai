"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons"

interface MultiMetricChartProps {
  data: Array<{
    id: number
    dateObj: Date
    placements: string
    placementTypes: string
    platforms: string
    smv: number
    fmv: number
    impressions: number
    views: number
    videoViews: number
  }>
}

export default function MultiMetricChart({ data }: MultiMetricChartProps) {
  // Format the data for chart display
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map((item) => ({
        ...item,
        fmvScaled: item.fmv * 10, // Scale up for visibility
        viewsScaled: item.views / 10, // Scale down for visibility
        date: item.dateObj.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        }),
        fullDate: item.dateObj.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        placement: item.placements,
        placementType: item.placementTypes,
        platform: item.platforms,
      }))
  }, [data])

  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-md min-w-[180px]">
          <div className="space-y-1.5">
            <div className="font-semibold text-gray-800 text-sm border-b border-gray-200 pb-1.5">{data.fullDate}</div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium text-gray-800">{data.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Placement Type:</span>
                <span className="font-medium text-gray-800">{data.placementType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Placement:</span>
                <span className="font-medium text-gray-800">{data.placement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SMV:</span>
                <span className="font-medium text-gray-800">${data.smv}k</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Multi-Metric Comparison</CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleExpanded} className="flex items-center gap-2">
            <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="transition-all duration-300 ease-in-out">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[1400px] h-[400px]">
              <ChartContainer
                config={{
                  smv: {
                    label: "SMV ($k)",
                    color: "#4F8EF7",
                  },
                  fmvScaled: {
                    label: "FMV ($k × 10)",
                    color: "#6BA3F8",
                  },
                  viewsScaled: {
                    label: "Views (k ÷ 10)",
                    color: "#87B8F9",
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Scaled Values",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="smv" fill="#4F8EF7" name="SMV ($k)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="fmvScaled" fill="#6BA3F8" name="FMV ($k × 10)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="viewsScaled" fill="#87B8F9" name="Views (k ÷ 10)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-4">
            <div className="text-sm text-muted-foreground">← Scroll horizontally to view all data →</div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
