"use client"
import { useState, useMemo, useRef, useEffect } from "react"
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
  faHistory,
  faStar,
  faThumbsUp,
  faDownload,
  faSync,
  faDatabase,
  faCalendarAlt,
  faExpand,
  faCompress,
  faEdit,
} from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { faTiktok, faInstagram, faYoutube, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import html2canvas from "html2canvas"

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

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
  )
}

export default function AutomatedInsights({ data = [] }: AutomatedInsightsProps) {
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

  // Calculate trending amounts with refresh key dependency
  const calculateTrending = () => {
    // If viewing a saved insight, return the saved trending data
    if (refreshKey === -1 && window.tempSavedInsightData) {
      return window.tempSavedInsightData.trendingAmounts
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

  const trendingAmounts = useMemo(() => calculateTrending(), [sortedData, refreshKey])

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
  }, [sortedData, refreshKey])

  // Generate random recommendations based on current insights
  const getRandomRecommendations = () => {
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
      return window.tempSavedInsightData.recommendations || []
    }
    return getRandomRecommendations()
  }, [refreshKey, insights])

  // Prepare chart data for automated insights with more randomization
  const automatedChartData = useMemo(() => {
    if (sortedData.length === 0) {
      return []
    }

    // Use a seed based on refreshKey to ensure different chart patterns each time
    const seed = refreshKey * Date.now()
    const randomFactor = () => Math.random() * 2 + 0.5 // Random factor between 0.5 and 2.5

    // Generate completely new random chart data each time
    return Array.from({ length: 10 }, (_, index) => {
      // Create a date going back from today
      const date = new Date()
      date.setDate(date.getDate() - (9 - index))

      // Generate random values with some trend correlation
      const baseSMV = 50 + index * 5 * randomFactor()
      const baseImpressions = 500 + index * 20 * randomFactor()
      const baseViews = 1000 + index * 50 * randomFactor()

      // Add some noise
      const noise = () => (Math.random() - 0.5) * 30

      return {
        date: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
        fullDate: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
        smv: Math.max(10, Math.round(baseSMV + noise())),
        impressions: Math.max(10, Math.round((baseImpressions + noise()) / 10)), // Scale down for visualization
        views: Math.max(10, Math.round((baseViews + noise()) / 100)), // Scale down for visualization
        originalImpressions: Math.max(10, Math.round((baseImpressions + noise()) / 1000)), // For tooltip display in millions
        originalViews: Math.max(10, Math.round((baseViews + noise()) / 1000)), // For tooltip display in thousands
        platform: platformOptions[Math.floor(Math.random() * platformOptions.length)],
        placement: placementOptions[Math.floor(Math.random() * placementOptions.length)],
        placementType: placementTypeOptions[Math.floor(Math.random() * placementTypeOptions.length)],
      }
    })
  }, [sortedData, refreshKey])

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
    if (!isBookmarked) {
      // Save the insight
      const newSavedInsight = {
        id: Date.now().toString(),
        dateSaved: new Date(),
        insightsType: "Automated Insights",
        sponsor: insights.topPlacement || "Multiple",
        rightsholder: "Multiple", // You can modify this based on your data
        metric: `SMV: $${insights.totalSMV.toLocaleString()}k, Impressions: ${insights.totalImpressions.toLocaleString()}MM`,
        insightData: {
          insights,
          trendingAmounts,
          recommendations,
          filteredData: sortedData.slice(0, 10),
        },
      }
      setSavedInsights((prev) => [newSavedInsight, ...prev])
    } else {
      // Remove the most recent insight (simple implementation)
      setSavedInsights((prev) => prev.slice(1))
    }

    setIsBookmarked(!isBookmarked)
    console.log(isBookmarked ? "Removing bookmark from insights..." : "Bookmarking insights...")
  }

  const handleGenerateNewInsight = async () => {
    console.log("Generating new automated insight...")
    setIsGeneratingNewInsight(true)

    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Force re-calculation by incrementing refresh key
    setRefreshKey((prev) => prev + 1)

    // Reset states to make it feel like a fresh insight
    setHasSeen(false)
    setIsBookmarked(false)
    setShowRecommendations(true)

    setIsGeneratingNewInsight(false)
    console.log("New insight generated successfully")

    // Scroll to the insights section after generating
    setTimeout(() => {
      const insightsElement = document.getElementById("automated-insights-metrics")
      if (insightsElement) {
        insightsElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
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

      // Auto-save to history
      const newHistoryItem = {
        id: Date.now().toString(),
        name: `Insights - ${new Date().toLocaleDateString()}`,
        content: {
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
        },
        timestamp: new Date(),
        query: chatInput,
        prompt: chatInput,
      }
      setInsightsHistory((prev) => [newHistoryItem, ...prev])

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
    if (!recognition || !isRecognitionSupported) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.")
      return
    }

    if (isListening) {
      recognition.stop()
    } else {
      try {
        recognition.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)
      }
    }
  }

  const handleClearAll = () => {
    setChatHistory([])
    setGeneratedInsights(null)
    setChatInput("")
    setIsGenerating(false)
  }

  const handleViewInsight = (insight: any) => {
    setGeneratedInsights(insight.content)
    // Scroll to insights display
    setTimeout(() => {
      const insightsElement = document.getElementById("generated-insights-display")
      if (insightsElement) {
        insightsElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  const handleEditPrompt = (insight: any) => {
    setChatInput(insight.prompt)
    // Focus on input
    const inputElement = document.querySelector('input[placeholder*="Ask about your data"]') as HTMLInputElement
    if (inputElement) {
      inputElement.focus()
    }
  }

  const handleDeleteInsight = (id: string) => {
    setInsightsHistory((prev) => prev.filter((insight) => insight.id !== id))
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

  const handleRateInsights = (type: "automated" | "generated") => {
    setCurrentRatingType(type)
    setShowRatingDrawer(true)
  }

  const handleRatingChange = (rating: number) => {
    if (currentRatingType === "automated") {
      setAutomatedRating(rating)
    } else {
      setGeneratedRating(rating)
    }
  }

  const handleFeedbackChange = (feedback: string) => {
    if (currentRatingType === "automated") {
      setAutomatedFeedback(feedback)
    } else {
      setGeneratedFeedback(feedback)
    }
  }

  const handleSubmitRating = async () => {
    setIsSubmittingRating(true)

    const rating = currentRatingType === "automated" ? automatedRating : generatedRating
    const feedback = currentRatingType === "automated" ? automatedFeedback : generatedFeedback

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log(`${currentRatingType} insights rated:`, { rating, feedback })

    setIsSubmittingRating(false)
    setShowRatingDrawer(false)

    // Show success message or toast
    console.log("Rating submitted successfully!")
  }

  const downloadInsightsChart = async () => {
    if (insightsChartRef.current) {
      try {
        const canvas = await html2canvas(insightsChartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
          useCORS: true,
        })

        const chartName =
          activeTab === "generate" && generatedInsights ? "generated-insights-chart" : "automated-insights-chart"

        const link = document.createElement("a")
        link.download = `${chartName}-${new Date().toISOString().split("T")[0]}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      } catch (error) {
        console.error("Error downloading chart:", error)
      }
    }
  }

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Least Impactful"
      case 2:
        return "Sort of Impactful"
      case 3:
        return "Impactful"
      case 4:
        return "Very Impactful"
      default:
        return "Rate this insight"
    }
  }

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
        <Card className="w-full" ref={insightsChartRef}>
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
                <Button variant="outline" size="sm" onClick={downloadInsightsChart} className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                  Download PNG
                </Button>
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

  const handleExitSavedInsightView = () => {
    setViewingSavedInsight(null)
    setRefreshKey(0) // Reset to normal view
    delete window.tempSavedInsightData
  }

  const handleViewSavedInsight = (savedInsight: any) => {
    console.log("Viewing saved insight:", savedInsight)

    // Set the viewing state to show we're looking at a saved insight
    setViewingSavedInsight(savedInsight.id)

    // Temporarily override the current insights with saved data
    // We'll use a different approach - create a temporary refresh key that uses saved data
    setRefreshKey(-1) // Use -1 as a special key to indicate saved insight view

    // Store the saved insight data temporarily
    window.tempSavedInsightData = savedInsight.insightData

    // Scroll to the insights section
    setTimeout(() => {
      const insightsElement = document.getElementById("automated-insights-metrics")
      if (insightsElement) {
        insightsElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  // Function to view all saved insights data
  const handleViewAllSavedInsights = () => {
    setShowAllSavedInsights(true)
  }

  // Function to toggle expanded view for individual insights
  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsightId(expandedInsightId === insightId ? null : insightId)
  }

  // Function to get summary statistics for all saved insights
  const getSavedInsightsSummary = () => {
    if (savedInsights.length === 0) {
      return {
        totalInsights: 0,
        avgSMV: 0,
        avgImpressions: 0,
        topPlacement: "N/A",
        topPlatform: "N/A",
        dateRange: "N/A",
      }
    }

    const totalSMV = savedInsights.reduce((sum, insight) => {
      return sum + (insight.insightData?.insights?.totalSMV || 0)
    }, 0)

    const totalImpressions = savedInsights.reduce((sum, insight) => {
      return sum + (insight.insightData?.insights?.totalImpressions || 0)
    }, 0)

    // Find most common placement and platform
    const placements = savedInsights.map((insight) => insight.insightData?.insights?.topPlacement).filter(Boolean)
    const platforms = savedInsights
      .map((insight) => insight.insightData?.insights?.topPlatformByImpressions)
      .filter(Boolean)

    const topPlacement =
      placements.length > 0
        ? placements.reduce((a, b, i, arr) =>
            arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
          )
        : "N/A"

    const topPlatform =
      platforms.length > 0
        ? platforms.reduce((a, b, i, arr) =>
            arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
          )
        : "N/A"

    const dates = savedInsights.map((insight) => insight.dateSaved).sort((a, b) => a.getTime() - b.getTime())
    const dateRange =
      dates.length > 0 ? `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}` : "N/A"

    return {
      totalInsights: savedInsights.length,
      avgSMV: Math.round(totalSMV / savedInsights.length),
      avgImpressions: Math.round(totalImpressions / savedInsights.length),
      topPlacement,
      topPlatform,
      dateRange,
    }
  }

  const savedInsightsSummary = getSavedInsightsSummary()

  // Add this sorting function before returning the JSX
  const sortedSavedInsights = useMemo(() => {
    return [...savedInsights].sort((a, b) => b.dateSaved.getTime() - a.dateSaved.getTime())
  }, [savedInsights])

  // Function to view all generated insights data
  const handleViewAllGeneratedInsights = () => {
    setShowAllGeneratedInsights(true)
  }

  // Function to toggle expanded view for individual generated insights
  const toggleGeneratedInsightExpansion = (insightId: string) => {
    setExpandedGeneratedInsightId(expandedGeneratedInsightId === insightId ? null : insightId)
  }

  // Function to get summary statistics for all generated insights
  const getGeneratedInsightsSummary = () => {
    if (insightsHistory.length === 0) {
      return {
        totalInsights: 0,
        avgTotalSMV: 0,
        avgEngagement: 0,
        topPlacement: "N/A",
        topPlatform: "N/A",
        dateRange: "N/A",
      }
    }

    const totalSMV = insightsHistory.reduce((sum, insight) => {
      return sum + (insight.content?.keyMetrics?.totalSMV || 0)
    }, 0)

    const totalEngagement = insightsHistory.reduce((sum, insight) => {
      return sum + (insight.content?.keyMetrics?.avgEngagement || 0)
    }, 0)

    // Find most common placement and platform
    const placements = insightsHistory.map((insight) => insight.content?.topPerformers?.placement).filter(Boolean)
    const platforms = insightsHistory.map((insight) => insight.content?.topPerformers?.platform).filter(Boolean)

    const topPlacement =
      placements.length > 0
        ? placements.reduce((a, b, i, arr) =>
            arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
          )
        : "N/A"

    const topPlatform =
      platforms.length > 0
        ? platforms.reduce((a, b, i, arr) =>
            arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
          )
        : "N/A"

    const dates = insightsHistory.map((insight) => insight.timestamp).sort((a, b) => a.getTime() - b.getTime())
    const dateRange =
      dates.length > 0 ? `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}` : "N/A"

    return {
      totalInsights: insightsHistory.length,
      avgTotalSMV: Math.round(totalSMV / insightsHistory.length),
      avgEngagement: Math.round(totalEngagement / insightsHistory.length),
      topPlacement,
      topPlatform,
      dateRange,
    }
  }

  const generatedInsightsSummary = getGeneratedInsightsSummary()

  // Add this sorting function for generated insights
  const sortedGeneratedInsights = useMemo(() => {
    return [...insightsHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [insightsHistory])

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
                    disabled={isGeneratingNewInsight}
                  >
                    {isGeneratingNewInsight ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                      <FontAwesomeIcon icon={faSync} className="h-4 w-4" />
                    )}
                    {isGeneratingNewInsight ? "Generating..." : "Generate New Insight"}
                  </Button>
                </div>
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
                {/* Original automated insights content */}
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

                {/* Automated Insights Chart - Always show for automated tab */}
                <InsightsChart />

                {/* Saved Automated Insights Table */}
                {savedInsights.length > 0 && (
                  <div className="mt-8">
                    <Card className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faBookmark} className="h-5 w-5 text-blue-600" />
                            Saved Automated Insights
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Dialog open={showAllSavedInsights} onOpenChange={setShowAllSavedInsights}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleViewAllSavedInsights}
                                  className="flex items-center gap-2"
                                >
                                  <FontAwesomeIcon icon={faDatabase} className="h-4 w-4" />
                                  View All Data
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDatabase} className="h-5 w-5 text-blue-600" />
                                    All Saved Insights Data
                                  </DialogTitle>
                                  <DialogDescription>
                                    Comprehensive view of all saved automated insights with detailed metrics and trends
                                  </DialogDescription>
                                </DialogHeader>

                                <ScrollArea className="h-[calc(90vh-120px)] w-full">
                                  <div className="space-y-6 p-4">
                                    {/* Summary Statistics */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <Card className="p-4">
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-blue-600">
                                            {savedInsightsSummary.totalInsights}
                                          </div>
                                          <div className="text-sm text-gray-600">Total Insights Saved</div>
                                        </div>
                                      </Card>
                                      <Card className="p-4">
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-green-600">
                                            ${savedInsightsSummary.avgSMV.toLocaleString()}k
                                          </div>
                                          <div className="text-sm text-gray-600">Average SMV</div>
                                        </div>
                                      </Card>
                                      <Card className="p-4">
                                        <div className="text-center">
                                          <div className="text-2xl font-bold text-purple-600">
                                            {savedInsightsSummary.avgImpressions.toLocaleString()}MM
                                          </div>
                                          <div className="text-sm text-gray-600">Average Impressions</div>
                                        </div>
                                      </Card>
                                    </div>

                                    {/* Top Performers Summary */}
                                    <Card className="p-4">
                                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faChartColumn} className="h-5 w-5 text-orange-600" />
                                        Overall Top Performers
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                          <div className="text-xs text-gray-600 mb-1">Most Common Top Placement</div>
                                          <div className="font-semibold text-blue-700">
                                            {savedInsightsSummary.topPlacement}
                                          </div>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                          <div className="text-xs text-gray-600 mb-1">Most Common Top Platform</div>
                                          <div className="font-semibold text-green-700 flex items-center gap-2">
                                            {savedInsightsSummary.topPlatform !== "N/A" && (
                                              <PlatformIcon platform={savedInsightsSummary.topPlatform} />
                                            )}
                                            <span>{savedInsightsSummary.topPlatform}</span>
                                          </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <div className="text-xs text-gray-600 mb-1">Date Range</div>
                                          <div className="font-semibold text-gray-700">
                                            {savedInsightsSummary.dateRange}
                                          </div>
                                        </div>
                                      </div>
                                    </Card>

                                    {/* Individual Insights Details */}
                                    <div className="space-y-4">
                                      <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <FontAwesomeIcon icon={faHistory} className="h-5 w-5 text-gray-600" />
                                        Individual Insights Details
                                      </h3>

                                      {sortedSavedInsights.map((savedInsight) => (
                                        <Card key={savedInsight.id} className="p-4">
                                          <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 bg-blue-100 rounded-lg">
                                                <FontAwesomeIcon
                                                  icon={faCalendarAlt}
                                                  className="h-4 w-4 text-blue-600"
                                                />
                                              </div>
                                              <div>
                                                <div className="font-semibold text-gray-900">
                                                  {savedInsight.dateSaved.toLocaleString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
                                                </div>
                                                <div className="text-sm text-gray-500">{savedInsight.insightsType}</div>
                                              </div>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => toggleInsightExpansion(savedInsight.id)}
                                              className="flex items-center gap-2"
                                            >
                                              <FontAwesomeIcon
                                                icon={expandedInsightId === savedInsight.id ? faCompress : faExpand}
                                                className="h-4 w-4"
                                              />
                                              {expandedInsightId === savedInsight.id ? "Collapse" : "Expand"}
                                            </Button>
                                          </div>

                                          {/* Basic Info */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                              <div className="text-xs text-gray-600 mb-1">Primary Sponsor</div>
                                              <div className="font-medium text-gray-900">{savedInsight.sponsor}</div>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                              <div className="text-xs text-gray-600 mb-1">Rightsholder</div>
                                              <div className="font-medium text-gray-900">
                                                {savedInsight.rightsholder}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Expanded Details */}
                                          {expandedInsightId === savedInsight.id && savedInsight.insightData && (
                                            <div className="space-y-6 border-t pt-4">
                                              {/* Trending Metrics */}
                                              <div>
                                                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faArrowTrendUp}
                                                    className="h-4 w-4 text-green-600"
                                                  />
                                                  Trending Metrics
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium text-gray-700">SMV</span>
                                                      <Badge className="bg-green-100 text-green-700 border-green-300">
                                                        <FontAwesomeIcon
                                                          icon={faArrowTrendUp}
                                                          className="h-3 w-3 mr-1"
                                                        />
                                                        +{savedInsight.insightData.trendingAmounts?.smv || 0}%
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium text-gray-700">
                                                        Impressions
                                                      </span>
                                                      <Badge className="bg-green-100 text-green-700 border-green-300">
                                                        <FontAwesomeIcon
                                                          icon={faArrowTrendUp}
                                                          className="h-3 w-3 mr-1"
                                                        />
                                                        +{savedInsight.insightData.trendingAmounts?.impressions || 0}%
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium text-gray-700">Views</span>
                                                      <Badge className="bg-green-100 text-green-700 border-green-300">
                                                        <FontAwesomeIcon
                                                          icon={faArrowTrendUp}
                                                          className="h-3 w-3 mr-1"
                                                        />
                                                        +{savedInsight.insightData.trendingAmounts?.views || 0}%
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Top Performers */}
                                              <div>
                                                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faChartColumn}
                                                    className="h-4 w-4 text-blue-600"
                                                  />
                                                  Top Performers
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-xs text-gray-600 mb-1">
                                                      Highest Performing Placement
                                                    </div>
                                                    <div className="font-semibold text-blue-700">
                                                      {savedInsight.insightData.insights?.topPlacement || "N/A"}
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                    <div className="text-xs text-gray-600 mb-1">
                                                      Top Placement Type by SMV
                                                    </div>
                                                    <div className="font-semibold text-purple-700">
                                                      {savedInsight.insightData.insights?.topPlacementTypeBySMV ||
                                                        "N/A"}
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                    <div className="text-xs text-gray-600 mb-1">
                                                      Top Platform by Impressions
                                                    </div>
                                                    <div className="font-semibold text-orange-700 flex items-center gap-2">
                                                      {savedInsight.insightData.insights?.topPlatformByImpressions !==
                                                        "N/A" && (
                                                        <PlatformIcon
                                                          platform={
                                                            savedInsight.insightData.insights?.topPlatformByImpressions
                                                          }
                                                        />
                                                      )}
                                                      <span>
                                                        {savedInsight.insightData.insights?.topPlatformByImpressions ||
                                                          "N/A"}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Key Metrics */}
                                              <div>
                                                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faLightbulb}
                                                    className="h-4 w-4 text-yellow-600"
                                                  />
                                                  Key Metrics
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-xs text-gray-600 mb-1">Total SMV</div>
                                                    <div className="font-semibold text-gray-700">
                                                      $
                                                      {(
                                                        savedInsight.insightData.insights?.totalSMV || 0
                                                      ).toLocaleString()}
                                                      k
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-xs text-gray-600 mb-1">Total Impressions</div>
                                                    <div className="font-semibold text-gray-700">
                                                      {(
                                                        savedInsight.insightData.insights?.totalImpressions || 0
                                                      ).toLocaleString()}
                                                      MM
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-xs text-gray-600 mb-1">Average SMV</div>
                                                    <div className="font-semibold text-gray-700">
                                                      ${savedInsight.insightData.insights?.avgSMV || 0}k
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Action Buttons */}
                                              <div className="flex items-center gap-2 pt-4 border-t">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    setShowAllSavedInsights(false)
                                                    handleViewSavedInsight(savedInsight)
                                                  }}
                                                  className="flex items-center gap-2"
                                                >
                                                  <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                                                  View in Main Interface
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    setSavedInsights((prev) =>
                                                      prev.filter((insight) => insight.id !== savedInsight.id),
                                                    )
                                                  }}
                                                  className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                                >
                                                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                                  Delete
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date Saved</TableHead>
                              <TableHead>Insights Type</TableHead>
                              <TableHead>Sponsor</TableHead>
                              <TableHead>Rightsholder</TableHead>
                              <TableHead>Metric</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedSavedInsights.map((savedInsight) => (
                              <TableRow key={savedInsight.id}>
                                <TableCell className="font-medium">
                                  {savedInsight.dateSaved.toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </TableCell>
                                <TableCell>{savedInsight.insightsType}</TableCell>
                                <TableCell>{savedInsight.sponsor}</TableCell>
                                <TableCell>{savedInsight.rightsholder}</TableCell>
                                <TableCell className="max-w-xs">
                                  <Badge
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-700 font-normal text-xs px-2 py-1 truncate block max-w-full"
                                    title={savedInsight.metric}
                                  >
                                    {savedInsight.metric}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-2"
                                          onClick={() => handleViewSavedInsight(savedInsight)}
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
                                          onClick={() => {
                                            setSavedInsights((prev) =>
                                              prev.filter((insight) => insight.id !== savedInsight.id),
                                            )
                                          }}
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
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
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
                    <Popover open={false} onOpenChange={() => {}}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faBookmark} className="h-4 w-4" />
                          Saved ({insightsHistory.length})
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Saved Insights</h4>
                            <Button variant="ghost" size="sm" onClick={() => {}} className="p-1">
                              <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="space-y-2 max-h-64 overflow-y-auto"></div>
                        </div>
                      </PopoverContent>
                    </Popover>

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

                <div className="flex flex-col h-[calc(100vh-16rem)]">
                  {/* Fixed Input Area at Top */}
                  <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 mb-4">
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleVoiceInput}
                                variant="ghost"
                                size="sm"
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 transition-colors ${
                                  isListening
                                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                                    : isRecognitionSupported
                                      ? "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                      : "text-gray-300 cursor-not-allowed"
                                }`}
                                disabled={isGenerating || !isRecognitionSupported}
                              >
                                <FontAwesomeIcon
                                  icon={faMicrophone}
                                  className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {!isRecognitionSupported
                                  ? "Speech recognition not supported"
                                  : isListening
                                    ? "Click to stop recording"
                                    : "Click to start voice input"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
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

                  {/* Main Content Area */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    {/* Left Column - Chat Interface */}
                    <div className="lg:col-span-2 flex flex-col h-full">
                      {/* Chat History */}
                      <div className="flex-1 border rounded-lg bg-gray-50 overflow-y-auto p-4 space-y-3 min-h-0">
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
                                  className={`text-xs mt-2 ${
                                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
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
                    </div>

                    {/* Right Column - Suggestions */}
                    <div className="space-y-4 overflow-y-auto min-h-0">
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
                                <FontAwesomeIcon
                                  icon={faSearch}
                                  className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0"
                                />
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
                  <div className="mt-4">
                    <div
                      id="generated-insights-display"
                      className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm"
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
                            onClick={() => handleRateInsights("generated")}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
                            Rate Insights
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
                              <div className="font-medium text-blue-700">
                                {generatedInsights.topPerformers.placement}
                              </div>
                            </div>
                            <div className="mb-2">
                              <span className="text-xs text-gray-600">Platform</span>
                              <div className="font-medium text-blue-700">
                                {generatedInsights.topPerformers.platform}
                              </div>
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
                  </div>
                )}

                {/* Generated Insights Chart - Only show when insights exist */}
                {generatedInsights && <InsightsChart />}

                {/* Insights History Table - within Generate tab */}
                <div className="mt-8">
                  <Card className="w-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faHistory} className="h-5 w-5 text-gray-600" />
                          Generated Insights History
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Dialog open={showAllGeneratedInsights} onOpenChange={setShowAllGeneratedInsights}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleViewAllGeneratedInsights}
                                className="flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faDatabase} className="h-4 w-4" />
                                View All Data
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faDatabase} className="h-5 w-5 text-gray-600" />
                                  All Generated Insights Data
                                </DialogTitle>
                                <DialogDescription>
                                  Comprehensive view of all generated insights with detailed metrics and analysis
                                </DialogDescription>
                              </DialogHeader>

                              <ScrollArea className="h-[calc(90vh-120px)] w-full">
                                <div className="space-y-6 p-4">
                                  {/* Summary Statistics */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="p-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                          {generatedInsightsSummary.totalInsights}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Generated Insights</div>
                                      </div>
                                    </Card>
                                    <Card className="p-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                          ${generatedInsightsSummary.avgTotalSMV.toLocaleString()}k
                                        </div>
                                        <div className="text-sm text-gray-600">Average Total SMV</div>
                                      </div>
                                    </Card>
                                    <Card className="p-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                          {generatedInsightsSummary.avgEngagement}%
                                        </div>
                                        <div className="text-sm text-gray-600">Average Engagement</div>
                                      </div>
                                    </Card>
                                  </div>

                                  {/* Top Performers Summary */}
                                  <Card className="p-4">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                      <FontAwesomeIcon icon={faChartColumn} className="h-5 w-5 text-purple-600" />
                                      Overall Generated Insights Summary
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="p-3 bg-purple-50 rounded-lg">
                                        <div className="text-xs text-gray-600 mb-1">Most Common Top Placement</div>
                                        <div className="font-semibold text-purple-700">
                                          {generatedInsightsSummary.topPlacement}
                                        </div>
                                      </div>
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-xs text-gray-600 mb-1">Most Common Top Platform</div>
                                        <div className="font-semibold text-blue-700 flex items-center gap-2">
                                          {generatedInsightsSummary.topPlatform !== "N/A" && (
                                            <PlatformIcon platform={generatedInsightsSummary.topPlatform} />
                                          )}
                                          <span>{generatedInsightsSummary.topPlatform}</span>
                                        </div>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-600 mb-1">Date Range</div>
                                        <div className="font-semibold text-gray-700">
                                          {generatedInsightsSummary.dateRange}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>

                                  {/* Individual Generated Insights Details */}
                                  <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                      <FontAwesomeIcon icon={faRobot} className="h-5 w-5 text-purple-600" />
                                      Individual Generated Insights Details
                                    </h3>

                                    {sortedGeneratedInsights.map((generatedInsight) => (
                                      <Card key={generatedInsight.id} className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                              <FontAwesomeIcon icon={faRobot} className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                              <div className="font-semibold text-gray-900">
                                                {generatedInsight.timestamp.toLocaleString("en-US", {
                                                  weekday: "long",
                                                  year: "numeric",
                                                  month: "long",
                                                  day: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                                })}
                                              </div>
                                              <div className="text-sm text-gray-500">Custom Analysis</div>
                                            </div>
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleGeneratedInsightExpansion(generatedInsight.id)}
                                            className="flex items-center gap-2"
                                          >
                                            <FontAwesomeIcon
                                              icon={
                                                expandedGeneratedInsightId === generatedInsight.id
                                                  ? faCompress
                                                  : faExpand
                                              }
                                              className="h-4 w-4"
                                            />
                                            {expandedGeneratedInsightId === generatedInsight.id ? "Collapse" : "Expand"}
                                          </Button>
                                        </div>

                                        {/* Basic Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                          <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="text-xs text-gray-600 mb-1">Query</div>
                                            <div className="font-medium text-gray-900 text-sm">
                                              {generatedInsight.query}
                                            </div>
                                          </div>
                                          <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="text-xs text-gray-600 mb-1">Created By</div>
                                            <div className="font-medium text-gray-900">AI Assistant</div>
                                          </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedGeneratedInsightId === generatedInsight.id &&
                                          generatedInsight.content && (
                                            <div className="space-y-6 border-t pt-4">
                                              {/* Trending Metrics */}
                                              <div>
                                                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faArrowTrendUp}
                                                    className="h-4 w-4 text-green-600"
                                                  />
                                                  Trending Metrics
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium text-gray-700">SMV</span>
                                                      <Badge className="bg-green-100 text-green-700 border-green-300">
                                                        <FontAwesomeIcon
                                                          icon={faArrowTrendUp}
                                                          className="h-3 w-3 mr-1"
                                                        />
                                                        +{generatedInsight.content.trending?.smv || 0}%
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium text-gray-700">
                                                        Impressions
                                                      </span>
                                                      <Badge className="bg-green-100 text-green-700 border-green-300">
                                                        <FontAwesomeIcon
                                                          icon={faArrowTrendUp}
                                                          className="h-3 w-3 mr-1"
                                                        />
                                                        +{generatedInsight.content.trending?.impressions || 0}%
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium text-gray-700">Views</span>
                                                      <Badge className="bg-green-100 text-green-700 border-green-300">
                                                        <FontAwesomeIcon
                                                          icon={faArrowTrendUp}
                                                          className="h-3 w-3 mr-1"
                                                        />
                                                        +{generatedInsight.content.trending?.views || 0}%
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Top Performers */}
                                              <div>
                                                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faChartColumn}
                                                    className="h-4 w-4 text-blue-600"
                                                  />
                                                  Top Performers
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-xs text-gray-600 mb-1">Top Placement</div>
                                                    <div className="font-semibold text-blue-700">
                                                      {generatedInsight.content.topPerformers?.placement || "N/A"}
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                    <div className="text-xs text-gray-600 mb-1">Top Platform</div>
                                                    <div className="font-semibold text-purple-700 flex items-center gap-2">
                                                      {generatedInsight.content.topPerformers?.platform !== "N/A" && (
                                                        <PlatformIcon
                                                          platform={generatedInsight.content.topPerformers?.platform}
                                                        />
                                                      )}
                                                      <span>
                                                        {generatedInsight.content.topPerformers?.platform || "N/A"}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                    <div className="text-xs text-gray-600 mb-1">Top Sponsor</div>
                                                    <div className="font-semibold text-orange-700">
                                                      {generatedInsight.content.topPerformers?.sponsor || "N/A"}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Key Metrics */}
                                              <div>
                                                <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                                  <FontAwesomeIcon
                                                    icon={faLightbulb}
                                                    className="h-4 w-4 text-yellow-600"
                                                  />
                                                  Key Metrics
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-xs text-gray-600 mb-1">Total SMV</div>
                                                    <div className="font-semibold text-gray-700">
                                                      $
                                                      {(
                                                        generatedInsight.content.keyMetrics?.totalSMV || 0
                                                      ).toLocaleString()}
                                                      k
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-xs text-gray-600 mb-1">Average Engagement</div>
                                                    <div className="font-semibold text-gray-700">
                                                      {generatedInsight.content.keyMetrics?.avgEngagement || 0}%
                                                    </div>
                                                  </div>
                                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-xs text-gray-600 mb-1">Growth Rate</div>
                                                    <div className="font-semibold text-gray-700">
                                                      {generatedInsight.content.keyMetrics?.growthRate || 0}%
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Action Buttons */}
                                              <div className="flex items-center gap-2 pt-4 border-t">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    setShowAllGeneratedInsights(false)
                                                    handleViewInsight(generatedInsight)
                                                  }}
                                                  className="flex items-center gap-2"
                                                >
                                                  <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                                                  View in Main Interface
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    setShowAllGeneratedInsights(false)
                                                    handleEditPrompt(generatedInsight)
                                                  }}
                                                  className="flex items-center gap-2"
                                                >
                                                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                                  Edit Prompt
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    handleDeleteInsight(generatedInsight.id)
                                                  }}
                                                  className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                                >
                                                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                                  Delete
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date Generated</TableHead>
                            <TableHead>Insights Type</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Insight Queries</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {insightsHistory.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                No generated insights yet. Generate insights to see them here.
                              </TableCell>
                            </TableRow>
                          ) : (
                            insightsHistory.map((insight) => (
                              <TableRow key={insight.id}>
                                <TableCell className="font-medium">
                                  {new Date(insight.timestamp).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
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
                                          onClick={() => handleViewInsight(insight)}
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
                                          onClick={() => handleEditPrompt(insight)}
                                        >
                                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4 text-gray-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit Prompt</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-2"
                                          onClick={() => handleDeleteInsight(insight.id)}
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

            {/* Rating Drawer */}
            <Drawer open={showRatingDrawer} onOpenChange={setShowRatingDrawer}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    Rate {currentRatingType === "automated" ? "Automated" : "Generated"} Insights
                  </DrawerTitle>
                  <DrawerDescription>Your feedback helps us improve the quality of our insights.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Impactfulness</h4>
                    <div className="flex items-center gap-4">
                      {[1, 2, 3, 4].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRatingChange(rating)}
                          className={`p-3 rounded-lg border ${
                            (currentRatingType === "automated" ? automatedRating : generatedRating) === rating
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-yellow-500" />
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getRatingLabel(currentRatingType === "automated" ? automatedRating : generatedRating)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Feedback</h4>
                    <Textarea
                      placeholder="Share any additional feedback..."
                      value={currentRatingType === "automated" ? automatedFeedback : generatedFeedback}
                      onChange={(e) => handleFeedbackChange(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  <Button onClick={handleSubmitRating} disabled={isSubmittingRating} className="w-full">
                    {isSubmittingRating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Submit Rating"
                    )}
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  )
}
