"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { useState, useMemo, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown, faDownload } from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"

interface DataBarChartProps {
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

export default function DataBarChart({ data }: DataBarChartProps) {
  // Format the data for chart display
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map((item) => ({
        ...item,
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
  const chartRef = useRef<HTMLDivElement>(null)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const downloadChart = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          useCORS: true,
        })

        const link = document.createElement("a")
        link.download = `media-analytics-smv-chart-${new Date().toISOString().split("T")[0]}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      } catch (error) {
        console.error("Error downloading chart:", error)
      }
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <CardTitle className="text-base sm:text-lg">Media Analytics - SMV by Date</CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadChart}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
            >
              <FontAwesomeIcon icon={faDownload} className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Download PNG</span>
              <span className="sm:hidden">PNG</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2"
            >
              <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="transition-all duration-300 ease-in-out" ref={chartRef}>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] sm:min-w-[800px] lg:min-w-[1200px] h-[300px] sm:h-[400px]">
              <ChartContainer
                config={{
                  smv: {
                    label: "SMV ($k)",
                    color: "#4F8EF7",
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      label={{
                        value: "Value ($k)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="smv" fill="#4F8EF7" name="SMV" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className="text-xs sm:text-sm text-muted-foreground">← Scroll horizontally to view all data →</div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
