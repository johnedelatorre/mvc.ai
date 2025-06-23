"use client"
import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
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
  faTimes,
  faChevronDown,
  faChartLine,
  faMagicWandSparkles,
  faFilter,
  faChevronUp,
  faSave,
  faFolderOpen,
  faSliders,
  faEye,
  faBookmark,
  faRobot,
  faArrowTrendUp,
  faLightbulb,
  faPaperPlane,
  faClock,
  faSearch,
  faUsers,
  faStar,
} from "@fortawesome/free-solid-svg-icons"
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
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
  const [showScorecardDrawer, setShowScorecardDrawer] = useState(false)
  const [scorecardDrawerAnimating, setScorecardDrawerAnimating] = useState(false)
  const [showSurveyScoresDrawer, setShowSurveyScoresDrawer] = useState(false)
  const [surveyScoresDrawerAnimating, setSurveyScoresDrawerAnimating] = useState(false)

  // Scorecard drawer data
  const scorecardData = {
    teamName: "San Antonio Spurs",
    sampleSurveyed: 202,
    opportunityRank: 6,
    opportunityScore: 40,
    opportunityValue: 22,
    totalFansSurveyed: {
      engagement: 58
    },
    behaviorAndInterest: {
      intensity: 70,
      momentum: 30
    },
    potentialSponsorImpact: {
      consideration: 70,
      favorability: 30
    },
    teamsData: [
      { rightsholder: "New York Knicks", brand: "Chase", region: "New York", aidedSponsorshipAwareness: "44%", netMoreFavorable: "45%", netIncreaseConsideration: "35%" },
      { rightsholder: "Atlanta Hawks", brand: "Nike", region: "Atlanta", aidedSponsorshipAwareness: "54%", netMoreFavorable: "26%", netIncreaseConsideration: "35%" },
      { rightsholder: "Chicago Bulls", brand: "Citizens Bank", region: "Chicago", aidedSponsorshipAwareness: "64%", netMoreFavorable: "19%", netIncreaseConsideration: "35%" },
      { rightsholder: "San Antonio Spurs", brand: "T-Mobile", region: "San Antonio", aidedSponsorshipAwareness: "55%", netMoreFavorable: "58%", netIncreaseConsideration: "45%" },
      { rightsholder: "Houston Rockets", brand: "Xfinity", region: "Houston", aidedSponsorshipAwareness: "24%", netMoreFavorable: "23%", netIncreaseConsideration: "35%" }
    ]
  }

  const openScorecardDrawer = () => {
    setShowScorecardDrawer(true)
    setTimeout(() => setScorecardDrawerAnimating(true), 0)
  }

  const closeScorecardDrawer = () => {
    setScorecardDrawerAnimating(false)
    setTimeout(() => setShowScorecardDrawer(false), 300)
  }

  const openSurveyScoresDrawer = () => {
    setShowSurveyScoresDrawer(true)
    setTimeout(() => setSurveyScoresDrawerAnimating(true), 0)
  }

  const closeSurveyScoresDrawer = () => {
    setSurveyScoresDrawerAnimating(false)
    setTimeout(() => setShowSurveyScoresDrawer(false), 300)
  }
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

  // Template gallery helper functions
  const filteredTemplates = useMemo(() => {
    let filtered = templateData

    if (selectedCategory === "Bookmarked") {
      filtered = filtered.filter((template) => bookmarkedTemplates.has(template.id))
    } else if (selectedCategory !== "All") {
      filtered = filtered.filter((template) => template.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filtered
  }, [searchQuery, selectedCategory, bookmarkedTemplates])

  const totalPages = Math.ceil(filteredTemplates.length / 6)
  const visibleTemplates = filteredTemplates.slice((currentPage - 1) * 6, currentPage * 6)

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

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
      // Deselect all sponsors in this category
      setSelectedSponsors((prev) => prev.filter((sponsor) => !categorySponsors.includes(sponsor)))
    } else {
      // Select all sponsors in this category
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
      // Deselect all items in this category
      setSelectedPlacementTypes((prev) => prev.filter((item) => !categoryItems.includes(item)))
    } else {
      // Select all items in this category
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
      // Deselect all rightsholders in this category
      setSelectedRightsholders((prev) => prev.filter((rightsholder) => !categoryRightsholders.includes(rightsholder)))
    } else {
      // Select all rightsholders in this category
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

  // Get active filters for display
  const getActiveFilters = () => {
    const filters: string[] = []

    if (filterType === "dateRange" && dateRange.from && dateRange.to) {
      filters.push(`From: ${format(dateRange.from, "yyyy-MM-dd")}`)
      filters.push(`To: ${format(dateRange.to, "yyyy-MM-dd")}`)
    }

    if (filterType === "years" && selectedYears.length > 0) {
      filters.push(`Years: ${selectedYears.join(", ")}`)
    }

    if (selectedRightsholders.length > 0) {
      filters.push(`Rightsholders: ${selectedRightsholders.length} selected`)
    }

    if (selectedSponsors.length > 0) {
      filters.push(`Sponsors: ${selectedSponsors.length} selected`)
    }

    if (selectedPlacements.length > 0) {
      filters.push(`Placements: ${selectedPlacements.length} selected`)
    }

    if (selectedPlacementTypes.length > 0) {
      filters.push(`Types: ${selectedPlacementTypes.length} selected`)
    }

    return filters
  }

  const activeFilters = getActiveFilters()

  const PLATFORMS_OPTIONS = ["TikTok", "Instagram", "YouTube", "Twitter", "Facebook", "LinkedIn", "Snapchat"]
  const ACCOUNT_TYPES_OPTIONS = ["Official", "Fan", "Media", "Influencer", "Athlete", "Team"]
  const MEDIA_TYPES_OPTIONS = ["Video", "Image", "Story", "Reel", "Live", "IGTV", "Carousel"]
  const COLLECTIONS_OPTIONS = ["Game Highlights", "Behind Scenes", "Training", "Interviews", "Fan Content"]
  const HASHTAGS_OPTIONS = ["#NBA", "#Basketball", "Sports", "#GameDay", "#Playoffs", "#Finals"]
  const HANDLES_OPTIONS = ["@NBA", "@ESPN", "@SportsCenter", "@Bleacher", "@TheAthletic"]
  const COMPARISON_DATES_OPTIONS = ["Last Week", "Last Month", "Last Quarter", "Last Year", "Custom"]
  const GROUP_BY_OPTIONS = ["Date", "Platform", "Sponsor", "Placement", "Account Type"]
  const INSIGHTS_TYPE_OPTIONS = [
    "Automated Insights",
    "Custom Analysis",
    "Trending Metrics",
    "Performance Reports",
    "Comparative Analysis",
    "Predictive Insights",
    "Year over Year Benchmarking",
    "MVP % Evaluation",
  ]

  const clearAllFilters = () => {
    setFilterType("dateRange")
    setDateRange({ from: undefined, to: undefined })
    setSelectedYears([])
    setSelectedRightsholders([])
    setSelectedSponsors([])
    setSelectedPlacements([])
    setSelectedPlacementTypes([])
    setSelectedPlatforms([])
    setSelectedAccountTypes([])
    setSelectedMediaTypes([])
    setSelectedCollections([])
    setSelectedHashtags([])
    setSelectedHandles([])
    setSelectedComparisonDates([])
    setSelectedInsightsTypes([])
    setGroupBy("Date")
  }

  const applyFilters = () => {
    // Force re-render by updating a state that triggers filteredData recalculation
    // The filteredData useMemo will automatically recalculate based on current filter states
    console.log("Filters applied successfully!")

    // Optional: Show a success message or toast notification
    // You could add a toast notification here if you have a toast system
  }

  const handleInsightsTypeToggle = (insightsType: string) => {
    setSelectedInsightsTypes((prev) =>
      prev.includes(insightsType) ? prev.filter((i) => i !== insightsType) : [...prev, insightsType],
    )
  }

  const removeInsightsType = (insightsType: string) => {
    setSelectedInsightsTypes((prev) => prev.filter((i) => i !== insightsType))
  }

  const clearAllInsightsTypes = () => {
    setSelectedInsightsTypes([])
  }

  const [saveFilterDrawerAnimating, setSaveFilterDrawerAnimating] = useState(false)
  const [savedFiltersDrawerAnimating, setSavedFiltersDrawerAnimating] = useState(false)

  const openSaveFilterDrawer = () => {
    setShowSaveFilterDrawer(true)
    setTimeout(() => setSaveFilterDrawerAnimating(true), 0)
  }

  const closeSaveFilterDrawer = () => {
    setSaveFilterDrawerAnimating(false)
    setTimeout(() => setShowSaveFilterDrawer(false), 300)
  }

  const openSavedFiltersDrawer = () => {
    setShowSavedFiltersDrawer(true)
    setTimeout(() => setSavedFiltersDrawerAnimating(true), 0)
  }

  const closeSavedFiltersDrawer = () => {
    setSavedFiltersDrawerAnimating(false)
    setTimeout(() => setShowSavedFiltersDrawer(false), 300)
  }

  const saveCurrentFilters = () => {
    if (!filterNameToSave.trim()) {
      alert("Please enter a filter name.")
      return
    }

    const newFilter = {
      id: editingFilterId || Math.random().toString(36).substring(7),
      name: filterNameToSave,
      description: filterDescriptionToSave,
      createdAt: new Date(),
      category: filterCategoryToSave,
      filters: {
        filterType,
        dateRange,
        selectedYears,
        selectedSponsors,
        selectedPlacements,
        selectedPlacementTypes,
        selectedRightsholders,
        selectedPlatforms,
        selectedAccountTypes,
        selectedMediaTypes,
        selectedCollections,
        selectedHashtags,
        selectedHandles,
        selectedComparisonDates,
        groupBy,
      },
    }

    if (editingFilterId) {
      // Update existing filter
      setSavedFilters((prev) => prev.map((filter) => (filter.id === editingFilterId ? newFilter : filter)))
    } else {
      // Add new filter
      setSavedFilters((prev) => [...prev, newFilter])
    }

    closeSaveFilterDrawer()
    setFilterNameToSave("")
    setFilterDescriptionToSave("")
    setEditingFilterId(null)
  }

  const applySavedFilter = (filter: any) => {
    setFilterType(filter.filters.filterType)
    setDateRange(filter.filters.dateRange)
    setSelectedYears(filter.filters.selectedYears)
    setSelectedSponsors(filter.filters.selectedSponsors)
    setSelectedPlacements(filter.filters.selectedPlacements)
    setSelectedPlacementTypes(filter.filters.selectedPlacementTypes)
    setSelectedRightsholders(filter.filters.selectedRightsholders)
    setSelectedPlatforms(filter.filters.selectedPlatforms)
    setSelectedAccountTypes(filter.filters.selectedAccountTypes)
    setSelectedMediaTypes(filter.filters.selectedMediaTypes)
    setSelectedCollections(filter.filters.selectedCollections)
    setSelectedHashtags(filter.filters.selectedHashtags)
    setSelectedHandles(filter.filters.selectedHandles)
    setSelectedComparisonDates(filter.filters.selectedComparisonDates)
    setGroupBy(filter.filters.groupBy)
    closeSavedFiltersDrawer()
  }

  const deleteSavedFilter = (id: string) => {
    setSavedFilters((prev) => prev.filter((filter) => filter.id !== id))
  }

  const editSavedFilter = (filter: any) => {
    setEditingFilterId(filter.id)
    setFilterNameToSave(filter.name)
    setFilterDescriptionToSave(filter.description || "")
    setFilterCategoryToSave(filter.category)
    openSaveFilterDrawer()
  }

  const filteredSavedFilters = useMemo(() => {
    if (!filterCategorySearch) return savedFilters

    const searchTerm = filterCategorySearch.toLowerCase()
    return savedFilters.filter(
      (filter) => filter.name.toLowerCase().includes(searchTerm) || filter.category.toLowerCase().includes(searchTerm),
    )
  }, [savedFilters, filterCategorySearch])

  const handleGenerateFromTemplate = (template: any) => {
    // Placeholder function to simulate generating insights from a template
    console.log(`Generating insight from template: ${template.title}`)
    setGeneratedTemplates((prev) => new Set(prev).add(template.id))
  }

  const handleUseTemplate = (template: any) => {
    // Placeholder function to simulate using a template
    console.log(`Using template: ${template.title}`)
  }

  const handleBookmarkTemplate = (templateId: number) => {
    setBookmarkedTemplates((prev) => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(templateId)) {
        newBookmarks.delete(templateId)
      } else {
        newBookmarks.add(templateId)
      }
      return newBookmarks
    })
  }

  const handleComparisonDateToggle = (date: string) => {
    setSelectedComparisonDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [date]))
  }

  const removeComparisonDate = (date: string) => {
    setSelectedComparisonDates((prev) => prev.filter((d) => d !== date))
  }

  const clearAllComparisonDates = () => {
    setSelectedComparisonDates([])
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
        content: `Based on your query "${userMessage.content}", I've analyzed the data and generated comprehensive insights.`,
        timestamp: new Date(),
      }

      setChatHistory((prev) => [...prev, assistantMessage])

      // Generate mock insight with unique timestamp for chart variation
      const newInsight = {
        trending: {
          smv: Math.floor(Math.random() * 50) + 10,
          impressions: Math.floor(Math.random() * 30) + 15,
          engagement: Math.floor(Math.random() * 40) + 20,
        },
        topPerformers: {
          sponsor: ["Nike", "Adidas", "Coca-Cola", "Pepsi", "Under Armour", "Puma"][Math.floor(Math.random() * 6)],
          platform: ["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn", "Snapchat"][
            Math.floor(Math.random() * 6)
          ],
          placement: ["Jersey", "Billboard", "Court Side", "LED-Fascia", "Digital Display", "Floor Logo"][
            Math.floor(Math.random() * 6)
          ],
        },
        keyMetrics: {
          totalSMV: Math.floor(Math.random() * 1000) + 500,
          roi: Math.floor(Math.random() * 200) + 150,
          reach: (Math.random() * 3 + 1).toFixed(1),
        },
        // Add a unique identifier for chart generation
        generatedAt: Date.now(),
        chartSeed: Math.random() * 10000,
      }

      setCurrentInsight(newInsight)
      setCustomInsightsCount((prev) => prev + 1)
      setIsGenerating(false)
    }, 2000)
  }

  const handlePromptClick = (prompt: string) => {
    setChatInput(prompt)
    // Auto-submit the prompt
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // State for chart type selection
  const [chartType, setChartType] = useState<"bar" | "line">("bar")

  // Function to generate chart data from the current insight
  const generateChartData = (insight: any) => {
    if (!insight) return []

    // Generate 6 months of data based on the insight values
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const baseSmv = insight?.keyMetrics?.totalSMV || 500
    const baseImpressions = insight?.keyMetrics?.reach ? Number.parseFloat(insight.keyMetrics.reach) * 10 : 20
    const baseEngagement = insight?.trending?.engagement || 25

    // Create more varied trends based on the trending values
    const smvTrend = insight?.trending?.smv || 15
    const impressionsTrend = insight?.trending?.impressions || 20
    const engagementTrend = insight?.trending?.engagement || 25

    // Use a unique seed based on insight generation time and random values
    const seed = Date.now() + Math.random() * 1000

    return months.map((month, index) => {
      // Create different trend patterns for variety
      const trendPatterns = [
        // Linear growth
        (i: number) => 1 + (smvTrend / 100) * (i / 5),
        // Exponential growth
        (i: number) => 1 + Math.pow(1 + smvTrend / 200, i),
        // Seasonal pattern
        (i: number) => 1 + (smvTrend / 100) * Math.sin((i / 5) * Math.PI) * (i / 5),
        // Step growth
        (i: number) => 1 + (smvTrend / 100) * Math.floor((i + 1) / 2) * 0.5,
        // Volatile growth
        (i: number) => 1 + (smvTrend / 100) * (i / 5) * (0.7 + Math.sin(seed + i) * 0.3),
      ]

      // Select a random pattern based on the seed
      const patternIndex = Math.floor((seed + index) % trendPatterns.length)
      const trendPattern = trendPatterns[patternIndex]

      // Apply different volatility levels
      const volatilityFactor = () => {
        const baseVolatility = 0.8 + Math.sin(seed + index * 2.5) * 0.4 // 0.4 to 1.2
        return Math.max(0.3, baseVolatility) // Ensure minimum of 0.3
      }

      // Create different starting points and growth curves
      const smvMultiplier = trendPattern(index) * volatilityFactor()
      const impressionsMultiplier = trendPattern(index + 1) * volatilityFactor()
      const engagementMultiplier = trendPattern(index + 2) * volatilityFactor()

      // Add some correlation between metrics but with individual variation
      const correlationNoise = () => Math.sin(seed + index * 1.7) * 0.2 + 1 // 0.8 to 1.2

      return {
        month,
        smv: Math.max(10, Math.round(baseSmv * smvMultiplier * correlationNoise())),
        impressions: Math.max(5, Math.round(baseImpressions * impressionsMultiplier * correlationNoise())),
        engagement: Math.max(5, Math.round(baseEngagement * engagementMultiplier * correlationNoise())),
      }
    })
  }

  // Function to toggle expanded view for individual generated insights
  const toggleGeneratedInsightExpansion = (insightId: string) => {
    setExpandedGeneratedInsightId(expandedGeneratedInsightId === insightId ? null : insightId)
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

                {/* Main Filters Grid - Collapsible */}
                {isFilterExpanded && (
                  <div className="space-y-4">
                    {/* Row 1: Primary Filters */}
                    <div className="grid grid-cols-5 gap-4">
                      {/* Rightsholders */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rightsholders
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Rightsholders</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Rightsholders</div>
                                {selectedRightsholders.length > 0 && (
                                  <button onClick={clearAllRightsholders} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Rightsholders Tags */}
                              {selectedRightsholders.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedRightsholders.map((rightsholder) => (
                                    <Badge
                                      key={rightsholder}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {rightsholder}
                                      <button
                                        onClick={() => removeRightsholder(rightsholder)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Rightsholders by League */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(RIGHTSHOLDERS_STRUCTURE).map(([league, teams]) => (
                                  <div key={league} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`rightsholder-league-${league}`}
                                        checked={isRightsholderCategoryFullySelected(teams)}
                                        ref={(el) => {
                                          if (el) el.indeterminate = isRightsholderCategoryPartiallySelected(teams)
                                        }}
                                        onCheckedChange={() => handleRightsholderCategorySelectAll(teams)}
                                      />
                                      <label
                                        htmlFor={`rightsholder-league-${league}`}
                                        className="text-sm font-semibold text-gray-800 cursor-pointer border-b pb-1"
                                      >
                                        {league}
                                      </label>
                                      <span className="text-xs text-gray-500">({teams.length})</span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      {teams.map((team) => (
                                        <div key={team} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`rightsholder-${team}`}
                                            checked={selectedRightsholders.includes(team)}
                                            onCheckedChange={() => handleRightsholderToggle(team)}
                                          />
                                          <label htmlFor={`rightsholder-${team}`} className="text-sm cursor-pointer">
                                            {team}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                                <div className="pt-2 border-t">
                                  <button
                                    onClick={() => setSelectedRightsholders([...ALL_RIGHTSHOLDERS])}
                                    className="btn-secondary btn-sm w-full"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Sponsors */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsors
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Sponsors</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Sponsors</div>
                                {selectedSponsors.length > 0 && (
                                  <button onClick={clearAllSponsors} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Sponsors Tags */}
                              {selectedSponsors.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedSponsors.map((sponsor) => (
                                    <Badge
                                      key={sponsor}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {sponsor}
                                      <button
                                        onClick={() => removeSponsor(sponsor)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Sponsors by Category */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(SPONSORS_BY_CATEGORY).map(([category, sponsors]) => (
                                  <div key={category} className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`sponsor-category-${category}`}
                                        checked={isSponsorCategoryFullySelected(sponsors)}
                                        ref={(el) => {
                                          if (el) el.indeterminate = isSponsorCategoryPartiallySelected(sponsors)
                                        }}
                                        onCheckedChange={() => handleSponsorCategorySelectAll(sponsors)}
                                      />
                                      <label
                                        htmlFor={`sponsor-category-${category}`}
                                        className="text-sm font-semibold text-gray-800 cursor-pointer border-b pb-1"
                                      >
                                        {category}
                                      </label>
                                      <span className="text-xs text-gray-500">({sponsors.length})</span>
                                    </div>
                                    <div className="ml-6 space-y-1">
                                      {sponsors.map((sponsor) => (
                                        <div key={sponsor} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`sponsor-${sponsor}`}
                                            checked={selectedSponsors.includes(sponsor)}
                                            onCheckedChange={() => handleSponsorToggle(sponsor)}
                                          />
                                          <label htmlFor={`sponsor-${sponsor}`} className="text-sm cursor-pointer">
                                            {sponsor}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}

                                <div className="pt-2 border-t">
                                  <button
                                    onClick={() => setSelectedSponsors([...ALL_SPONSORS])}
                                    className="btn-secondary btn-sm w-full"
                                  >
                                    Select All
                                  </button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Placement Types */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placement Types
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Placement Types</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Placement Types</div>
                                {selectedPlacementTypes.length > 0 && (
                                  <button onClick={clearAllPlacementTypes} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Placement Types Tags */}
                              {selectedPlacementTypes.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                  {selectedPlacementTypes.map((placementType) => (
                                    <Badge
                                      key={placementType}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {placementType}
                                      <button
                                        onClick={() => removePlacementType(placementType)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Hierarchical Placement Types */}
                              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {Object.entries(PLACEMENT_TYPES_STRUCTURE).map(([mainCategory, categories]) => (
                                  <div key={mainCategory} className="space-y-2">
                                    <div className="font-semibold text-sm text-gray-800 border-b pb-1">
                                      {mainCategory}
                                    </div>
                                    {Object.entries(categories).map(([subCategory, items]) => (
                                      <div key={subCategory} className="ml-2 space-y-1">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`category-${subCategory}`}
                                            checked={isCategoryFullySelected(items)}
                                            ref={(el) => {
                                              if (el) el.indeterminate = isCategoryPartiallySelected(items)
                                            }}
                                            onCheckedChange={() => handleCategorySelectAll(items)}
                                          />
                                          <label
                                            htmlFor={`category-${subCategory}`}
                                            className="text-sm font-medium cursor-pointer"
                                          >
                                            {subCategory}
                                          </label>
                                          <span className="text-xs text-gray-500">({items.length})</span>
                                        </div>
                                        <div className="ml-6 space-y-1">
                                          {items.map((item) => (
                                            <div key={item} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`item-${item}`}
                                                checked={selectedPlacementTypes.includes(item)}
                                                onCheckedChange={() => handlePlacementTypeToggle(item)}
                                              />
                                              <label htmlFor={`item-${item}`} className="text-sm cursor-pointer">
                                                {item}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t">
                                <button
                                  onClick={() => setSelectedPlacementTypes([...ALL_PLACEMENT_TYPES])}
                                  className="btn-secondary btn-sm w-full"
                                >
                                  Select All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Placements */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Placements
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span className="text-gray-500">Select Placements</span>
                              <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">Select Placements</div>
                                {selectedPlacements.length > 0 && (
                                  <button onClick={clearAllPlacements} className="btn-tertiary btn-sm">
                                    Clear All
                                  </button>
                                )}
                              </div>

                              {/* Selected Placements Tags */}
                              {selectedPlacements.length > 0 && (
                                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md">
                                  {selectedPlacements.map((placement) => (
                                    <Badge
                                      key={placement}
                                      variant="secondary"
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {placement}
                                      <button
                                        onClick={() => removePlacement(placement)}
                                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
\
                              {/* Placement Options */}
                              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                {PLACEMENT_OPTIONS.map((placement) => (
                                  <div key={placement} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={placement}
                                      checked={selectedPlacements.includes(placement)}
                                      onCheckedChange={() => handlePlacementToggle(placement)}
                                    />
                                    <label htmlFor={placement} className="text-sm cursor-pointer flex-1">
                                      {placement}
                                    </label>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2 border-t">
                                <button
                                  onClick={() => setSelectedPlacements([...PLACEMENT_OPTIONS])}
                                  className="btn-secondary btn-sm w-full"
                                >
                                  Select All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Season Year or Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Period
                          <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <span
                                className={`truncate pr-2 min-w-0 flex-1 ${
                                  (filterType === "dateRange" && dateRange.from && dateRange.to) ||
                                  (filterType === "years" && selectedYears.length > 0)
                                    ? "text-gray-900 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                {filterType === "dateRange" && dateRange.from && dateRange.to
                                  ? `${format(dateRange.from, "MMM dd")} → ${format(dateRange.to, "MMM dd, yyyy")}`
                                  : filterType === "years" && selectedYears.length > 0
                                    ? selectedYears.length === 1
                                      ? `${selectedYears[0]} Season`
                                      : `${selectedYears.length} Seasons Selected`
                                    : "Select time period"}
                              </span>
                              <FontAwesomeIcon
                                icon={faChevronDown}
                                className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1"
                              />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] min-w-[420px]"
                            align="start"
                          >
                            <div className="space-y-6">
                              {/* Header */}
                              <div className="border-b pb-3">
                                <h3 className="font-semibold text-gray-900">Select Time Period</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Choose between specific seasons or a custom date range
                                </p>
                              </div>

                              {/* Mode Selection - Radio Buttons */}
                              <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="filterType"
                                      value="years"
                                      checked={filterType === "years"}
                                      onChange={() => setFilterType("years")}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Season Years</span>
                                  </label>
                                  <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="filterType"
                                      value="dateRange"
                                      checked={filterType === "dateRange"}
                                      onChange={() => setFilterType("dateRange")}
                                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Custom Date Range</span>
                                  </label>
                                </div>
                              </div>

                              {/* Content Area */}
                              <div className="min-h-[300px]">
                                {filterType === "years" ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">Available Seasons</h4>
                                      {selectedYears.length > 0 && (
                                        <button
                                          onClick={() => setSelectedYears([])}
                                          className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                          Clear Selection
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Years Display */}
                                    {selectedYears.length > 0 && (
                                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-sm font-medium text-green-900 mb-1">Selected Seasons</div>
                                        <div className="text-green-800">
                                          {selectedYears
                                            .sort((a, b) => Number.parseInt(b) - Number.parseInt(a))
                                            .join(", ")}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                          {selectedYears.length} season{selectedYears.length !== 1 ? "s" : ""} selected
                                        </div>
                                      </div>
                                    )}

                                    {/* Year Selection Grid */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-gray-700">Select Seasons (up to 5)</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {availableYears.map((year) => (
                                          <div key={year} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`year-${year}`}
                                              checked={selectedYears.includes(year)}
                                              onCheckedChange={() => handleYearToggle(year)}
                                              disabled={!selectedYears.includes(year) && selectedYears.length >= 5}
                                            />
                                            <label htmlFor={`year-${year}`} className="text-sm cursor-pointer flex-1">
                                              {year} Season
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                      {selectedYears.length >= 5 && (
                                        <div className="text-xs text-amber-600 mt-2">
                                          Maximum of 5 seasons can be selected
                                        </div>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t">
                                      <button
                                        onClick={() => setSelectedYears([...availableYears])}
                                        className="btn-secondary btn-sm w-full"
                                        disabled={selectedYears.length >= 5}
                                      >
                                        Select All Available
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">Select Date Range</h4>
                                      {dateRange.from && dateRange.to && (
                                        <button
                                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                                          className="text-xs text-red-600 hover:text-red-700 underline"
                                        >
                                          Clear Dates
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Date Range Display */}
                                    {dateRange.from && dateRange.to && (
                                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-sm font-medium text-green-900 mb-1">Selected Range</div>
                                        <div className="text-green-800">
                                          {format(dateRange.from, "MMMM dd, yyyy")} →{" "}
                                          {format(dateRange.to, "MMMM dd, yyyy")}
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                          {Math.ceil(
                                            (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24),
                                          )}{" "}
                                          days selected
                                        </div>
                                      </div>
                                    )}

                                    {/* Quick Preset Options */}
                                    <div className="space-y-2">
                                      <div className="text-sm font-medium text-gray-700">Quick Presets</div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {[
                                          { label: "Last 30 Days", days: 30 },
                                          { label: "Last 90 Days", days: 90 },
                                          { label: "Last 6 Months", days: 180 },
                                          { label: "Last Year", days: 365 },
                                        ].map((preset) => (
                                          <button
                                            key={preset.label}
                                            onClick={() => {
                                              const to = new Date()
                                              const from = new Date()
                                              from.setDate(from.getDate() - preset.days)
                                              setDateRange({ from, to })
                                            }}
                                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-left"
                                          >
                                            {preset.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Calendar */}
                                    <div className="border-t pt-4">
                                      <div className="text-sm font-medium text-gray-700 mb-3">Custom Selection</div>
                                      <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => {
                                          setDateRange({ from: range?.from, to: range?.to })
                                        }}
                                        numberOfMonths={1}
                                        initialFocus
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-xs text-gray-500">
                                  {filterType === "years"
                                    ? `${selectedYears.length} season${selectedYears.length !== 1 ? "s" : ""} selected`
                                    : dateRange.from && dateRange.to
                                      ? "Date range selected"
                                      : "No dates selected"}
                                </div>
                                <button
                                  onClick={() => {
                                    if (filterType === "years") {
                                      setSelectedYears([])
                                    } else {
                                      setDateRange({ from: undefined, to: undefined })
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Clear All
                                </button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Row 2: Secondary Filters - Collapsible */}
                    <div className="border-t pt-4 -mx-5">
                      <div className="px-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => setIsSecondaryFiltersExpanded(!isSecondaryFiltersExpanded)}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors border border-gray-200 w-full justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faChartLine} className="h-3 w-3" />
                                <span>Page Specific Metrics</span>
                              </div>
                              <FontAwesomeIcon
                                icon={isSecondaryFiltersExpanded ? faChevronUp : faChevronDown}
                                className="h-3 w-3"
                              />
                            </button>
                          </div>
                        </div>

                        {isSecondaryFiltersExpanded && (
                          <div className="grid grid-cols-2 gap-4">
                            {/* Comparison Dates */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comparison Dates
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-500">Select Comparison Dates</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-80">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-sm">Select Comparison Dates</div>
                                      {selectedComparisonDates.length > 0 && (
                                        <button onClick={clearAllComparisonDates} className="btn-tertiary btn-sm">
                                          Clear All
                                        </button>
                                      )}
                                    </div>

                                    {/* Selected Comparison Dates Tags */}
                                    {selectedComparisonDates.length > 0 && (
                                      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-md">
                                        {selectedComparisonDates.map((date) => (
                                          <Badge
                                            key={date}
                                            variant="secondary"
                                            className="flex items-center gap-1 text-xs"
                                          >
                                            {date}
                                            <button
                                              onClick={() => removeComparisonDate(date)}
                                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                                            >
                                              <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Comparison Date Options */}
                                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500">
                                      {COMPARISON_DATES_OPTIONS.map((date) => (
                                        <div key={date} className="flex items-center space-x-2">
                                          <input
                                            type="radio"
                                            id={`comparison-date-${date}`}
                                            name="comparison-date"
                                            checked={selectedComparisonDates.includes(date)}
                                            onChange={() => handleComparisonDateToggle(date)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                          />
                                          <label
                                            htmlFor={`comparison-date-${date}`}
                                            className="text-sm cursor-pointer flex-1"
                                          >
                                            {date}
                                          </label>
                                        </div>
                                      ))}
                                    </div>

                                    {selectedComparisonDates.length > 0 && (
                                      <div className="pt-2 border-t">
                                        <button
                                          onClick={() => setSelectedComparisonDates([])}
                                          className="btn-secondary btn-sm w-full"
                                        >
                                          Clear Selection
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Group By */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Group By
                                <FontAwesomeIcon icon={faFilter} className="h-3 w-3 ml-1 text-gray-400" />
                              </label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                    <span className="text-gray-700">{groupBy}</span>
                                    <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
                                  <div className="space-y-1">
                                    {GROUP_BY_OPTIONS.map((option) => (
                                      <button
                                        key={option}
                                        onClick={() => {
                                          setGroupBy(option)
                                          // Close the popover
                                          document.body.click()
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                          groupBy === option
                                            ? "bg-blue-100 text-blue-900"
                                            : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                      <button onClick={openSaveFilterDrawer} className="btn-secondary flex items-center gap-2">
                        <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                        Save Filter
                      </button>
                      <button onClick={openSavedFiltersDrawer} className="btn-secondary flex items-center gap-2">
                        <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
                        Saved Filters ({savedFilters.length})
                      </button>
                      <button onClick={clearAllFilters} className="btn-utility flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                        Clear All Filters
                      </button>
                      <button onClick={applyFilters} className="btn-primary flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                        Update Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Full-width divider */}
              <div className="w-screen relative -ml-6 border-b border-gray-200"></div>

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
                      <>
                        {/* Search and Filter Toolbar */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex-1 max-w-md">
                            <Input
                              type="text"
                              placeholder="Search Templates..."
                              value={searchQuery}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="h-10"
                            />
                          </div>
                          <div className="w-48">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="w-full flex items-center justify-between px-3 py-2 h-10 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                                  <span className="text-gray-700">{selectedCategory}</span>
                                  <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48" align="start">
                                <div className="space-y-1">
                                  {categories.map((category) => (
                                    <button
                                      key={category}
                                      onClick={() => handleCategoryChange(category)}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                        selectedCategory === category
                                          ? "bg-blue-100 text-blue-900"
                                          : "hover:bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {category}
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {/* Template Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                          {visibleTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 relative"
                            >
                              {/* Top right indicators */}
                              <div className="absolute top-3 right-3 flex items-center gap-2">
                                {/* Bookmark Button */}
                                <button
                                  onClick={() => handleBookmarkTemplate(template.id)}
                                  className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                                    bookmarkedTemplates.has(template.id)
                                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                  }`}
                                  title={bookmarkedTemplates.has(template.id) ? "Remove bookmark" : "Bookmark insight"}
                                >
                                  <FontAwesomeIcon
                                    icon={bookmarkedTemplates.has(template.id) ? faBookmark : faBookmarkRegular}
                                    className="h-3 w-3"
                                  />
                                </button>

                                {/* Seen/Generated Indicator */}
                                {generatedTemplates.has(template.id) && (
                                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                                    <FontAwesomeIcon icon={faEye} className="h-3 w-3 text-green-600" />
                                  </div>
                                )}
                              </div>

                              {/* Metrics Preview */}
                              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <div className="text-gray-500">SMV</div>
                                    <div className="font-semibold text-green-600">$2.4M</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Growth</div>
                                    <div className="font-semibold text-blue-600">+15.3%</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Impressions</div>
                                    <div className="font-semibold text-purple-600">1.2M</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-500">Insights</div>
                                    <div className="font-semibold text-orange-600">8</div>
                                  </div>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">{template.description}</p>

                                {/* Key Insights Preview */}
                                <div className="text-xs text-gray-500">
                                  <div className="font-medium mb-1">Key Insights:</div>
                                  <ul className="space-y-1">
                                    <li>• Top performing sponsor identified</li>
                                    <li>• 23% increase in engagement</li>
                                    <li>• Optimal placement recommendations</li>
                                  </ul>
                                </div>
                              </div>

                              {/* Category Badge */}
                              <div className="mb-4">
                                <Badge variant="secondary" className="text-xs">
                                  {template.category}
                                </Badge>
                                {bookmarkedTemplates.has(template.id) && (
                                  <Badge variant="outline" className="text-xs ml-2 border-yellow-300 text-yellow-700">
                                    Bookmarked
                                  </Badge>
                                )}
                              </div>

                              {/* Generate Insight Button */}
                              <button
                                onClick={() => {
                                  handleGenerateFromTemplate(template)
                                  handleUseTemplate(template)
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                              >
                                <FontAwesomeIcon icon={faMagicWandSparkles} className="h-4 w-4" />
                                Generate Insight
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeftIcon className="h-4 w-4" />
                              Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 text-gray-700 hover:border-blue-500"
                                }`}
                              >
                                {page}
                              </button>
                            ))}

                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Next
                              <ChevronRightIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Automated Insights Metrics Section */}
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
                  {/* Custom Insights Card */}
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
                      <div className="flex items-center gap-3">
                        {currentInsight && (
                          <>
                            <button
                              onClick={() => {
                                const newSavedInsight = {
                                  id: Date.now().toString(),
                                  dateGenerated: new Date(),
                                  insightType: "Custom Analysis",
                                  createdBy: "AI Assistant",
                                  query: chatHistory[chatHistory.length - 2]?.content || "",
                                  insight: currentInsight,
                                }
                                setSavedCustomInsights((prev) => [newSavedInsight, ...prev])
                              }}
                              className="btn-primary flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                              Save Generated Insight
                            </button>
                            <button
                              onClick={() => setShowRatingDrawer(true)}
                              className="btn-secondary flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                              Rate This Insight
                            </button>
                          </>
                        )}
                        <div className="text-sm text-gray-500">{savedCustomInsights.length} insights saved</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Chatbot Section */}
                      <div className="lg:col-span-2">
                        {/* Sticky Input */}
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-4 mb-4">
                          <div className="flex gap-2">
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
                              className="flex-1 py-3 text-sm"
                              disabled={isGenerating}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={!chatInput.trim() || isGenerating}
                              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isGenerating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Chat History */}
                        <div className="min-h-[400px] max-h-[600px] overflow-y-auto border rounded-lg bg-gray-50 p-4 space-y-3">
                          {chatHistory.length === 0 ? (
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
                                      style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                      className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                                      style={{ animationDelay: "0.2s" }}
                                    ></div>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Analyzing your data and generating insights...
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Generated Insight Display */}
                        {currentInsight && (
                          <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm">
                            <h4 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-3">
                              <div className="p-2 bg-yellow-100 rounded-lg">
                                <FontAwesomeIcon icon={faLightbulb} className="h-6 w-6 text-yellow-600" />
                              </div>
                              Generated Custom Insight
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              {/* Trending Metrics */}
                              <div className="space-y-3">
                                <h5 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                  <FontAwesomeIcon icon={faArrowTrendUp} className="h-4 w-4 text-green-600" />
                                  Trending Metrics
                                </h5>
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-600">SMV</span>
                                    <span className="font-medium text-green-700">
                                      +{currentInsight.trending?.smv || 25}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-600">Impressions</span>
                                    <span className="font-medium text-green-700">
                                      +{currentInsight.trending?.impressions || 18}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Engagement</span>
                                    <span className="font-medium text-green-700">
                                      +{currentInsight.trending?.engagement || 32}%
                                    </span>
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
                                    <span className="text-xs text-gray-600">Top Sponsor</span>
                                    <div className="font-medium text-blue-700">
                                      {currentInsight.topPerformers?.sponsor || "Nike"}
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-600">Best Platform</span>
                                    <div className="font-medium text-blue-700">
                                      {currentInsight.topPerformers?.platform || "Instagram"}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-600">Top Placement</span>
                                    <div className="font-medium text-blue-700">
                                      {currentInsight.topPerformers?.placement || "Jersey"}
                                    </div>
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
                                      ${currentInsight.keyMetrics?.totalSMV || 850}k
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-600">ROI</span>
                                    <span className="font-medium text-yellow-700">
                                      {currentInsight.keyMetrics?.roi || 245}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Reach</span>
                                    <span className="font-medium text-yellow-700">
                                      {currentInsight.keyMetrics?.reach || 2.4}M
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Chart Placeholder */}
                            {/* Replace the Chart Placeholder section with actual charts */}
                            <div className="mt-6 space-y-4">
                              <h5 className="font-semibold text-gray-700 mb-2">Performance Visualization</h5>

                              {/* Tabs for chart types */}
                              <div className="flex items-center space-x-2 mb-4">
                                <button
                                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    chartType === "bar"
                                      ? "bg-blue-100 text-blue-700 font-medium"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                  onClick={() => setChartType("bar")}
                                >
                                  <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 mr-2" />
                                  Bar Chart
                                </button>
                                <button
                                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    chartType === "line"
                                      ? "bg-blue-100 text-blue-700 font-medium"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                  onClick={() => setChartType("line")}
                                >
                                  <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 mr-2" />
                                  Line Chart
                                </button>
                              </div>

                              {/* Chart container */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="h-80">
                                  <ChartContainer
                                    config={{
                                      smv: {
                                        label: "SMV ($k)",
                                        color: "#4F8EF7",
                                      },
                                      impressions: {
                                        label: "Impressions (MM)",
                                        color: "#6BA3F8",
                                      },
                                      engagement: {
                                        label: "Engagement (%)",
                                        color: "#87B8F9",
                                      },
                                    }}
                                    className="h-full w-full"
                                  >
                                    <ResponsiveContainer width="100%" height="100%">
                                      {chartType === "bar" ? (
                                        <BarChart
                                          data={generateChartData(currentInsight)}
                                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                          barCategoryGap="20%"
                                        >
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis
                                            dataKey="month"
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
                                            formatter={(value, name) => {
                                              if (name === "SMV ($k)") return [`$${value}k`, name]
                                              if (name === "Impressions (MM)") return [`${value}MM`, name]
                                              if (name === "Engagement (%)") return [`${value}%`, name]
                                              return [value, name]
                                            }}
                                          />
                                          <Legend />
                                          <Bar dataKey="smv" fill="#4F8EF7" name="SMV ($k)" radius={[4, 4, 0, 0]} />
                                          <Bar
                                            dataKey="impressions"
                                            fill="#6BA3F8"
                                            name="Impressions (MM)"
                                            radius={[4, 4, 0, 0]}
                                          />
                                          <Bar
                                            dataKey="engagement"
                                            fill="#87B8F9"
                                            name="Engagement (%)"
                                            radius={[4, 4, 0, 0]}
                                          />
                                        </BarChart>
                                      ) : (
                                        <LineChart
                                          data={generateChartData(currentInsight)}
                                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis
                                            dataKey="month"
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
                                            formatter={(value, name) => {
                                              if (name === "SMV ($k)") return [`$${value}k`, name]
                                              if (name === "Impressions (MM)") return [`${value}MM`, name]
                                              if (name === "Engagement (%)") return [`${value}%`, name]
                                              return [value, name]
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
                                          />
                                          <Line
                                            type="monotone"
                                            dataKey="impressions"
                                            stroke="#6BA3F8"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            name="Impressions (MM)"
                                          />
                                          <Line
                                            type="monotone"
                                            dataKey="engagement"
                                            stroke="#87B8F9"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            name="Engagement (%)"
                                          />
                                        </LineChart>
                                      )}
                                    </ResponsiveContainer>
                                  </ChartContainer>
                                </div>

                                <div className="mt-4 text-xs text-gray-500">
                                  <div className="font-medium mb-1">Chart Information:</div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>SMV: Social Media Value in thousands ($k)</div>
                                    <div>Impressions: Values shown in millions (MM)</div>
                                    <div>Engagement: Percentage of audience engagement</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Recommendations */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                              <h5 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4 text-yellow-600" />
                                AI Recommendations
                              </h5>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                <li>Increase investment in top-performing sponsor partnerships</li>
                                <li>Optimize placement strategy for maximum visibility</li>
                                <li>Focus marketing efforts on high-engagement platforms</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prompt Tags Section */}
                      <div className="space-y-6">
                        {/* Recent Queries */}
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
                                onClick={() => handlePromptClick(query)}
                                className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-gray-200"
                              >
                                {query}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Popular Searches */}
                        <div className="border rounded-lg p-4 bg-white">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-500" />
                            Popular Searches
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {["SMV trends", "Platform comparison", "Sponsor performance", "ROI analysis"].map(
                              (search, index) => (
                                <button
                                  key={index}
                                  onClick={() => handlePromptClick(search)}
                                  className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-colors border border-blue-200 hover:border-blue-300"
                                >
                                  {search}
                                </button>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Evaluation Searches */}
                        <div className="border rounded-lg p-4 bg-white">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartColumn} className="h-4 w-4 text-gray-500" />
                            Evaluation Searches
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {["MVP% Evaluation", "YoY Benchmarking", "Performance Metrics", "Engagement Analysis"].map(
                              (search, index) => (
                                <button
                                  key={index}
                                  onClick={() => handlePromptClick(search)}
                                  className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full transition-colors border border-purple-200 hover:border-purple-300"
                                >
                                  {search}
                                </button>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Persona-Driven Prompts */}
                        <div className="border rounded-lg p-4 bg-white">
                          <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-gray-500" />
                            Persona-Driven Prompts
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-2">Rightsholders</div>
                              <div className="flex flex-wrap gap-1">
                                {["Revenue optimization insights", "Fan engagement metrics"].map((prompt, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded transition-colors"
                                  >
                                    {prompt}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-2">Brands</div>
                              <div className="flex flex-wrap gap-1">
                                {["Brand visibility analysis", "Sponsorship ROI insights"].map((prompt, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="px-2 py-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded transition-colors"
                                  >
                                    {prompt}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-2">Agencies</div>
                              <div className="flex flex-wrap gap-1">
                                {["Campaign performance", "Media planning insights"].map((prompt, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors"
                                  >
                                    {prompt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saved Generated Insights Table */}
                  {savedCustomInsights.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Saved Generated Insights</h3>
                        <button
                          onClick={() => setShowAllInsightsModal(true)}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                          View All Data Insights
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Generated</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Insight Type</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Created By</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Insight Query</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {savedCustomInsights.slice(0, 5).map((insight) => (
                              <tr key={insight.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {insight.dateGenerated.toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">{insight.insightType}</td>
                                <td className="py-3 px-4 text-sm text-gray-900">{insight.createdBy}</td>
                                <td className="py-3 px-4">
                                  <Badge variant="secondary" className="text-xs">
                                    {insight.query.length > 50 ? `${insight.query.substring(0, 50)}...` : insight.query}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                                    <button className="text-gray-600 hover:text-gray-800 text-sm">Edit</button>
                                    <button
                                      onClick={() =>
                                        setSavedCustomInsights((prev) => prev.filter((i) => i.id !== insight.id))
                                      }
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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

          {/* Save Filter Drawer */}
          {showSaveFilterDrawer && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${saveFilterDrawerAnimating ? "bg-opacity-50" : "bg-opacity-0"}`}
                onClick={closeSaveFilterDrawer}
              ></div>
              <div
                className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ease-out ${saveFilterDrawerAnimating ? "translate-x-0" : "translate-x-full"}`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingFilterId ? "Edit Filter" : "Save Filter"}
                    </h2>
                    <button onClick={closeSaveFilterDrawer} className="text-gray-400 hover:text-gray-600">
                      <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter Name</label>
                      <Input
                        type="text"
                        value={filterNameToSave}
                        onChange={(e) => setFilterNameToSave(e.target.value)}
                        placeholder="Enter filter name"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                      <textarea
                        value={filterDescriptionToSave}
                        onChange={(e) => setFilterDescriptionToSave(e.target.value)}
                        placeholder="Enter filter description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                            <span className="text-gray-700">{filterCategoryToSave}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-gray-400" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]" align="start" side="bottom">
                          <div className="space-y-1">
                            {FILTER_CATEGORIES.map((category) => (
                              <button
                                key={category}
                                onClick={() => {
                                  setFilterCategoryToSave(category)
                                  // Close the popover automatically
                                  const popoverTrigger = document.querySelector('[data-state="open"]')
                                  if (popoverTrigger) {
                                    ;(popoverTrigger as HTMLElement).click()
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                  filterCategoryToSave === category
                                    ? "bg-blue-100 text-blue-900"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex gap-3">
                        <button
                          onClick={closeSaveFilterDrawer}
                          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveCurrentFilters}
                          disabled={!filterNameToSave.trim()}
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingFilterId ? "Update Filter" : "Save Filter"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saved Filters Drawer */}
          {showSavedFiltersDrawer && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${savedFiltersDrawerAnimating ? "bg-opacity-50" : "bg-opacity-0"}`}
                onClick={closeSavedFiltersDrawer}
              ></div>
              <div
                className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ease-out ${savedFiltersDrawerAnimating ? "translate-x-0" : "translate-x-full"}`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Saved Filters</h2>
                    <button onClick={closeSavedFiltersDrawer} className="text-gray-400 hover:text-gray-600">
                      <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <Input
                      type="text"
                      value={filterCategorySearch}
                      onChange={(e) => setFilterCategorySearch(e.target.value)}
                      placeholder="Search saved filters..."
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredSavedFilters.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No saved filters found</p>
                      </div>
                    ) : (
                      filteredSavedFilters.map((filter) => (
                        <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-gray-900">{filter.name}</h3>
                              {filter.description && <p className="text-sm text-gray-600 mt-1">{filter.description}</p>}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => editSavedFilter(filter)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSavedFilter(filter.id)}
                                className="text-red-600 hover:text-red-800 text-sm ml-2"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <Badge variant="outline" className="mr-2">
                                {filter.category}
                              </Badge>
                              {format(filter.createdAt, "MMM dd, yyyy")}
                            </div>
                            <button
                              onClick={() => applySavedFilter(filter)}
                              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scorecard Drawer */}
          {showScorecardDrawer && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ease-out ${scorecardDrawerAnimating ? "bg-opacity-50" : "bg-opacity-0"}`}
                onClick={closeScorecardDrawer}
              ></div>
              <div
                className={`absolute right-0 top-0 h-full w-[800px] bg-white shadow-xl transition-transform duration-300 ease-out ${scorecardDrawerAnimating ? "translate-x-0" : "translate-x-full"} overflow-y-auto`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Team Scorecard</h2>
                    <button onClick={closeScorecardDrawer} className="text-gray-400 hover:text-gray-600">
                      <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Header Buttons */}
                  <div className="flex items-center gap-3 mb-6">
                    <button className="btn-secondary flex items-center gap-2">
                      Create Report
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                      View More Info at Relo Outcomes
                    </button>
                  </div>

                  {/* Team Header with Logo */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">SPURS</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">{scorecardData.teamName} - Sample Surveyed: {scorecardData.sampleSurveyed}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Main Metrics Row */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <h4 className="font-semibold text-blue-700 mb-2">Opportunity Rank</h4>
                      <div className="text-3xl font-bold text-blue-600">#{scorecardData.opportunityRank}</div>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-blue-700 mb-2">Opportunity Score</h4>
                      <div className="text-3xl font-bold text-blue-600">{scorecardData.opportunityScore}</div>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-blue-700 mb-2">Opportunity Value</h4>
                      <div className="text-3xl font-bold text-blue-600">{scorecardData.opportunityValue}</div>
                    </div>
                  </div>

                  {/* Total Annual Property Reach Label */}
                  <div className="mb-4">
                    <div className="inline-block bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium">
                      Total Annual Property Reach
                    </div>
                  </div>

                  {/* Total Fans Surveyed */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-blue-700 mb-3 pb-2 border-b-2 border-blue-600">
                      <span className="flex items-center gap-2">
                        Total Fans Surveyed
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-blue-600">i</span>
                        </div>
                      </span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-2">
                        <FontAwesomeIcon icon={faUsers} className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Engagement</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-700 text-lg">{scorecardData.totalFansSurveyed.engagement}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-400 h-4 rounded-full" 
                            style={{ width: `${scorecardData.totalFansSurveyed.engagement}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  <hr className="border-gray-300 mb-6" />

                  {/* Behavior and Interest */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-blue-700 mb-3 pb-2 border-b-2 border-blue-600">
                      <span className="flex items-center gap-2">
                        Behavior & Interest
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-blue-600">i</span>
                        </div>
                      </span>
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Intensity</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-700 text-lg">{scorecardData.behaviorAndInterest.intensity}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-400 h-4 rounded-full" 
                              style={{ width: `${scorecardData.behaviorAndInterest.intensity}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <FontAwesomeIcon icon={faArrowTrendUp} className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Momentum</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-700 text-lg">{scorecardData.behaviorAndInterest.momentum}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-400 h-4 rounded-full" 
                              style={{ width: `${scorecardData.behaviorAndInterest.momentum}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  <hr className="border-gray-300 mb-6" />

                  {/* Potential Sponsor Impact */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-blue-700 mb-3 pb-2 border-b-2 border-blue-600">
                      <span className="flex items-center gap-2">
                        Potential Sponsor Impact
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-blue-600">i</span>
                        </div>
                      </span>
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <FontAwesomeIcon icon={faLightbulb} className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Consideration</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-700 text-lg">{scorecardData.potentialSponsorImpact.consideration}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-400 h-4 rounded-full" 
                              style={{ width: `${scorecardData.potentialSponsorImpact.consideration}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <FontAwesomeIcon icon={faStar} className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Favorability</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-700 text-lg">{scorecardData.potentialSponsorImpact.favorability}%</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-400 h-4 rounded-full" 
                              style={{ width: `${scorecardData.potentialSponsorImpact.favorability}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  <hr className="border-gray-300 mb-6" />

                  {/* Survey Scores Button */}
                  <div className="mb-6">
                    <button onClick={openSurveyScoresDrawer} className="btn-primary flex items-center gap-2">
                      View Survey Scores
                    </button>
                  </div>

                  {/* Horizontal Divider */}
                  <hr className="border-gray-300 mb-6" />

                  {/* Teams Data Table */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-blue-700 mb-3 pb-2 border-b-2 border-blue-600">
                      <span className="flex items-center gap-2">
                        Teams Data
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-blue-600">i</span>
                        </div>
                      </span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Rightsholder</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Brand</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Region</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Aided Sponsorship Awareness</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Net More Favorable</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Increase Consideration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scorecardData.teamsData.map((team, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">{team.rightsholder}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{team.brand}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{team.region}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{team.aidedSponsorshipAwareness}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{team.netMoreFavorable}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">{team.netIncreaseConsideration}</td>
                            </tr>
                          ))}
                        </tbody>
