"use client"
import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { format } from "date-fns"
import DataTable from "../data-table"
import DataBarChart from "../bar-chart"
import MultiMetricChart from "../multi-metric-chart"
import ComparisonLineChart from "../line-chart"
import AutomatedInsights from "../automated-insights"
import {
  faTable,
  faChartColumn,
  faChevronDown,
  faChartLine,
  faMagicWandSparkles,
  faChevronUp,
  faSliders,
  faRobot,
  faArrowTrendUp,
  faPaperPlane,
  faClock,
  faUsers,
  faStar,
  faEye,
  faSearch,
  faLightbulb,
  faSave,
  faTimes, // Add this import
} from "@fortawesome/free-solid-svg-icons"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/chart-container"

// Available placement options
const PLACEMENT_OPTIONS = [
  "Billboard",
  "Digital Display",
  "Floor Court Logo",
  "Ceiling Logo",
  "LED-Fascia",
  "Jersey",
  "Sneakers",
  "Entrance Logo",
]

// Sponsors by category
const SPONSORS_BY_CATEGORY = {
  "Sports Apparel": [
    "Nike",
    "Adidas",
    "Under Armour",
    "Puma",
    "New Balance",
    "Jordan Brand",
    "Reebok",
    "ASICS",
    "Converse",
    "Vans",
  ],
  Beverage: [
    "Coca-Cola",
    "Pepsi",
    "Red Bull",
    "Monster Energy",
    "Gatorade",
    "Powerade",
    "Dr Pepper",
    "Sprite",
    "Mountain Dew",
    "Rockstar Energy",
  ],
  "Alcohol Beverage": [
    "Budweiser",
    "Corona",
    "Heineken",
    "Miller Lite",
    "Coors Light",
    "Stella Artois",
    "Michelob Ultra",
    "Guinness",
    "Jack Daniel's",
    "Johnnie Walker",
  ],
  Insurance: [
    "State Farm",
    "GEICO",
    "Progressive",
    "Allstate",
    "Liberty Mutual",
    "USAA",
    "Farmers Insurance",
    "Nationwide",
    "American Family",
    "Travelers",
  ],
  Banking: [
    "Chase",
    "Bank of America",
    "Wells Fargo",
    "Citibank",
    "Capital One",
    "US Bank",
    "PNC Bank",
    "TD Bank",
    "Truist",
    "Fifth Third Bank",
  ],
  Crypto: [
    "Coinbase",
    "Crypto.com",
    "FTX",
    "Binance",
    "Kraken",
    "Gemini",
    "BlockFi",
    "eToro",
    "Robinhood Crypto",
    "Bitfinex",
  ],
  Technology: ["Apple", "Microsoft", "Google", "Amazon", "Meta", "Tesla", "Netflix", "Samsung", "Intel", "Oracle"],
}

// Flatten all sponsors for data generation and filtering
const ALL_SPONSORS = Object.values(SPONSORS_BY_CATEGORY).flat()

// Placement Types hierarchical structure
const PLACEMENT_TYPES_STRUCTURE = {
  Spurs: {
    "In-Venue Exposures": ["Court Side", "LED-Fascia", "Stadium Banner", "Spurs LED"],
    "Broadcast Exposures": ["Jersey", "Courtside", "Sneakers", "Stadium Banner"],
    "Social Media Exposures": ["Facebook", "Instagram", "TikTok", "X", "YouTube"],
  },
}

// Flatten placement types for data generation and filtering
const ALL_PLACEMENT_TYPES = Object.values(PLACEMENT_TYPES_STRUCTURE).flatMap((category) =>
  Object.values(category).flat(),
)

const RIGHTSHOLDERS_STRUCTURE = {
  NBA: ["Lakers", "Warriors", "Celtics", "Heat", "Bulls", "Knicks", "Nets", "76ers"],
  NFL: ["Patriots", "Cowboys", "Packers", "Steelers", "49ers", "Giants", "Chiefs", "Rams"],
  MLB: ["Yankees", "Dodgers", "Red Sox", "Cubs", "Cardinals", "Astros", "Braves", "Mets"],
  NHL: ["Rangers", "Bruins", "Blackhawks", "Kings", "Penguins", "Capitals", "Lightning", "Maple Leafs"],
  MLS: [
    "LAFC",
    "Atlanta United",
    "Seattle Sounders",
    "Portland Timbers",
    "NYC FC",
    "LA Galaxy",
    "Inter Miami",
    "Toronto FC",
  ],
  "Premier League": [
    "Manchester United",
    "Liverpool",
    "Chelsea",
    "Arsenal",
    "Manchester City",
    "Tottenham",
    "Newcastle",
    "Brighton",
  ],
  "La Liga": [
    "Real Madrid",
    "Barcelona",
    "Atletico Madrid",
    "Sevilla",
    "Valencia",
    "Villarreal",
    "Real Sociedad",
    "Athletic Bilbao",
  ],
  Bundesliga: [
    "Bayern Munich",
    "Borussia Dortmund",
    "RB Leipzig",
    "Bayer Leverkusen",
    "Eintracht Frankfurt",
    "Wolfsburg",
    "Freiburg",
    "Union Berlin",
  ],
}

// Flatten all rightsholders for data generation and filtering
const ALL_RIGHTSHOLDERS = Object.values(RIGHTSHOLDERS_STRUCTURE).flat()

// Generate base data that will be filtered
const generateBaseData = () => {
  const generateRandomDate = () => {
    const year = 2023 + Math.floor(Math.random() * 3) // 2023, 2024, 2025
    const month = Math.floor(Math.random() * 12) + 1 // 1-12
    const day = Math.floor(Math.random() * 28) + 1 // 1-28 to avoid month-end issues
    return new Date(year, month - 1, day)
  }

  return Array.from({ length: 200 }, (_, index) => ({
    id: index + 1,
    dateObj: generateRandomDate(),
    rightsholders: ALL_RIGHTSHOLDERS[index % ALL_RIGHTSHOLDERS.length],
    sponsors: ALL_SPONSORS[index % ALL_SPONSORS.length],
    placements: PLACEMENT_OPTIONS[index % PLACEMENT_OPTIONS.length],
    placementTypes: ALL_PLACEMENT_TYPES[index % ALL_PLACEMENT_TYPES.length],
    platforms: ["TikTok", "Instagram", "YouTube", "Twitter"][index % 4],
    smv: 55 + index * 5,
    fmv: 3 + index * 0.5,
    impressions: 12 + index,
    views: 55 + index * 5,
    videoViews: 125 + index * 10,
  }))
}

// Predefined filter categories
const FILTER_CATEGORIES = ["General", "Performance", "Engagement", "Sponsors", "RightsHolders"]

export default function Page() {
  const [filterType, setFilterType] = useState<"dateRange" | "years">("dateRange")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([])
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])
  const [selectedPlacementTypes, setSelectedPlacementTypes] = useState<string[]>([])
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [selectedRightsholders, setSelectedRightsholders] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>([])
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [selectedHandles, setSelectedHandles] = useState<string[]>([])
  const [selectedComparisonDates, setSelectedComparisonDates] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<string>("Date")
  const [showPageSpecificMetrics, setShowPageSpecificMetrics] = useState(false)
  const [mainTab, setMainTab] = useState("analytics")
  const [selectedInsightsTypes, setSelectedInsightsTypes] = useState<string[]>([])
  const [savedFilters, setSavedFilters] = useState<
    Array<{
      id: string
      name: string
      description?: string
      createdAt: Date
      category: string
      filters: {
        filterType: "dateRange" | "years"
        dateRange: { from: Date | undefined; to: Date | undefined }
        selectedYears: string[]
        selectedSponsors: string[]
        selectedPlacements: string[]
        selectedPlacementTypes: string[]
        selectedRightsholders: string[]
        selectedPlatforms: string[]
        selectedAccountTypes: string[]
        selectedMediaTypes: string[]
        selectedCollections: string[]
        selectedHashtags: string[]
        selectedHandles: string[]
        selectedComparisonDates: string[]
        groupBy: string
      }
    }>
  >([])
  const [showSaveFilterDrawer, setShowSaveFilterDrawer] = useState(false)
  const [showSavedFiltersDrawer, setShowSavedFiltersDrawer] = useState(false)
  const [filterNameToSave, setFilterNameToSave] = useState("")
  const [filterDescriptionToSave, setFilterDescriptionToSave] = useState("")
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null)
  const [filterCategoryToSave, setFilterCategoryToSave] = useState(FILTER_CATEGORIES[0])
  const [filterCategorySearch, setFilterCategorySearch] = useState("")
  const [activeTab, setActiveTab] = useState("generate")
  const [isSecondaryFiltersExpanded, setIsSecondaryFiltersExpanded] = useState(false)
  const [isTemplateGalleryExpanded, setIsTemplateGalleryExpanded] = useState(true)
  const [generatedTemplates, setGeneratedTemplates] = useState<Set<number>>(new Set())
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<Set<number>>(new Set())
  const [savedTemplateInsights, setSavedTemplateInsights] = useState<
    Array<{
      id: string
      dateSaved: Date
      insightsType: string
      sponsor: string
      rightsholder: string
      metric: string
      description?: string
      templateData: any
      filters?: {
        sponsors: string[]
        rightsholders: string[]
        placements: string[]
        placementTypes: string[]
        dateRange: { from: Date | undefined; to: Date | undefined }
        selectedYears: string[]
      }
    }>
  >([])
  const [outcomesActiveTab, setOutcomesActiveTab] = useState("table")

  // Custom Insights state
  const [customInsightsCount, setCustomInsightsCount] = useState(0)
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState<
    Array<{
      id: string
      type: "user" | "assistant"
      content: string
      timestamp: Date
      insight?: any
    }>
  >([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentInsight, setCurrentInsight] = useState<any>(null)
  const [savedCustomInsights, setSavedCustomInsights] = useState<
    Array<{
      id: string
      dateGenerated: Date
      insightType: string
      createdBy: string
      query: string
      insight: any
    }>
  >([])
  const [showRatingDrawer, setShowRatingDrawer] = useState(false)
  const [currentRating, setCurrentRating] = useState(0)
  const [ratingFeedback, setRatingFeedback] = useState("")
  const [showAllInsightsModal, setShowAllInsightsModal] = useState(false)
  const [expandedGeneratedInsightId, setExpandedGeneratedInsightId] = useState<string | null>(null)

  // Template Gallery state
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Template data
  const templateData = [
    {
      id: 1,
      title: "ROI Trend Analysis",
      description:
        "Analyze return on investment trends across different time periods and identify optimization opportunities.",
      category: "ROI Analysis",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=ROI+Chart",
      prompt:
        "Analyze ROI trends for the selected sponsors and time period. Show me the return on investment patterns, identify the best and worst performing periods, and provide recommendations for optimization.",
    },
    {
      id: 2,
      title: "Top Platform Comparison",
      description:
        "Compare performance metrics across different social media platforms to identify the most effective channels.",
      category: "Platform Performance",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Platform+Chart",
      prompt:
        "Compare performance across all selected platforms. Show me which platforms generate the highest engagement, reach, and conversion rates. Include recommendations for platform-specific strategies.",
    },
    {
      id: 3,
      title: "Sponsor Engagement Overview",
      description: "Get a comprehensive view of sponsor engagement metrics and performance indicators.",
      category: "Audience Insights",
      sampleChartUrl: "/placeholder.svg?height=120&width=200&text=Engagement+Chart",
      prompt:
        "Provide a comprehensive sponsor engagement analysis. Show me engagement rates, audience interaction patterns, and identify which sponsors are performing best in terms of audience connection.",
    },
  ]

  const categories = [
    "All",
    "Bookmarked",
    "ROI Analysis",
    "Trend Comparison",
    "Platform Performance",
    "Audience Insights",
    "Custom Metrics",
  ]

  const baseData = useMemo(() => generateBaseData(), [])

  const availableYears = ["2025", "2024", "2023", "2022", "2021"]

  const handleYearToggle = (year: string) => {
    setSelectedYears((prev) => (prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]))
  }

  // Sponsors handlers
  const handleSponsorToggle = (sponsor: string) => {
    setSelectedSponsors((prev) => (prev.includes(sponsor) ? prev.filter((s) => s !== sponsor) : [...prev, sponsor]))
  }

  const removeSponsor = (sponsor: string) => {
    setSelectedSponsors((prev) => prev.filter((s) => s !== sponsor))
  }

  const clearAllSponsors = () => {
    setSelectedSponsors([])
  }

  const handleSponsorCategorySelectAll = (categorySponsors: string[]) => {
    const allSelected = categorySponsors.every((sponsor) => selectedSponsors.includes(sponsor))
    if (allSelected) {
      setSelectedSponsors((prev) => prev.filter((sponsor) => !categorySponsors.includes(sponsor)))
    } else {
      setSelectedSponsors((prev) => [...new Set([...prev, ...categorySponsors])])
    }
  }

  const isSponsorCategoryFullySelected = (categorySponsors: string[]) => {
    return categorySponsors.every((sponsor) => selectedSponsors.includes(sponsor))
  }

  const isSponsorCategoryPartiallySelected = (categorySponsors: string[]) => {
    return (
      categorySponsors.some((sponsor) => selectedSponsors.includes(sponsor)) &&
      !isSponsorCategoryFullySelected(categorySponsors)
    )
  }

  const handlePlacementToggle = (placement: string) => {
    setSelectedPlacements((prev) =>
      prev.includes(placement) ? prev.filter((p) => p !== placement) : [...prev, placement],
    )
  }

  const removePlacement = (placement: string) => {
    setSelectedPlacements((prev) => prev.filter((p) => p !== placement))
  }

  const clearAllPlacements = () => {
    setSelectedPlacements([])
  }

  // Placement Types handlers
  const handlePlacementTypeToggle = (placementType: string) => {
    setSelectedPlacementTypes((prev) =>
      prev.includes(placementType) ? prev.filter((p) => p !== placementType) : [...prev, placementType],
    )
  }

  const removePlacementType = (placementType: string) => {
    setSelectedPlacementTypes((prev) => prev.filter((p) => p !== placementType))
  }

  const clearAllPlacementTypes = () => {
    setSelectedPlacementTypes([])
  }

  const handleCategorySelectAll = (categoryItems: string[]) => {
    const allSelected = categoryItems.every((item) => selectedPlacementTypes.includes(item))
    if (allSelected) {
      setSelectedPlacementTypes((prev) => prev.filter((item) => !categoryItems.includes(item)))
    } else {
      setSelectedPlacementTypes((prev) => [...new Set([...prev, ...categoryItems])])
    }
  }

  const isCategoryFullySelected = (categoryItems: string[]) => {
    return categoryItems.every((item) => selectedPlacementTypes.includes(item))
  }

  const isCategoryPartiallySelected = (categoryItems: string[]) => {
    return (
      categoryItems.some((item) => selectedPlacementTypes.includes(item)) && !isCategoryFullySelected(categoryItems)
    )
  }

  const handleRightsholderToggle = (rightsholder: string) => {
    setSelectedRightsholders((prev) =>
      prev.includes(rightsholder) ? prev.filter((r) => r !== rightsholder) : [...prev, rightsholder],
    )
  }

  const removeRightsholder = (rightsholder: string) => {
    setSelectedRightsholders((prev) => prev.filter((r) => r !== rightsholder))
  }

  const clearAllRightsholders = () => {
    setSelectedRightsholders([])
  }

  const handleRightsholderCategorySelectAll = (categoryRightsholders: string[]) => {
    const allSelected = categoryRightsholders.every((rightsholder) => selectedRightsholders.includes(rightsholder))
    if (allSelected) {
      setSelectedRightsholders((prev) => prev.filter((rightsholder) => !categoryRightsholders.includes(rightsholder)))
    } else {
      setSelectedRightsholders((prev) => [...new Set([...prev, ...categoryRightsholders])])
    }
  }

  const isRightsholderCategoryFullySelected = (categoryRightsholders: string[]) => {
    return categoryRightsholders.every((rightsholder) => selectedRightsholders.includes(rightsholder))
  }

  const isRightsholderCategoryPartiallySelected = (categoryRightsholders: string[]) => {
    return (
      categoryRightsholders.some((rightsholder) => selectedRightsholders.includes(rightsholder)) &&
      !isRightsholderCategoryFullySelected(categoryRightsholders)
    )
  }

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    let filtered = baseData

    // Filter by rightsholders
    if (selectedRightsholders.length > 0) {
      filtered = filtered.filter((item) => selectedRightsholders.includes(item.rightsholders))
    }

    // Filter by sponsors
    if (selectedSponsors.length > 0) {
      filtered = filtered.filter((item) => selectedSponsors.includes(item.sponsors))
    }

    // Filter by placements
    if (selectedPlacements.length > 0) {
      filtered = filtered.filter((item) => selectedPlacements.includes(item.placements))
    }

    // Filter by placement types
    if (selectedPlacementTypes.length > 0) {
      filtered = filtered.filter((item) => selectedPlacementTypes.includes(item.placementTypes))
    }

    // Filter by date/year
    if (filterType === "dateRange" && dateRange.from && dateRange.to) {
      filtered = filtered.filter((item) => {
        const itemDate = item.dateObj
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!
      })
    } else if (filterType === "years" && selectedYears.length > 0) {
      filtered = filtered.filter((item) => {
        const itemYear = item.dateObj.getFullYear().toString()
        return selectedYears.includes(itemYear)
      })
    } else {
      // Default to current year if no date filters applied
      filtered = filtered.filter((item) => item.dateObj.getFullYear() === 2025)
    }

    return filtered
  }, [
    baseData,
    filterType,
    dateRange,
    selectedYears,
    selectedSponsors,
    selectedPlacements,
    selectedPlacementTypes,
    selectedRightsholders,
  ])

  const [showScorecardDrawer, setShowScorecardDrawer] = useState(false)
  const [scorecardDrawerAnimating, setScorecardDrawerAnimating] = useState(false)

  const openScorecardDrawer = () => {
    setShowScorecardDrawer(true)
    setTimeout(() => setScorecardDrawerAnimating(true), 0)
  }

  const closeScorecardDrawer = () => {
    setScorecardDrawerAnimating(false)
    setTimeout(() => setShowScorecardDrawer(false), 300)
  }

  return (
    <div className="w-full">
      {/* Sticky Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6 pb-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Relo Edge</h1>
          </div>

          {/* Main Tabs Section */}
          <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
            <TabsList className="inline-flex bg-transparent border-b border-gray-200 rounded-none p-0 h-auto w-auto">
              <TabsTrigger
                value="analytics"
                className="relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-600 bg-transparent border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none shadow-none"
              >
                <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="automated-insights"
                className="relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-600 bg-transparent border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none shadow-none"
              >
                <FontAwesomeIcon icon={faMagicWandSparkles} className="h-5 w-5 mr-2" />
                Automated Insights
              </TabsTrigger>
              <TabsTrigger
                value="custom-insights"
                className="relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-600 bg-transparent border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none shadow-none"
              >
                <FontAwesomeIcon icon={faRobot} className="h-5 w-5 mr-2" />
                Custom Insights
              </TabsTrigger>
              <TabsTrigger
                value="outcomes"
                className="relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-600 bg-transparent border-b-2 border-transparent hover:text-gray-900 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none shadow-none"
              >
                <FontAwesomeIcon icon={faArrowTrendUp} className="h-5 w-5 mr-2" />
                Outcomes
              </TabsTrigger>
            </TabsList>

            {/* Thin grey border that extends 100% across the page */}
            <div className="w-screen relative -ml-6 border-b border-gray-200 mt-4"></div>

            {/* Analytics Tab Content */}
            <TabsContent value="analytics" className="mt-6 mb-0">
              <div className="p-5">
                {/* Active Filters Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                      className="flex items-center justify-between w-auto min-w-0 text-gray-600 hover:text-gray-800"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <FontAwesomeIcon icon={faSliders} className="h-4 w-4" />
                        <span className="text-sm font-medium">Sort Filters</span>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-300">Group By: {groupBy}</Badge>

                        {/* Time Period Tags */}
                        {filterType === "dateRange" && dateRange.from && dateRange.to && (
                          <>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                              From: {format(dateRange.from, "yyyy-MM-dd")}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                              To: {format(dateRange.to, "yyyy-MM-dd")}
                            </Badge>
                          </>
                        )}
                        {filterType === "years" && selectedYears.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            Years: {selectedYears.join(", ")}
                          </Badge>
                        )}

                        {/* Rightsholders Tag */}
                        {selectedRightsholders.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {selectedRightsholders.length} Rightsholder{selectedRightsholders.length !== 1 ? "s" : ""}
                            Selected
                          </Badge>
                        )}

                        {/* Sponsors Tag */}
                        {selectedSponsors.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {selectedSponsors.length} Sponsor{selectedSponsors.length !== 1 ? "s" : ""} Selected
                          </Badge>
                        )}

                        {/* Placements Tag */}
                        {selectedPlacements.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {selectedPlacements.length} Placement{selectedPlacements.length !== 1 ? "s" : ""} Selected
                          </Badge>
                        )}

                        {/* Placement Types Tag */}
                        {selectedPlacementTypes.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {selectedPlacementTypes.length} Placement Type
                            {selectedPlacementTypes.length !== 1 ? "s" : ""} Selected
                          </Badge>
                        )}

                        {/* Comparison Dates Tag */}
                        {selectedComparisonDates.length > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            Comparison: {selectedComparisonDates[0]}
                          </Badge>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                      className="ml-auto text-gray-600 hover:text-gray-800"
                    >
                      <FontAwesomeIcon icon={isFilterExpanded ? faChevronUp : faChevronDown} className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Analytics Sub-tabs Section */}
                <Tabs defaultValue="breakdown" className="w-full">
                  <div className="flex items-center justify-between mb-6 mt-6">
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-auto">
                      <TabsTrigger
                        value="breakdown"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                      >
                        <FontAwesomeIcon icon={faTable} className="h-4 w-4 mr-2" />
                        Breakdown
                      </TabsTrigger>
                      <TabsTrigger
                        value="visualization"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                      >
                        <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 mr-2" />
                        Visualization
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="breakdown" className="space-y-6">
                    <DataTable data={filteredData} />
                  </TabsContent>

                  <TabsContent value="visualization" className="space-y-6">
                    <DataBarChart data={filteredData} />
                    <MultiMetricChart data={filteredData} />
                    <ComparisonLineChart data={filteredData} />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            {/* Automated Insights Tab Content */}
            <TabsContent value="automated-insights" className="mt-6 mb-0">
              <div className="w-full">
                <div className="space-y-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Insight Template Gallery</h2>
                        <p className="text-sm text-gray-600">
                          Choose from pre-built templates to quickly generate automated insights for your data
                        </p>
                      </div>
                      <button
                        onClick={() => setIsTemplateGalleryExpanded(!isTemplateGalleryExpanded)}
                        className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={isTemplateGalleryExpanded ? faChevronUp : faChevronDown}
                          className="h-4 w-4"
                        />
                      </button>
                    </div>

                    {isTemplateGalleryExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {templateData.map((template) => (
                          <div
                            key={template.id}
                            className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                          >
                            <div className="mb-4">
                              <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">{template.description}</p>
                            </div>

                            <div className="mb-4">
                              <Badge variant="secondary" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>

                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2">
                              <FontAwesomeIcon icon={faMagicWandSparkles} className="h-4 w-4" />
                              Generate Insight
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div id="automated-insights-metrics">
                    <AutomatedInsights data={filteredData} savedTemplateInsights={savedTemplateInsights} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Custom Insights Tab Content */}
            <TabsContent value="custom-insights" className="mt-6 mb-0">
              <div className="w-full">
                <div className="space-y-8">
                  <div className="bg-white border-2 border-blue-300 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FontAwesomeIcon icon={faRobot} className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            Custom Insights ({customInsightsCount})
                          </h2>
                          <p className="text-sm text-gray-600">
                            Generate personalized insights using AI-powered analysis
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="flex gap-2 mb-4">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask about your data insights..."
                            className="flex-1 py-3 text-sm"
                          />
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-lg bg-gray-50 p-4">
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <FontAwesomeIcon icon={faRobot} className="h-12 w-12 mb-4 text-gray-400" />
                              <h4 className="font-medium text-gray-700 mb-2">AI-Powered Custom Insights</h4>
                              <p className="text-sm text-gray-500 mb-4 max-w-md">
                                Ask questions about your data and get instant, personalized insights with
                                visualizations.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="border rounded-lg p-4 bg-white">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-gray-500" />
                            Recent Queries
                          </h4>
                          <div className="space-y-2">
                            {[
                              "Show me Nike performance in Q4",
                              "Compare Instagram vs TikTok engagement",
                              "Top performing placements this month",
                            ].map((query, index) => (
                              <button
                                key={index}
                                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-gray-200"
                              >
                                {query}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Outcomes Tab Content */}
            <TabsContent value="outcomes" className="mt-6 mb-0">
              <div className="w-full">
                <div className="space-y-8 pb-6">
                  {/* Survey Results Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">Measuring Spurs Fan Engagement</h2>
                          <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600">i</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          For Spurs Games, have you done the following in the past year?
                        </p>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-xs text-gray-600">
                            Please note that engagement is the un-duplicated number of people who have done 1 or more of the actions listed below
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button onClick={openScorecardDrawer} className="btn-primary flex items-center gap-2">
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                          View Scorecard
                        </button>
                      </div>
                    </div>

                    {/* Engagement Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faTable} className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Watched live broadcast games on ESPN+</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">34%</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Recommended games to others to watch</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">32%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-orange-600" />
                            <span className="text-sm font-medium text-gray-700">Followed Events, Updates or News</span>
                          </div>
                          <span className="text-lg font-bold text-orange-600">44%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-red-600" />
                            <span className="text-sm font-medium text-gray-700">Purchased or wore Spurs merchandise</span>
                          </div>
                          <span className="text-lg font-bold text-red-600">60%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faEye} className="h-5 w-5 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Watched games live online</span>
                          </div>
                          <span className="text-lg font-bold text-indigo-600">30%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faChartColumn} className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700">Played Fantasy Basketball or got on a game</span>
                          </div>
                          <span className="text-lg font-bold text-yellow-600">31%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Followed games through social media</span>
                          </div>
                          <span className="text-lg font-bold text-gray-600">55%</span>
                        </div>
                      </div>

                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-teal-600" />
                            <span className="text-sm font-medium text-gray-700">Attended live Spurs events</span>
                          </div>
                          <span className="text-lg font-bold text-teal-600">28%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Table Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => setOutcomesActiveTab("table")}
                          className={`pb-2 font-medium ${outcomesActiveTab === "table" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          RESULTS TABLE
                        </button>
                        <button 
                          onClick={() => setOutcomesActiveTab("chart")}
                          className={`pb-2 font-medium ${outcomesActiveTab === "chart" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          COMPARISON CHART
                        </button>
                      </div>
                      <button className="btn-secondary flex items-center gap-2">
                        <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                        Download CSV
                      </button>
                    </div>

                    {/* Conditional Content Based on Active Tab */}
                    {outcomesActiveTab === "table" ? (
                      /* Data Table */
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Key Metric</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric Defined</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">San Antonio Spurs</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">League Average</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">Fan Base Size</td>
                              <td className="py-3 px-4 text-sm text-gray-700">Fan base reached in past 12 months</td>
                              <td className="py-3 px-4 text-sm text-gray-900">~3,952,000</td>
                              <td className="py-3 px-4 text-sm text-gray-900">~3,000,000</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">% Telco Switchers</td>
                              <td className="py-3 px-4 text-sm text-gray-700">% of category switchers who are fans</td>
                              <td className="py-3 px-4 text-sm text-gray-900">70%</td>
                              <td className="py-3 px-4 text-sm text-gray-900">60%</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">% T-Mobile Customers</td>
                              <td className="py-3 px-4 text-sm text-gray-700">% of T-Mobile customers who are fans</td>
                              <td className="py-3 px-4 text-sm text-gray-900">52%</td>
                              <td className="py-3 px-4 text-sm text-gray-900">45%</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">$ Sponsor Media Value</td>
                              <td className="py-3 px-4 text-sm text-gray-700">$ media value generated for T-Mobile</td>
                              <td className="py-3 px-4 text-sm text-gray-900">$6,505.47</td>
                              <td className="py-3 px-4 text-sm text-gray-900">$5,000,000</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">$ SMV / Fan</td>
                              <td className="py-3 px-4 text-sm text-gray-700 flex items-center gap-2">
                                $1.64
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900 flex items-center gap-2">
                                $1.50
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900"># Fans Aware</td>
                              <td className="py-3 px-4 text-sm text-gray-700">Fans aware of T-Mobile's sponsorship</td>
                              <td className="py-3 px-4 text-sm text-gray-900">1,857,700</td>
                              <td className="py-3 px-4 text-sm text-gray-900">1,500,000</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900"># Fans Impacted</td>
                              <td className="py-3 px-4 text-sm text-gray-700">Fans impacted by T-Mobile's sponsorship</td>
                              <td className="py-3 px-4 text-sm text-gray-900">873,000</td>
                              <td className="py-3 px-4 text-sm text-gray-900">750,000</td>
                            </tr>
                            <tr className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">$ SMV / Fan Impacted</td>
                              <td className="py-3 px-4 text-sm text-gray-700 flex items-center gap-2">
                                $7.45
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900 flex items-center gap-2">
                                $6.50
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Comparison Chart */
                      <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                          <h4 className="font-semibold text-lg text-gray-900 mb-4">San Antonio Spurs vs League Average Comparison</h4>
                          <div className="h-96">
                            <ChartContainer
                              config={{
                                spurs: {
                                  label: "San Antonio Spurs",
                                  color: "#3B82F6",
                                },
                                league: {
                                  label: "League Average",
                                  color: "#6B7280",
                                },
                              }}
                              className="h-full w-full"
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={[
                                    { metric: "Fan Base Size", spurs: 3952000, league: 3000000 },
                                    { metric: "% Telco Switchers", spurs: 70, league: 60 },
                                    { metric: "% T-Mobile Customers", spurs: 52, league: 45 },
                                    { metric: "SMV (in thousands)", spurs: 6505, league: 5000 },
                                    { metric: "SMV per Fan", spurs: 1.64, league: 1.50 },
                                    { metric: "Fans Aware", spurs: 1857700, league: 1500000 },
                                    { metric: "Fans Impacted", spurs: 873000, league: 750000 },
                                    { metric: "SMV per Fan Impacted", spurs: 7.45, league: 6.50 },
                                  ]}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                  barCategoryGap="20%"
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="metric" 
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
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
                                    formatter={(value, name) => {
                                      if (typeof value === 'number') {
                                        if (value > 1000000) {
                                          return [`${(value / 1000000).toFixed(1)}M`, name]
                                        } else if (value > 1000) {
                                          return [`${(value / 1000).toFixed(1)}K`, name]
                                        }
                                        return [value.toLocaleString(), name]
                                      }
                                      return [value, name]
                                    }}
                                  />
                                  <Legend />
                                  <Bar dataKey="spurs" fill="#3B82F6" name="San Antonio Spurs" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="league" fill="#6B7280" name="League Average" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </div>
                          <div className="mt-4 text-xs text-gray-500">
                            <div className="font-medium mb-1">Chart Information:</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>Blue bars represent San Antonio Spurs performance</div>
                              <div>Gray bars represent League Average benchmarks</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Brand Recall Statement */}
                    <div className="mt-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Brand recall excelling for T-Mobile. T-Mobile has higher brand recall than average.
                      </h3>

                      {/* Sports Team Benchmark */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">Sports Team Benchmark:</span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Top 10%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Top 25%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Top 50%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">Bottom 50%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  {/* Insights Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={faLightbulb} className="h-5 w-5 text-yellow-600" />
                      Insights:
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Summary */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 text-blue-600" />
                          Summary:
                        </h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-2 ml-6">
                          <li>SMV for T-Mobile is 10% above average for its placement mix and is leading to higher than average recall among fans.</li>
                        </ul>
                      </div>

                      {/* Detailed Insights */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 text-green-600" />
                          Insights:
                        </h4>
                        <ul className="list-disc list-inside text-gray-700 space-y-3 ml-6">
                          <li>Both sponsorships offer an opportunity for T-Mobile to win with category buyers, a mix of current and competitive customers</li>
                          <li>The Rangers sponsorship is generating half as much $ media value per fan, but is delivering almost 2x the impact</li>
                          <li>Increased media value with the Rangers with partnership messaging will continue to drive awareness and impact</li>
                          <li>Consider optimizing the asset mix for the Phillies to drive greater efficiency</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Scorecard Drawer */}
      {showScorecardDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${scorecardDrawerAnimating ? "bg-opacity-50" : "bg-opacity-0"}`}
            onClick={closeScorecardDrawer}
          ></div>
          <div
            className={`absolute right-0 top-0 h-full w-[900px] bg-white shadow-xl transition-transform duration-300 ease-out ${scorecardDrawerAnimating ? "translate-x-0" : "translate-x-full"} overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Scorecard</h2>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Report
                  </button>
                  <button className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">
                    View More Info at Relo Outcomes
                  </button>
                  <button onClick={closeScorecardDrawer} className="text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Team Header */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">SPURS</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">San Antonio Spurs - Sample Surveyed: 202</h3>
                  </div>
                </div>
              </div>

              {/* Top Metrics */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Opportunity Rank</h4>
                  <div className="text-3xl font-bold text-blue-600">#6</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Opportunity Score</h4>
                  <div className="text-3xl font-bold text-green-600">40</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Opportunity Value</h4>
                  <div className="text-3xl font-bold text-orange-600">22</div>
                </div>
              </div>

              {/* Total Fans Surveyed */}
              <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="font-semibold text-gray-800">Total Fans Surveyed</h4>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">i</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Engagement</span>
                      <span className="font-medium text-gray-900">58%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: "58%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavior & Interest */}
              <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="font-semibold text-gray-800">Behavior & Interest</h4>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">i</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Intensity</span>
                      <span className="font-medium text-gray-900">70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Momentum</span>
                      <span className="font-medium text-gray-900">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-orange-600 h-3 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Potential Sponsor Impact */}
              <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="font-semibold text-gray-800">Potential Sponsor Impact</h4>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">i</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Consideration</span>
                      <span className="font-medium text-gray-900">70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-teal-600 h-3 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Favorability</span>
                      <span className="font-medium text-gray-900">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-indigo-600 h-3 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">Team Performance Data</h4>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    EXPORT TO CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Rightsholder</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Region</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Aided Sponsorship Awareness</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Net More Favorable</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Increase Consideration</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">New York Knicks</td>
                        <td className="py-3 px-4 text-gray-900">Chase</td>
                        <td className="py-3 px-4 text-gray-900">New York</td>
                        <td className="py-3 px-4 text-gray-900">44%</td>
                        <td className="py-3 px-4 text-gray-900">45%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Atlanta Hawks</td>
                        <td className="py-3 px-4 text-gray-900">Nike</td>
                        <td className="py-3 px-4 text-gray-900">Atlanta</td>
                        <td className="py-3 px-4 text-gray-900">54%</td>
                        <td className="py-3 px-4 text-gray-900">26%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Chicago Bulls</td>
                        <td className="py-3 px-4 text-gray-900">Citizens Bank</td>
                        <td className="py-3 px-4 text-gray-900">Chicago</td>
                        <td className="py-3 px-4 text-gray-900">64%</td>
                        <td className="py-3 px-4 text-gray-900">19%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 bg-blue-50">
                        <td className="py-3 px-4 text-gray-900 font-medium">San Antonio Spurs</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">T-Mobile</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">San Antonio</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">55%</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">58%</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">45%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Houston Rockets</td>
                        <td className="py-3 px-4 text-gray-900">Xfinity</td>
                        <td className="py-3 px-4 text-gray-900">Houston</td>
                        <td className="py-3 px-4 text-gray-900">24%</td>
                        <td className="py-3 px-4 text-gray-900">23%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Toronto Raptors</td>
                        <td className="py-3 px-4 text-gray-900">Blue Cross</td>
                        <td className="py-3 px-4 text-gray-900">Toronto</td>
                        <td className="py-3 px-4 text-gray-900">24%</td>
                        <td className="py-3 px-4 text-gray-900">28%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Miami Heat</td>
                        <td className="py-3 px-4 text-gray-900">State Farm</td>
                        <td className="py-3 px-4 text-gray-900">Miami</td>
                        <td className="py-3 px-4 text-gray-900">24%</td>
                        <td className="py-3 px-4 text-gray-900">34%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Los Angeles Lakers</td>
                        <td className="py-3 px-4 text-gray-900">Chevrolet</td>
                        <td className="py-3 px-4 text-gray-900">Los Angeles</td>
                        <td className="py-3 px-4 text-gray-900">24%</td>
                        <td className="py-3 px-4 text-gray-900">24%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Boston Celtics</td>
                        <td className="py-3 px-4 text-gray-900">Remax</td>
                        <td className="py-3 px-4 text-gray-900">Boston</td>
                        <td className="py-3 px-4 text-gray-900">24%</td>
                        <td className="py-3 px-4 text-gray-900">33%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">Philadelphia Phillies</td>
                        <td className="py-3 px-4 text-gray-900">SmartWater</td>
                        <td className="py-3 px-4 text-gray-900">Pennsylvania</td>
                        <td className="py-3 px-4 text-gray-900">24%</td>
                        <td className="py-3 px-4 text-gray-900">53%</td>
                        <td className="py-3 px-4 text-gray-900">35%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
