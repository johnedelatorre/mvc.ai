"use client"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faFileText,
  faBookmark,
  faChevronUp,
  faChevronDown,
  faEye,
  faEyeSlash,
  faMicrophone,
  faPaperPlane,
  faRobot,
  faLightbulb,
  faClock,
  faSearch,
  faTimes,
  faTrash,
  faChartColumn,
  faEdit,
  faHistory,
} from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { faTiktok, faInstagram, faYoutube, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface AutomatedInsightsProps {
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

const PlatformIcon = ({ platform }: { platform: string }) => {
  const getIcon = () => {
    switch (platform) {
      case "TikTok":
        return faTiktok
      case "Instagram":
        return faInstagram
      case "YouTube":
        return faYoutube
      case "Twitter":
        return faTwitter
      default:
        return faTwitter
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
            <FontAwesomeIcon icon={getIcon()} className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{platform}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function AutomatedInsights({ data = [] }: AutomatedInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hasSeen, setHasSeen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [chatHistory, setChatHistory] = useState<
    Array<{ id: string; type: "user" | "assistant"; content: string; timestamp: Date }>
  >([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedInsights, setGeneratedInsights] = useState<any>(null)
  const [savedInsights, setSavedInsights] = useState<
    Array<{
      id: string
      name: string
      content: any
      timestamp: Date
      query: string
    }>
  >([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveInsightName, setSaveInsightName] = useState("")
  const [editingInsight, setEditingInsight] = useState<string | null>(null)
  const [showSavedInsights, setShowSavedInsights] = useState(false)
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [activeTab, setActiveTab] = useState("automated")

  // Sort by date (most recent first) - handle empty data
  const sortedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return []
    }
    return [...data].sort((a, b) => {
      const dateA = a.dateObj instanceof Date ? a.dateObj : new Date(a.dateObj)
      const dateB = b.dateObj instanceof Date ? b.dateObj : new Date(b.dateObj)
      return dateB.getTime() - dateA.getTime()
    })
  }, [data])

  // Calculate trending amounts
  const calculateTrending = () => {
    if (sortedData.length < 2) {
      return { smv: 0, impressions: 0, views: 0 }
    }

    const midPoint = Math.floor(sortedData.length / 2)
    const firstHalf = sortedData.slice(0, midPoint)
    const secondHalf = sortedData.slice(midPoint)

    const firstHalfAvg = {
      smv: firstHalf.reduce((sum, item) => sum + (item.smv || 0), 0) / firstHalf.length,
      impressions: firstHalf.reduce((sum, item) => sum + (item.impressions || 0), 0) / firstHalf.length,
      views: firstHalf.reduce((sum, item) => sum + (item.views || 0), 0) / firstHalf.length,
    }

    const secondHalfAvg = {
      smv: secondHalf.reduce((sum, item) => sum + (item.smv || 0), 0) / secondHalf.length,
      impressions: secondHalf.reduce((sum, item) => sum + (item.impressions || 0), 0) / secondHalf.length,
      views: secondHalf.reduce((sum, item) => sum + (item.views || 0), 0) / secondHalf.length,
    }

    return {
      smv: secondHalfAvg.smv > 0 ? Math.round(((firstHalfAvg.smv - secondHalfAvg.smv) / secondHalfAvg.smv) * 100) : 0,
      impressions:
        secondHalfAvg.impressions > 0
          ? Math.round(((firstHalfAvg.impressions - secondHalfAvg.impressions) / secondHalfAvg.impressions) * 100)
          : 0,
      views:
        secondHalfAvg.views > 0
          ? Math.round(((firstHalfAvg.views - secondHalfAvg.views) / secondHalfAvg.views) * 100)
          : 0,
    }
  }

  const trendingAmounts = calculateTrending()

  // Calculate insights
  const insights = useMemo(() => {
    if (sortedData.length === 0) {
      return {
        topPlacement: "N/A",
        topPlacementTypeBySMV: "N/A",
        topPlatformByImpressions: "N/A",
        totalSMV: 0,
        totalImpressions: 0,
        avgSMV: 0,
      }
    }

    return {
      topPlacement:
        sortedData.reduce((prev, current) => ((prev.smv || 0) > (current.smv || 0) ? prev : current)).placements ||
        "N/A",
      topPlacementTypeBySMV: (() => {
        const placementTypesSMV = sortedData.reduce(
          (acc, item) => {
            const type = item.placementTypes || "Unknown"
            acc[type] = (acc[type] || 0) + (item.smv || 0)
            return acc
          },
          {} as Record<string, number>,
        )
        const entries = Object.entries(placementTypesSMV)
        return entries.length > 0 ? entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] : "N/A"
      })(),
      topPlatformByImpressions: (() => {
        const platformImpressions = sortedData.reduce(
          (acc, item) => {
            const platform = item.platforms || "Unknown"
            acc[platform] = (acc[platform] || 0) + (item.impressions || 0)
            return acc
          },
          {} as Record<string, number>,
        )
        const entries = Object.entries(platformImpressions)
        return entries.length > 0 ? entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] : "N/A"
      })(),
      totalSMV: sortedData.reduce((sum, item) => sum + (item.smv || 0), 0),
      totalImpressions: sortedData.reduce((sum, item) => sum + (item.impressions || 0), 0),
      avgSMV:
        sortedData.length > 0
          ? Math.round(sortedData.reduce((sum, item) => sum + (item.smv || 0), 0) / sortedData.length)
          : 0,
    }
  }, [sortedData])

  // Prepare chart data for automated insights
  const automatedChartData = useMemo(() => {
    if (sortedData.length === 0) {
      return []
    }

    return sortedData
      .slice(0, 10) // Show last 10 data points for better visualization
      .reverse() // Show chronological order
      .map((item) => ({
        date:
          item.dateObj instanceof Date
            ? item.dateObj.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
            : new Date(item.dateObj).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
        fullDate:
          item.dateObj instanceof Date
            ? item.dateObj.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
            : new Date(item.dateObj).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        smv: item.smv || 0,
        impressions: Math.round((item.impressions || 0) / 10), // Scale down for better visualization
        views: Math.round((item.views || 0) / 100), // Scale down for better visualization
        originalImpressions: Math.round((item.impressions || 0) / 1000), // For tooltip display in millions
        originalViews: Math.round((item.views || 0) / 1000), // For tooltip display in thousands
        platform: item.platforms || "Unknown",
        placement: item.placements || "Unknown",
        placementType: item.placementTypes || "Unknown",
      }))
  }, [sortedData])

  // Prepare chart data for generated insights
  const generatedChartData = useMemo(() => {
    if (!generatedInsights) {
      return []
    }

    // Create mock time series data based on generated insights
    const baseDate = new Date()
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(baseDate)
      date.setDate(date.getDate() - (6 - index))

      // Create trending data based on generated insights
      const baseValue = 100
      const trendMultiplier = 1 + (generatedInsights.trending.smv / 100) * (index / 6)

      return {
        date: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
        fullDate: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        smv: Math.round(baseValue * trendMultiplier),
        impressions: Math.round(baseValue * trendMultiplier * 2 + generatedInsights.trending.impressions * index),
        views: Math.round(baseValue * trendMultiplier * 1.5 + generatedInsights.trending.views * index),
        originalImpressions: Math.round(
          (baseValue * trendMultiplier * 2 + generatedInsights.trending.impressions * index) * 10,
        ),
        originalViews: Math.round((baseValue * trendMultiplier * 1.5 + generatedInsights.trending.views * index) * 100),
        platform: generatedInsights.topPerformers.platform,
        placement: generatedInsights.topPerformers.placement,
        placementType: "Generated",
      }
    })
  }, [generatedInsights])

  // Determine which chart data to use based on active tab and generated insights
  const currentChartData = useMemo(() => {
    if (activeTab === "generate") {
      // Only return chart data if insights have been generated
      return generatedInsights ? generatedChartData : []
    }
    return automatedChartData
  }, [activeTab, generatedInsights, generatedChartData, automatedChartData])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded && !hasSeen) {
      setHasSeen(true) // Mark as seen when expanding
    }
  }

  const toggleRecommendations = () => {
    setShowRecommendations(!showRecommendations)
  }

  const handleGenerateReport = () => {
    console.log("Generating automated insights report...")
    // Simplified report generation without jsPDF for now
    const reportData = {
      totalRecords: sortedData.length,
      dateRange:
        sortedData.length > 0
          ? `${sortedData[sortedData.length - 1].dateObj.toLocaleDateString()} - ${sortedData[0].dateObj.toLocaleDateString()}`
          : "No data available",
      trendingMetrics: trendingAmounts,
      topPerformers: insights,
    }

    console.log("Report data:", reportData)
    // You can implement actual PDF generation or download functionality here
  }

  const handleBookmarkInsights = () => {
    setIsBookmarked(!isBookmarked)
    console.log(isBookmarked ? "Removing bookmark from insights..." : "Bookmarking insights...")
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: chatInput,
      timestamp: new Date(),
    }

    setChatHistory((prev) => [...prev, userMessage])
    setChatInput("")
    setIsGenerating(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant" as const,
        content: `Based on your query "${chatInput}", I've analyzed the data and generated insights.`,
        timestamp: new Date(),
      }
      setChatHistory((prev) => [...prev, assistantMessage])

      // Generate mock insights
      setGeneratedInsights({
        trending: {
          smv: Math.floor(Math.random() * 50) + 10,
          impressions: Math.floor(Math.random() * 30) + 15,
          views: Math.floor(Math.random() * 40) + 20,
        },
        topPerformers: {
          placement: sortedData[0]?.placements || "Billboard",
          platform: "Instagram",
          sponsor: "Nike",
        },
        keyMetrics: {
          totalSMV: Math.floor(Math.random() * 1000) + 500,
          avgEngagement: Math.floor(Math.random() * 50) + 25,
          growthRate: Math.floor(Math.random() * 20) + 5,
        },
      })
      setIsGenerating(false)

      // Scroll to generated insights after they appear
      setTimeout(() => {
        const insightsElement = document.getElementById("generated-insights-display")
        if (insightsElement) {
          insightsElement.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    }, 2000)
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    console.log("Voice input toggled")
  }

  const handleClearAll = () => {
    setChatHistory([])
    setGeneratedInsights(null)
    setChatInput("")
    setIsGenerating(false)
  }

  const handleSaveInsights = () => {
    if (!generatedInsights) return

    const defaultName = `Insights - ${new Date().toLocaleDateString()}`
    setSaveInsightName(defaultName)
    setShowSaveModal(true)
  }

  const confirmSaveInsights = () => {
    if (!generatedInsights || !saveInsightName.trim()) return

    const newInsight = {
      id: Date.now().toString(),
      name: saveInsightName.trim(),
      content: generatedInsights,
      timestamp: new Date(),
      query: chatHistory[chatHistory.length - 2]?.content || "Custom Analysis",
    }

    setSavedInsights((prev) => [newInsight, ...prev])
    setShowSaveModal(false)
    setSaveInsightName("")

    console.log("Insights saved successfully!")
  }

  const handleDeleteSavedInsight = (id: string) => {
    setSavedInsights((prev) => prev.filter((insight) => insight.id !== id))
  }

  const handleLoadSavedInsight = (insight: any) => {
    setGeneratedInsights(insight.content)
    setShowSavedInsights(false)
  }

  const recentQueries = [
    "Show me Nike performance in Q4",
    "Compare Instagram vs TikTok engagement",
    "Top performing placements this month",
  ]

  const topSearches = ["SMV trends", "Platform comparison", "Sponsor performance", "Engagement rates"]

  const recommendedQueries = [
    "What are the trending sponsors this season?",
    "Which platforms have the highest ROI?",
    "Show me the best performing placement types",
    "Compare current vs previous season performance",
  ]

  // Chart component that adapts to current context
  const InsightsChart = () => {
    const chartTitle =
      activeTab === "generate" && generatedInsights
        ? `Insights Chart: ${chatHistory.length > 1 ? chatHistory[chatHistory.length - 2]?.content || "Custom Analysis" : "Custom Analysis"}`
        : "Automated Insights Performance Chart"

    const chartDescription =
      activeTab === "generate" && generatedInsights
        ? "Visual representation of your generated insights and trends"
        : "Visual representation of automated insights and key metrics"

    return (
      <div className="mt-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowTrendUp} className="h-5 w-5 text-blue-600" />
                  {chartTitle}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">{chartDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("line")}
                  className="flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4" />
                  Line Chart
                </Button>
                <Button
                  variant={chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className="flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4" />
                  Bar Chart
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentChartData.length > 0 ? (
              <>
                <div className="w-full h-[400px]">
                  <ChartContainer
                    config={{
                      smv: {
                        label: "SMV ($k)",
                        color: "#4F8EF7",
                      },
                      impressions: {
                        label: "Impressions (scaled)",
                        color: "#6BA3F8",
                      },
                      views: {
                        label: "Views (scaled)",
                        color: "#87B8F9",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "line" ? (
                        <LineChart data={currentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                              value: "Values",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-md min-w-[180px]">
                                    <div className="space-y-1.5">
                                      <div className="font-semibold text-gray-800 text-sm border-b border-gray-200 pb-1.5">
                                        {data.fullDate}
                                      </div>
                                      <div className="grid grid-cols-1 gap-1 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">SMV:</span>
                                          <span className="font-medium text-gray-800">${data.smv}k</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Impressions:</span>
                                          <span className="font-medium text-gray-800">{data.originalImpressions}M</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Views:</span>
                                          <span className="font-medium text-gray-800">{data.originalViews}k</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Platform:</span>
                                          <span className="font-medium text-gray-800">{data.platform}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
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
                            dataKey="impressions"
                            stroke="#6BA3F8"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Impressions (scaled)"
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="views"
                            stroke="#87B8F9"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="Views (scaled)"
                            connectNulls={false}
                          />
                        </LineChart>
                      ) : (
                        <BarChart
                          data={currentChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          barCategoryGap="20%"
                        >
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
                              value: "Values",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-md min-w-[180px]">
                                    <div className="space-y-1.5">
                                      <div className="font-semibold text-gray-800 text-sm border-b border-gray-200 pb-1.5">
                                        {data.fullDate}
                                      </div>
                                      <div className="grid grid-cols-1 gap-1 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">SMV:</span>
                                          <span className="font-medium text-gray-800">${data.smv}k</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Impressions:</span>
                                          <span className="font-medium text-gray-800">{data.originalImpressions}M</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Views:</span>
                                          <span className="font-medium text-gray-800">{data.originalViews}k</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Platform:</span>
                                          <span className="font-medium text-gray-800">{data.platform}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Legend />
                          <Bar dataKey="smv" fill="#4F8EF7" name="SMV ($k)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="impressions" fill="#6BA3F8" name="Impressions (scaled)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="views" fill="#87B8F9" name="Views (scaled)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Chart Legend and Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Chart Information:</strong>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">SMV:</span> Social Media Value in thousands ($k)
                    </div>
                    <div>
                      <span className="font-medium">Impressions:</span> Scaled down by 10x for visualization
                    </div>
                    <div>
                      <span className="font-medium">Views:</span> Scaled down by 100x for visualization
                    </div>
                  </div>
                  {activeTab === "generate" && generatedInsights && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-blue-600">
                        <strong>Generated Insights:</strong> Chart reflects trends from your custom analysis query
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                <div className="text-center">
                  <FontAwesomeIcon icon={faChartColumn} className="h-12 w-12 mb-4 text-gray-300" />
                  <h4 className="font-medium text-gray-600 mb-2">No Chart Data Available</h4>
                  <p className="text-sm text-gray-500">
                    {activeTab === "generate"
                      ? "Generate insights to see chart visualization"
                      : "No data available for chart visualization"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card className="w-full mb-6 border-2 border-blue-300 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowTrendUp} className="h-5 w-5 text-blue-600" />
              Insights ({sortedData.length} records)
              {hasSeen && (
                <span className="flex items-center gap-1 text-xs italic text-gray-500 font-normal">
                  <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                  Seen
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleGenerateReport} className="flex items-center gap-2" size="sm">
                <FontAwesomeIcon icon={faFileText} className="h-4 w-4" />
                Generate Report
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleBookmarkInsights}
                    variant={isBookmarked ? "default" : "outline"}
                    size="sm"
                    className={`p-2 ${isBookmarked ? "bg-blue-600 text-white" : ""}`}
                  >
                    <FontAwesomeIcon icon={isBookmarked ? faBookmark : faBookmarkRegular} className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isBookmarked ? "Remove Bookmark" : "Bookmark Insight"}</p>
                </TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="sm" onClick={toggleExpanded} className="flex items-center gap-2">
                <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="transition-all duration-300 ease-in-out">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="automated" className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4" />
                  Automated Insights
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faRobot} className="h-4 w-4" />
                  Generate Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="automated" className="space-y-6">
                {/* Original automated insights content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {/* Trending Metrics */}
                  <div className="space-y-3 flex flex-col h-full">
                    <h4 className="font-semibold text-sm text-gray-700">Trending Metrics</h4>
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <span className="text-sm">SMV</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />+{trendingAmounts.smv}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <span className="text-sm">Impressions</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />+{trendingAmounts.impressions}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <span className="text-sm">Views</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />+{trendingAmounts.views}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <span className="text-sm">Placement Type (Entrance)</span>
                        <Badge variant="secondary" className="bg-red-100 text-red-700 flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendDown} className="h-3 w-3" />
                          -$200
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Platform</span>
                          <PlatformIcon platform="YouTube" />
                        </div>
                        <Badge variant="secondary" className="bg-red-100 text-red-700 flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendDown} className="h-3 w-3" />
                          -$125
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Top Performers */}
                  <div className="space-y-3 flex flex-col h-full">
                    <h4 className="font-semibold text-sm text-gray-700">Top Performers</h4>
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Highest Performing Placement</div>
                        <div className="font-semibold text-blue-700">{insights.topPlacement}</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Top Placement Type by SMV</div>
                        <div className="font-semibold text-purple-700">{insights.topPlacementTypeBySMV}</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Top Platform by Impressions</div>
                        <div className="font-semibold text-orange-700 flex items-center gap-2">
                          {insights.topPlatformByImpressions !== "N/A" && (
                            <PlatformIcon platform={insights.topPlatformByImpressions} />
                          )}
                          <span>{insights.topPlatformByImpressions}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Summary */}
                  <div className="space-y-3 flex flex-col h-full">
                    <h4 className="font-semibold text-sm text-gray-700">Key Metrics</h4>
                    <div className="flex flex-col justify-between h-full space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Total SMV</div>
                        <div className="font-semibold text-gray-700">${insights.totalSMV.toLocaleString()}k</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Total Impressions</div>
                        <div className="font-semibold text-gray-700">
                          {insights.totalImpressions.toLocaleString()}MM
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Average SMV</div>
                        <div className="font-semibold text-gray-700">${insights.avgSMV}k</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-blue-800 flex items-center gap-2">
                      💡 Actionable Recommendations
                    </h4>
                    <Button variant="ghost" size="sm" onClick={toggleRecommendations} className="p-2">
                      <FontAwesomeIcon icon={showRecommendations ? faEyeSlash : faEye} className="h-4 w-4" />
                    </Button>
                  </div>

                  {showRecommendations && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 transition-all duration-300 ease-in-out">
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>
                          • Focus more budget on {insights.topPlacementTypeBySMV} placements for higher SMV returns
                        </li>
                        <li>• Leverage {insights.topPlatformByImpressions} platform for maximum impression reach</li>
                        <li>• Continue current strategy as all key metrics are trending upward</li>
                        <li>• Consider expanding {insights.topPlacement} placements based on performance</li>
                        <li>• Review and optimize Entrance placement strategy to address declining performance</li>
                        <li>• Investigate YouTube platform performance decline and adjust content strategy</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Automated Insights Chart - Always show for automated tab */}
                <InsightsChart />
              </TabsContent>

              <TabsContent value="generate" className="space-y-6">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Generate Custom Insights</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Ask questions about your data to generate personalized insights
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savedInsights.length > 0 && (
                      <Popover open={showSavedInsights} onOpenChange={setShowSavedInsights}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faBookmark} className="h-4 w-4" />
                            Saved ({savedInsights.length})
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm">Saved Insights</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSavedInsights(false)}
                                className="p-1"
                              >
                                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {savedInsights.map((insight) => (
                                <div
                                  key={insight.id}
                                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm text-gray-900 truncate">{insight.name}</h5>
                                      <p className="text-xs text-gray-500 mt-1 truncate">{insight.query}</p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {insight.timestamp.toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleLoadSavedInsight(insight)}
                                        className="p-1 h-6 w-6"
                                      >
                                        <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteSavedInsight(insight.id)}
                                        className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                                      >
                                        <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                    {(chatHistory.length > 0 || generatedInsights) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAll}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Chat Interface */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Chat History */}
                    <div className="border rounded-lg bg-gray-50 h-[calc(100vh-20rem)] min-h-[600px] overflow-y-auto p-4 space-y-3">
                      {chatHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <FontAwesomeIcon icon={faRobot} className="h-12 w-12 mb-4 text-gray-400" />
                            <h4 className="font-medium text-gray-700 mb-2">AI-Powered Insights Generator</h4>
                            <p className="text-sm text-gray-500 mb-4 max-w-md">
                              Ask questions about your data and get instant, personalized insights with visualizations
                              and recommendations.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {["Show trends", "Compare platforms", "Top performers"].map((suggestion) => (
                                <button
                                  key={suggestion}
                                  onClick={() => setChatInput(suggestion)}
                                  className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        chatHistory.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] p-3 rounded-lg ${
                                message.type === "user"
                                  ? "bg-blue-600 text-white rounded-br-sm"
                                  : "bg-white border border-gray-200 rounded-bl-sm shadow-sm"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p
                                className={`text-xs mt-2 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                              >
                                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {isGenerating && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 p-4 rounded-lg rounded-bl-sm shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-600">Analyzing your data and generating insights...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask about your data insights... (e.g., 'Show me top performing sponsors this quarter')"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                              }
                            }}
                            className="pr-12 py-3 text-sm"
                            disabled={isGenerating}
                          />
                          <Button
                            onClick={handleVoiceInput}
                            variant="ghost"
                            size="sm"
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 ${
                              isListening ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-gray-600"
                            }`}
                            disabled={isGenerating}
                          >
                            <FontAwesomeIcon icon={faMicrophone} className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim() || isGenerating}
                          className="px-6 py-3"
                        >
                          {isGenerating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Quick actions:</span>
                        <button
                          onClick={() => setChatInput("What are the trending metrics this month?")}
                          className="text-blue-600 hover:text-blue-700 underline"
                          disabled={isGenerating}
                        >
                          Trending metrics
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => setChatInput("Compare platform performance")}
                          className="text-blue-600 hover:text-blue-700 underline"
                          disabled={isGenerating}
                        >
                          Platform comparison
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => setChatInput("Show top performing sponsors")}
                          className="text-blue-600 hover:text-blue-700 underline"
                          disabled={isGenerating}
                        >
                          Top sponsors
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Suggestions */}
                  <div className="space-y-4">
                    {/* Recent Queries */}
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-gray-500" />
                        Recent Queries
                      </h4>
                      <div className="space-y-2">
                        {recentQueries.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => setChatInput(query)}
                            disabled={isGenerating}
                            className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-start gap-2">
                              <FontAwesomeIcon icon={faSearch} className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{query}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Top Searches */}
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-500" />
                        Popular Searches
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {topSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setChatInput(search)}
                            disabled={isGenerating}
                            className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors border border-blue-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Evaluation Searches */}
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-500" />
                        Evaluation Searches
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "MVP% Evaluation",
                          "YoY Benchmarking",
                          "Top Performing Sponsors",
                          "Top Performing Rightsholders",
                          "Top Broadcasts",
                          "Top Social Media Posts",
                        ].map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setChatInput(search)}
                            disabled={isGenerating}
                            className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors border border-purple-200 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Queries */}
                    <div className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-yellow-600" />
                        AI Recommendations
                      </h4>
                      <div className="space-y-2">
                        {recommendedQueries.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => setChatInput(query)}
                            disabled={isGenerating}
                            className="w-full text-left p-3 text-sm bg-white hover:bg-yellow-50 rounded-md transition-colors border border-yellow-200 hover:border-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-start gap-2">
                              <FontAwesomeIcon
                                icon={faLightbulb}
                                className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0"
                              />
                              <span className="leading-relaxed">{query}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Insights Preview Area */}
                {!generatedInsights && !isGenerating && (
                  <div className="mt-6 p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faLightbulb} className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Generated Insights Will Appear Here</h4>
                      <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                        Ask a question about your data using the chat interface above, and AI-powered insights with
                        visualizations and recommendations will be displayed in this area.
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />
                          <span>Trending Metrics</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" />
                          <span>Top Performers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faLightbulb} className="h-3 w-3" />
                          <span>Recommendations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="mt-6 p-12 border-2 border-blue-300 rounded-xl bg-blue-50 min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <h4 className="text-lg font-medium text-blue-700 mb-2">Generating Your Insights...</h4>
                      <p className="text-sm text-blue-600 mb-4">
                        Our AI is analyzing your data and preparing personalized insights with actionable
                        recommendations.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Insights Display */}
                {generatedInsights && (
                  <div
                    id="generated-insights-display"
                    className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-semibold text-xl text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <FontAwesomeIcon icon={faLightbulb} className="h-6 w-6 text-yellow-600" />
                        </div>
                        Generated Insights
                      </h4>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSaveInsights}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <FontAwesomeIcon icon={faBookmark} className="h-4 w-4" />
                          Save Insights
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Trending Metrics */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 text-green-600" />
                          Trending Metrics
                        </h5>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">SMV</span>
                            <span className="font-medium text-green-700">+{generatedInsights.trending.smv}%</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">Impressions</span>
                            <span className="font-medium text-green-700">
                              +{generatedInsights.trending.impressions}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Views</span>
                            <span className="font-medium text-green-700">+{generatedInsights.trending.views}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Top Performers */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                          <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 text-blue-600" />
                          Top Performers
                        </h5>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="mb-2">
                            <span className="text-xs text-gray-600">Placement</span>
                            <div className="font-medium text-blue-700">{generatedInsights.topPerformers.placement}</div>
                          </div>
                          <div className="mb-2">
                            <span className="text-xs text-gray-600">Platform</span>
                            <div className="font-medium text-blue-700">{generatedInsights.topPerformers.platform}</div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600">Sponsor</span>
                            <div className="font-medium text-blue-700">{generatedInsights.topPerformers.sponsor}</div>
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                          <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-yellow-600" />
                          Key Metrics
                        </h5>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">Total SMV</span>
                            <span className="font-medium text-yellow-700">
                              ${generatedInsights.keyMetrics.totalSMV}k
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600">Avg Engagement</span>
                            <span className="font-medium text-yellow-700">
                              {generatedInsights.keyMetrics.avgEngagement}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Growth Rate</span>
                            <span className="font-medium text-yellow-700">
                              {generatedInsights.keyMetrics.growthRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actionable Recommendations */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-yellow-600" />
                        Actionable Recommendations
                      </h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Focus on {generatedInsights.topPerformers.platform} for higher engagement</li>
                        <li>Increase investment in {generatedInsights.topPerformers.sponsor} sponsorships</li>
                        <li>Optimize placement strategy based on {generatedInsights.topPerformers.placement}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Generated Insights Chart - Only show when insights exist */}
                {generatedInsights && <InsightsChart />}

                {/* Insights History Table - within Generate tab */}
                <div className="mt-8">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faHistory} className="h-5 w-5 text-gray-600" />
                        Generated Insights History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Insights Type</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Insight Queries</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {savedInsights.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                No generated insights yet. Create and save insights to see them here.
                              </TableCell>
                            </TableRow>
                          ) : (
                            savedInsights.map((insight) => (
                              <TableRow key={insight.id}>
                                <TableCell className="font-medium">
                                  {new Date(insight.timestamp).toLocaleDateString()}
                                </TableCell>
                                <TableCell>Custom Analysis</TableCell>
                                <TableCell>AI Assistant</TableCell>
                                <TableCell>
                                  <div className="max-w-xs">
                                    <Badge
                                      variant="secondary"
                                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 truncate block max-w-full"
                                      title={insight.query}
                                    >
                                      {insight.query}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-2"
                                          onClick={() => handleLoadSavedInsight(insight)}
                                        >
                                          <FontAwesomeIcon icon={faEye} className="h-4 w-4 text-blue-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View Insight</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-2"
                                          onClick={() => setEditingInsight(insight.id)}
                                        >
                                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit Insight</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-2"
                                          onClick={() => handleDeleteSavedInsight(insight.id)}
                                        >
                                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-red-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete Insight</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Save Insights Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Save Generated Insights</h3>
              <div className="mt-2 px-7 py-3">
                <Input
                  type="text"
                  placeholder="Insight Name"
                  value={saveInsightName}
                  onChange={(e) => setSaveInsightName(e.target.value)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="items-center px-4 py-3">
                <Button
                  variant="ghost"
                  className="px-4 py-2 bg-gray-50 text-gray-500 text-sm font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={confirmSaveInsights}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
