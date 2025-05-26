"use client"

import { useState, useMemo } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons"

interface ComparisonLineChartProps {
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

export default function ComparisonLineChart({ data }: ComparisonLineChartProps) {
  // Format the data for chart display
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map((item) => ({
        ...item,
        fmvScaled: item.fmv * 15, // Scale up for visibility
        impressionsScaled: item.impressions * 5, // Scale for visibility
        viewsScaled: item.views / 8, // Scale down for visibility
        date: item.dateObj.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
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
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
          <div className="space-y-2">
            <div className="font-semibold text-gray-800 border-b pb-2">{data.fullDate}</div>
            <div className="grid grid-cols-1 gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Placement Type:</span>
                <span className="font-medium">{data.placementType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">{data.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SMV:</span>
                <span className="font-medium">${Math.round(data.smv)}k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">FMV:</span>
                <span className="font-medium">${data.fmv.toFixed(1)}k</span>
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
          <CardTitle>Performance Trends Comparison</CardTitle>
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
                    label: "FMV ($k × 15)",
                    color: "#6BA3F8",
                  },
                  impressionsScaled: {
                    label: "Impressions (MM × 5)",
                    color: "#87B8F9",
                  },
                  viewsScaled: {
                    label: "Views (k ÷ 8)",
                    color: "#A3CCFA",
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                    <Line
                      type="monotone"
                      dataKey="smv"
                      stroke="#4F8EF7"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="SMV ($k)"
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="fmvScaled"
                      stroke="#6BA3F8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="FMV ($k × 15)"
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="impressionsScaled"
                      stroke="#87B8F9"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Impressions (MM × 5)"
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="viewsScaled"
                      stroke="#A3CCFA"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Views (k ÷ 8)"
                      connectNulls={false}
                    />
                  </LineChart>
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
