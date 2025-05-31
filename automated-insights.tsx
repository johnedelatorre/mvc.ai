"use client"
import { useState, useMemo, useRef, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTiktok, faInstagram, faYoutube, faTwitter } from "@fortawesome/free-brands-svg-icons"
import {
  faArrowTrendUp,
  faFileText,
  faBookmark,
  faChevronUp,
  faChevronDown,
  faEye,
  faEyeSlash,
  faRobot,
  faLightbulb,
  faTimes,
  faSync,
  faThumbsUp,
  faChartColumn,
} from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Web Speech API type declarations
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
  isFinal: boolean
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

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
  templateTrigger?: { prompt: string; timestamp: number } | null
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

export default function AutomatedInsights({ data = [], templateTrigger }: AutomatedInsightsProps) {
  // Arrays of possible values for more variety
  const placementOptions = [
    "Billboard",
    "Digital Display",
    "Floor Court Logo",
    "Ceiling Logo",
    "LED-Fascia",
    "Jersey",
    "Sneakers",
    "Entrance Logo",
    "Courtside Banner",
    "Tunnel Entrance",
    "Locker Room",
    "Press Conference",
    "Team Bench",
  ]

  const placementTypeOptions = [
    "In-Venue Exposures",
    "Broadcast Exposures",
    "Social Media Exposures",
    "Court Side",
    "LED-Fascia",
    "Virtual Signage",
    "AR Overlay",
    "Sponsored Segments",
    "Half-time Show",
    "Pre-game Show",
  ]

  const platformOptions = [
    "TikTok",
    "Instagram",
    "YouTube",
    "Twitter",
    "Facebook",
    "LinkedIn",
    "Snapchat",
    "Twitch",
    "Reddit",
    "Pinterest",
  ]
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
  const [insightsHistory, setInsightsHistory] = useState<
    Array<{
      id: string
      name: string
      content: any
      timestamp: Date
      query: string
      prompt: string
    }>
  >([])
  const [activeTab, setActiveTab] = useState("automated")
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [showRatingDrawer, setShowRatingDrawer] = useState(false)
  const [currentRatingType, setCurrentRatingType] = useState<"automated" | "generated">("automated")
  const [automatedRating, setAutomatedRating] = useState<number>(0)
  const [generatedRating, setGeneratedRating] = useState<number>(0)
  const [automatedFeedback, setAutomatedFeedback] = useState("")
  const [generatedFeedback, setGeneratedFeedback] = useState("")
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [savedInsights, setSavedInsights] = useState<
    Array<{
      id: string
      dateSaved: Date
      insightsType: string
      sponsor: string
      rightsholder: string
      metric: string
      insightData: any
    }>
  >([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isGeneratingNewInsight, setIsGeneratingNewInsight] = useState(false)
  const [viewingSavedInsight, setViewingSavedInsight] = useState<string | null>(null)
  const [showAllSavedInsights, setShowAllSavedInsights] = useState(false)
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null)
  const [showAllGeneratedInsights, setShowAllGeneratedInsights] = useState(false)
  const [expandedGeneratedInsightId, setExpandedGeneratedInsightId] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false)
  const [isGeneratingFromTemplate, setIsGeneratingFromTemplate] = useState(false)
  const [templateInsightData, setTemplateInsightData] = useState<any>(null)

  const insightsChartRef = useRef<HTMLDivElement>(null)

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

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = "en-US"

        recognitionInstance.onstart = () => {
          setIsListening(true)
        }

        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setChatInput((prev) => prev + (prev ? " " : "") + transcript)
        }

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
        setIsRecognitionSupported(true)
      } else {
        setIsRecognitionSupported(false)
      }
    }
  }, [])

  // Handle template trigger
  useEffect(() => {
    if (templateTrigger) {
      handleTemplateGeneration(templateTrigger.prompt)
    }
  }, [templateTrigger])

  const handleTemplateGeneration = async (prompt: string) => {
    console.log("Generating insights from template:", prompt)
    setIsGeneratingFromTemplate(true)
    setActiveTab("automated") // Switch to automated tab
    
    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate template-specific insights based on the prompt
    const templateInsights = generateTemplateInsights(prompt)
    setTemplateInsightData(templateInsights)
    
    // Force re-calculation by incrementing refresh key
    setRefreshKey((prev) => prev + 1)

    // Reset states to make it feel like a fresh insight
    setHasSeen(false)
    setIsBookmarked(false)
    setShowRecommendations(true)

    setIsGeneratingFromTemplate(false)
    console.log("Template insight generated successfully")
  }

  const generateTemplateInsights = (prompt: string) => {
    // Extract brand/sponsor from prompt
    const brands = ["Nike", "Adidas", "Under Armour", "Puma", "New Balance", "Jordan Brand", "Reebok", "ASICS", "Converse", "Vans"]
    const detectedBrand = brands.find(brand => prompt.toLowerCase().includes(brand.toLowerCase())) || "Nike"
    
    // Generate insights based on prompt content
    const isROIAnalysis = prompt.toLowerCase().includes("roi") || prompt.toLowerCase().includes("performance")
    const isPlatformComparison = prompt.toLowerCase().includes("vs") || prompt.toLowerCase().includes("compare")
    const isTrendAnalysis = prompt.toLowerCase().includes("trend") || prompt.toLowerCase().includes("year")
    
    return {
      templatePrompt: prompt,
      detectedBrand,
      analysisType: isROIAnalysis ? "ROI Analysis" : isPlatformComparison ? "Platform Comparison" : isTrendAnalysis ? "Trend Analysis" : "General Analysis",
      insights: {
        topPlacement: placementOptions[Math.floor(Math.random() * placementOptions.length)],
        topPlacementTypeBySMV: placementTypeOptions[Math.floor(Math.random() * placementTypeOptions.length)],
        topPlatformByImpressions: platformOptions[Math.floor(Math.random() * platformOptions.length)],
        totalSMV: Math.floor(Math.random() * 3000) + 500,
        totalImpressions: Math.floor(Math.random() * 50) + 10,
        avgSMV: Math.floor(Math.random() * 150) + 50,
      },
      trendingAmounts: {
        smv: Math.floor(Math.random() * 40) + 10,
        impressions: Math.floor(Math.random() * 35) + 15,
        views: Math.floor(Math.random() * 30) + 20,
      },
      recommendations: [
        `Focus more budget on ${detectedBrand}'s top-performing placements for higher ROI`,
        `Leverage ${platformOptions[Math.floor(Math.random() * platformOptions.length)]} platform for maximum ${detectedBrand} engagement`,
        `Optimize ${detectedBrand}'s content strategy based on current performance trends`,
        `Consider expanding ${detectedBrand}'s presence in high-performing placement types`,
        `Implement A/B testing for ${detectedBrand} to optimize campaign performance`,
        `Analyze competitor strategies to identify ${detectedBrand} growth opportunities`
      ]
    }
  }

  // Calculate trending amounts with refresh key dependency
  const calculateTrending = () => {
    // If viewing a saved insight, return the saved trending data
    if (refreshKey === -1 && window.tempSavedInsightData) {
      return window.tempSavedInsightData.trendingAmounts
    }

    // If we have template data, use it
    if (templateInsightData) {
      return templateInsightData.trendingAmounts
    }

    // Generate completely random trending values each time
    const randomSeed = refreshKey * Date.now() // Use current time to ensure different results
    const random = () => Math.floor(Math.random() * 100) - 30 // Range from -30 to +70

    return {
      smv: random(),
      impressions: random(),
      views: random(),
      // Add random negative trends for variety
      entrancePlacement: -Math.floor(Math.random() * 300),
      youtubePlatform: -Math.floor(Math.random() * 250),
    }
  }

  const trendingAmounts = useMemo(() => calculateTrending(), [sortedData, refreshKey, templateInsightData])

  // Calculate insights with refresh key dependency
  const insights = useMemo(() => {
    // If viewing a saved insight, return the saved data
    if (refreshKey === -1 && window.tempSavedInsightData) {
      return {
        topPlacement: window.tempSavedInsightData.insights.topPlacement || "N/A",
        topPlacementTypeBySMV: window.tempSavedInsightData.insights.topPlacementTypeBySMV || "N/A",
        topPlatformByImpressions: window.tempSavedInsightData.insights.topPlatformByImpressions || "N/A",
        totalSMV: window.tempSavedInsightData.insights.totalSMV || 0,
        totalImpressions: window.tempSavedInsightData.insights.totalImpressions || 0,
        avgSMV: window.tempSavedInsightData.insights.avgSMV || 0,
      }
    }

    // If we have template data, use it
    if (templateInsightData) {
      return templateInsightData.insights
    }

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

    // Create arrays of possible values for more variety
    const placementOptions = [
      "Billboard",
      "Digital Display",
      "Floor Court Logo",
      "Ceiling Logo",
      "LED-Fascia",
      "Jersey",
      "Sneakers",
      "Entrance Logo",
      "Courtside Banner",
      "Tunnel Entrance",
      "Locker Room",
      "Press Conference",
      "Team Bench",
    ]

    const placementTypeOptions = [
      "In-Venue Exposures",
      "Broadcast Exposures",
      "Social Media Exposures",
      "Court Side",
      "LED-Fascia",
      "Virtual Signage",
      "AR Overlay",
      "Sponsored Segments",
      "Half-time Show",
      "Pre-game Show",
    ]

    const platformOptions = [
      "TikTok",
      "Instagram",
      "YouTube",
      "Twitter",
      "Facebook",
      "LinkedIn",
      "Snapchat",
      "Twitch",
      "Reddit",
      "Pinterest",
    ]

    // Use refreshKey and current timestamp to get different results each time
    const seed = refreshKey * Date.now()
    const getRandomItem = (array: string[]) => {
      const index = Math.abs(Math.floor(Math.sin(seed * Math.random()) * array.length)) % array.length
      return array[index]
    }

    // Generate random metrics
    const totalSMV = Math.floor(Math.random() * 5000) + 500
    const totalImpressions = Math.floor(Math.random() * 10000) + 1000
    const avgSMV = Math.floor(Math.random() * 200) + 50

    return {
      topPlacement: getRandomItem(placementOptions),
      topPlacementTypeBySMV: getRandomItem(placementTypeOptions),
      topPlatformByImpressions: getRandomItem(platformOptions),
      totalSMV,
      totalImpressions,
      avgSMV,
    }
  }, [sortedData, refreshKey, templateInsightData])

// Generate random recommendations based on current insights
const getRandomRecommendations = () => {
  // If we have template data, use its recommendations
  if (templateInsightData) {
    return templateInsightData.recommendations
  }

  // Arrays of possible recommendation templates
  const recommendationTemplates = [
    "Focus more budget on {placementType} placements for higher SMV returns",
    "Leverage {platform} platform for maximum impression reach",
    "Increase investment in {placement} placements based on performance",
    "Optimize {platform} content strategy to improve engagement",
    "Consider expanding {placement} placements across more events",
    "Reduce investment in underperforming {negativeType} placements",
    "Test new creative formats on {platform} to boost impressions",
    "Combine {placement} with {platform} promotions for synergy",
    "Reallocate budget from {negativeType} to {placement} for better ROI",
    "Implement A/B testing for {placementType} to optimize performance",
    "Focus on {platform} during peak viewing hours for maximum impact",
    "Consider seasonal adjustments for {placement} to match audience patterns",
    "Develop custom content for {platform} to increase engagement",
    "Analyze competitor presence on {platform} to identify opportunities",
    "Integrate {placement} with digital activations for cross-platform impact",
  ]

  // Negative placement types for recommendations about reducing investment
  const negativeTypes = ["Entrance", "Static Banner", "Print Media", "Radio Mentions"]

  // Select 6 random recommendations without repetition
  const selectedRecommendations = []
  const usedIndices = new Set()

  while (selectedRecommendations.length < 6 && usedIndices.size < recommendationTemplates.length) {
    const index = Math.floor(Math.random() * recommendationTemplates.length)
    if (!usedIndices.has(index)) {
      usedIndices.add(index)
      let recommendation = recommendationTemplates[index]

      // Replace placeholders with actual values
      recommendation = recommendation.replace("{placement}", insights.topPlacement)
      recommendation = recommendation.replace("{placementType}", insights.topPlacementTypeBySMV)
      recommendation = recommendation.replace("{platform}", insights.topPlatformByImpressions)
      recommendation = recommendation.replace(
        "{negativeType}",
        negativeTypes[Math.floor(Math.random() * negativeTypes.length)],
      )

      selectedRecommendations.push(recommendation)
    }
  }

  return selectedRecommendations
}

// Create a memoized version of recommendations that changes with refreshKey
const recommendations = useMemo(() => {
  if (refreshKey === -1 && window.tempSavedInsightData) {
    return window.tempSavedInsightData.recommendations || [];
  }
  return getRandomRecommendations();
}, [refreshKey, insights, templateInsightData]);

const toggleExpanded = () => {
  setIsExpanded(!isExpanded)
  if (!isExpanded && !hasSeen) {
    setHasSeen(true)
  }
}

const toggleRecommendations = () => {
  setShowRecommendations(!showRecommendations)
}

const handleGenerateReport = () => {
  console.log("Generating automated insights report...")
}

const handleBookmarkInsights = () => {
  setIsBookmarked(!isBookmarked)
  console.log(isBookmarked ? "Removing bookmark from insights..." : "Bookmarking insights...")
}

const handleGenerateNewInsight = async () => {
  console.log("Generating new automated insight...")
  setIsGeneratingNewInsight(true)
  
  await new Promise((resolve) => setTimeout(resolve, 1500))
  
  setRefreshKey((prev) => prev + 1)
  setHasSeen(false)
  setIsBookmarked(false)
  setShowRecommendations(true)
  setTemplateInsightData(null) // Clear template data when generating new insight
  
  setIsGeneratingNewInsight(false)
  console.log("New insight generated successfully")
}

const handleRateInsights = (type: "automated" | "generated") => {
  console.log(`Rating ${type} insights...`)
}

const handleExitSavedInsightView = () => {
  setViewingSavedInsight(null)
  setRefreshKey(0)
  setTemplateInsightData(null)
  delete window.tempSavedInsightData
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
            <Button
              onClick={() => handleRateInsights("automated")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
              Rate Insights
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
              {/* Generate New Insight Button */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleGenerateNewInsight}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isGeneratingNewInsight || isGeneratingFromTemplate}
                >
                  {isGeneratingNewInsight || isGeneratingFromTemplate ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <FontAwesomeIcon icon={faSync} className="h-4 w-4" />
                  )}
                  {isGeneratingNewInsight || isGeneratingFromTemplate ? "Generating..." : "Generate New Insight"}
                </Button>
              </div>

              {/* Template Generation Indicator */}
              {isGeneratingFromTemplate && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700 font-medium">
                      Generating insights from template...
                    </span>
                  </div>
                </div>
              )}

              {/* Template Insight Display */}
              {templateInsightData && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Template Analysis: {templateInsightData.analysisType}
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    Brand Focus: {templateInsightData.detectedBrand}
                  </p>
                </div>
              )}

              {viewingSavedInsight && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      Viewing Saved Insight from{" "}
                      {savedInsights.find((s) => s.id === viewingSavedInsight)?.dateSaved.toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    onClick={handleExitSavedInsightView}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-blue-600 border-blue-300"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    Back to Previous
                  </Button>
                </div>
              )}

              {/* Automated insights metrics */}
              <div
                id="automated-insights-metrics"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
              >
                {/* Trending Metrics */}
                <div className="space-y-3 flex flex-col h-full">
                  <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 text-green-600" />
                    Trending Metrics
                  </h4>
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
                  </div>
                </div>

                {/* Top Performers */}
                <div className="space-y-3 flex flex-col h-full">
                  <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 text-blue-600" />
                    Top Performers
                  </h4>
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
                  <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                    <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-yellow-600" />
                    Key Metrics
                  </h4>
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
                      {recommendations.map((recommendation, index) => (
                        <li key={index}>• {recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              {/* Generate Insights Tab Content */}
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faRobot} className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Generate Custom Insights</h3>
                <p className="text-gray-500">This feature is coming soon. Use the template gallery above to generate insights.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  </TooltipProvider>
)
